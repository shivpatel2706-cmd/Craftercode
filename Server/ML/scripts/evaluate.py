"""Evaluation CLI script for assessing serialized Legal Metrology ML models on a test dataset."""
import argparse
import json
import sys
from pathlib import Path
import joblib
import pandas as pd
from catboost import CatBoostClassifier

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.data.feature_engineering import engineer_features
from src.data.preprocess import MetrologyDataPreprocessor
from src.models.evaluate import evaluate_classifier
from src.utils.logger import get_logger

logger = get_logger("evaluate_script")


def evaluate_saved_model(
    test_data_path: Path,
    models_dir: Path,
    output_dir: Path,
) -> None:
    """Evaluates the saved model bundle against a test dataset CSV."""
    logger.info(f"Loading test dataset from '{test_data_path}'...")
    df = pd.read_csv(test_data_path)

    fe_df = engineer_features(df)
    
    preprocessor = MetrologyDataPreprocessor.load(models_dir / "preprocessor.joblib")
    
    model_path = models_dir / "catboost_model.cbm"
    calibrated_path = models_dir / "calibrated_classifier.joblib"

    if not model_path.exists():
        raise FileNotFoundError(f"Model artifact not found at {model_path}. Please run scripts/train.py first.")

    catboost_model = CatBoostClassifier()
    catboost_model.load_model(str(model_path))

    X_test_cb = preprocessor.transform_catboost(fe_df)
    y_test = fe_df["verification_result"]

    output_dir.mkdir(parents=True, exist_ok=True)
    plots_dir = output_dir.parent / "plots"
    plots_dir.mkdir(parents=True, exist_ok=True)

    logger.info("Evaluating base CatBoostClassifier...")
    base_metrics = evaluate_classifier(
        catboost_model,
        X_test_cb,
        y_test,
        model_name="CatBoost_Evaluation",
        output_dir=plots_dir,
    )

    eval_results = {"base_catboost_metrics": base_metrics}

    if calibrated_path.exists():
        logger.info("Evaluating Calibrated Classifier...")
        calibrated_model = joblib.load(calibrated_path)
        cal_metrics = evaluate_classifier(
            calibrated_model,
            X_test_cb,
            y_test,
            model_name="Calibrated_Classifier_Evaluation",
            output_dir=plots_dir,
        )
        eval_results["calibrated_metrics"] = cal_metrics

    out_file = output_dir / "independent_evaluation_metrics.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(eval_results, f, indent=2)

    print("\n" + "=" * 70)
    print("           INDEPENDENT MODEL EVALUATION REPORT")
    print("=" * 70)
    print(f"Test Records:           {len(df)}")
    print(f"Accuracy:               {base_metrics['accuracy']:.4f}")
    print(f"F1 Score:               {base_metrics['f1_score']:.4f}")
    print(f"ROC-AUC:                {base_metrics['roc_auc'] or 0.0:.4f}")
    print(f"FALSE PASS RATE:        {base_metrics['false_pass_rate']:.4f}  <-- CRITICAL SAFETY METRIC")
    print(f"FALSE FAIL RATE:        {base_metrics['false_fail_rate']:.4f}")
    print("=" * 70)
    print(f"Detailed metrics saved to: {out_file}\n")


def main():
    parser = argparse.ArgumentParser(description="Evaluate serialized model on a test CSV file.")
    parser.add_argument(
        "--data",
        type=str,
        default="data/synthetic/synthetic_verifications.csv",
        help="Path to evaluation test CSV dataset",
    )
    parser.add_argument(
        "--models-dir",
        type=str,
        default="models",
        help="Path to directory containing saved model artifacts",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="reports/metrics",
        help="Directory to write output metric JSON reports",
    )
    args = parser.parse_args()

    evaluate_saved_model(
        test_data_path=PROJECT_ROOT / args.data,
        models_dir=PROJECT_ROOT / args.models_dir,
        output_dir=PROJECT_ROOT / args.output_dir,
    )


if __name__ == "__main__":
    main()
