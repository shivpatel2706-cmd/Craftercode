"""Core prediction and decision support engine for Legal Metrology Verification."""
from pathlib import Path
from typing import Any, Dict, List, Optional
import json
import joblib
import pandas as pd
from catboost import CatBoostClassifier
from src.data.feature_engineering import engineer_features
from src.data.preprocess import MetrologyDataPreprocessor
from src.data.validate_dataset import validate_verification_record
from src.explainability.shap_explainer import MetrologyShapExplainer
from src.rules.rules_engine import RegulatoryRulesEngine
from src.utils.logger import get_logger

logger = get_logger("predictor")

DEFAULT_MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "models"


class VerificationPredictor:
    """
    Coordinates Data Validation, Feature Engineering, Regulatory Rules Engine,
    Calibrated ML Model, SHAP Explainability, and Decision Policy Arbitration.
    """

    def __init__(self, model_dir: Optional[Path | str] = None, config: Optional[Dict] = None):
        self.model_dir = Path(model_dir) if model_dir else DEFAULT_MODEL_DIR
        self.config = config or {}
        
        self.rules_engine = RegulatoryRulesEngine()
        self.preprocessor: Optional[MetrologyDataPreprocessor] = None
        self.primary_model: Optional[CatBoostClassifier] = None
        self.calibrated_model: Optional[Any] = None
        self.shap_explainer: Optional[MetrologyShapExplainer] = None
        self.metadata: Dict[str, Any] = {}
        
        self.load_artifacts()

    def load_artifacts(self) -> None:
        """Loads serialized model, preprocessor, SHAP explainer, and metadata."""
        preprocessor_path = self.model_dir / "preprocessor.joblib"
        model_path = self.model_dir / "catboost_model.cbm"
        calibrated_path = self.model_dir / "calibrated_classifier.joblib"
        metadata_path = self.model_dir / "model_metadata.json"
        shap_path = self.model_dir / "shap_explainer.joblib"

        if preprocessor_path.exists():
            self.preprocessor = MetrologyDataPreprocessor.load(preprocessor_path)
        if model_path.exists():
            self.primary_model = CatBoostClassifier()
            self.primary_model.load_model(str(model_path))
        if calibrated_path.exists():
            self.calibrated_model = joblib.load(calibrated_path)
        if shap_path.exists():
            self.shap_explainer = MetrologyShapExplainer.load(shap_path)
        if metadata_path.exists():
            with open(metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

    @property
    def model_version(self) -> str:
        return self.metadata.get("model_version", "1.0.0")

    def predict_verification(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes complete verification decision workflow:
        1. Sanity validation
        2. Regulatory Rules Engine assessment
        3. Feature engineering
        4. Calibrated ML prediction & Risk scoring
        5. Local SHAP factor attribution
        6. Configurable decision policy arbitration
        """
        # Step 1: Input Sanity & Missing Value Verification
        is_valid, validation_errors = validate_verification_record(input_data)
        
        # Calculate missing fields ratio against mandatory set
        mandatory_fields = [
            "instrument_type", "accuracy_class", "capacity", "scale_interval",
            "reference_load_1", "observed_reading_1",
            "reference_load_2", "observed_reading_2",
            "reference_load_3", "observed_reading_3",
            "repeatability_reading_1", "center_reading", "initial_zero", "final_zero",
        ]
        missing_mandatory = [f for f in mandatory_fields if input_data.get(f) is None]
        missing_ratio = len(missing_mandatory) / len(mandatory_fields)

        # Step 2: Evaluate Regulatory Rules Engine
        rules_eval = self.rules_engine.evaluate(input_data)
        rules_result = rules_eval["overall_rule_result"]

        # If data is invalid or missing critical fields beyond threshold, trigger REVIEW_REQUIRED
        max_missing_ratio = self.config.get("max_missing_feature_ratio", 0.15)
        if not is_valid or missing_ratio > max_missing_ratio or rules_result == "REVIEW_REQUIRED":
            return {
                "prediction": "REVIEW_REQUIRED",
                "confidence": 0.0,
                "risk_score": 0.5,
                "rules_engine_result": rules_result,
                "final_result": "REVIEW_REQUIRED",
                "model_version": self.model_version,
                "status_reason": "Missing or invalid required verification data. Manual inspector review required.",
                "validation_errors": validation_errors,
                "missing_fields": missing_mandatory,
                "rule_violations": rules_eval.get("violations", []),
                "explanation": [],
            }

        # Step 3: Feature Engineering
        engineered_dict = engineer_features(input_data)
        df_single = pd.DataFrame([engineered_dict])

        # Step 4: ML Prediction & Risk Scoring
        if self.preprocessor is None or self.primary_model is None:
            # Fallback if model not trained yet
            return {
                "prediction": rules_result,
                "confidence": 0.5,
                "risk_score": 0.5,
                "rules_engine_result": rules_result,
                "final_result": rules_result,
                "model_version": self.model_version,
                "status_reason": "Model artifacts not loaded. Defaulted to rules engine.",
                "explanation": [],
            }

        X_cb = self.preprocessor.transform_catboost(df_single)

        # Risk score calculation: Probability of FAIL
        # Use calibrated model if available, else primary model
        inference_model = self.calibrated_model or self.primary_model
        try:
            probs = inference_model.predict_proba(X_cb)[0]
            classes = list(getattr(inference_model, "classes_", ["PASS", "FAIL"]))
            if "FAIL" in classes:
                fail_idx = classes.index("FAIL")
                pass_idx = classes.index("PASS")
                risk_score = float(probs[fail_idx])
                confidence = float(max(probs[fail_idx], probs[pass_idx]))
                ml_prediction = "FAIL" if risk_score >= 0.5 else "PASS"
            else:
                risk_score = float(probs[1])
                confidence = float(max(probs[0], probs[1]))
                ml_prediction = "FAIL" if risk_score >= 0.5 else "PASS"
        except Exception as e:
            logger.error(f"Inference prediction error: {e}")
            risk_score = 0.5
            confidence = 0.5
            ml_prediction = rules_result

        # Step 5: SHAP Local Explanation
        explanations: List[Dict[str, Any]] = []
        if self.shap_explainer is not None:
            try:
                explanations = self.shap_explainer.explain_instance(X_cb, top_k=5)
            except Exception as e:
                logger.warning(f"Could not compute SHAP instance explanation: {e}")

        # Step 6: Configurable Decision Policy Arbitration
        # POLICY:
        # 1. Missing mandatory data -> REVIEW_REQUIRED
        # 2. rules_engine_result == FAIL -> FAIL (ML CANNOT override regulatory FAIL)
        # 3. rules_engine_result == PASS AND ml_prediction == PASS AND risk_score < threshold -> PASS
        # 4. Otherwise (e.g. Rules PASS but ML flags high risk/anomaly) -> REVIEW_REQUIRED
        risk_threshold_pass = self.config.get("risk_threshold_pass", 0.40)
        confidence_threshold = self.config.get("confidence_threshold", 0.70)

        if rules_result == "FAIL":
            final_result = "FAIL"
            decision_note = "Regulatory Rules Engine determined violation. Model cannot override statutory failure."
        elif rules_result == "PASS" and ml_prediction == "PASS" and risk_score < risk_threshold_pass:
            final_result = "PASS"
            decision_note = "Instrument compliant with regulatory rules and validated by decision support model."
        elif rules_result == "PASS" and (ml_prediction == "FAIL" or risk_score >= risk_threshold_pass):
            final_result = "REVIEW_REQUIRED"
            decision_note = (
                "Rules Engine passed measurements, but ML decision support detected statistical "
                f"risk/anomaly (risk_score={risk_score:.2f}). Flagged for supervisory verification."
            )
        else:
            final_result = "REVIEW_REQUIRED"
            decision_note = "Borderline compliance or low model confidence. Discretionary verification required."

        return {
            "prediction": ml_prediction,
            "confidence": round(confidence, 2),
            "risk_score": round(risk_score, 2),
            "rules_engine_result": rules_result,
            "final_result": final_result,
            "model_version": self.model_version,
            "decision_note": decision_note,
            "rule_violations": rules_eval.get("violations", []),
            "explanation": explanations,
        }
