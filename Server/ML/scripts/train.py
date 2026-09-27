"""End-to-end training, comparative evaluation, calibration, and artifact export script."""
import argparse
import json
import sys
from pathlib import Path
import yaml
import pandas as pd

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.data.generate_dataset import generate_synthetic_dataset
from src.data.validate_dataset import validate_dataset_dataframe
from src.data.feature_engineering import engineer_features
from src.data.preprocess import MetrologyDataPreprocessor, split_metrology_dataset
from src.models.train_catboost import train_catboost_model
from src.models.train_random_forest import train_random_forest_model
from src.models.calibration import calibrate_model
from src.models.evaluate import evaluate_classifier, compare_models
from src.explainability.shap_explainer import MetrologyShapExplainer
from src.utils.logger import get_logger

logger = get_logger("train_pipeline")


def run_training_pipeline(
    data_path: Path | None = None,
    config_path: Path | None = None,
    num_rows: int = 10000,
    seed: int = 42,
) -> None:
    """Executes the full machine learning training workflow."""
    cfg_file = config_path or (PROJECT_ROOT / "config" / "model_config.yaml")
    with open(cfg_file, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    # Output directories
    models_dir = PROJECT_ROOT / "models"
    reports_metrics = PROJECT_ROOT / "reports" / "metrics"
    reports_plots = PROJECT_ROOT / "reports" / "plots"
    reports_expl = PROJECT_ROOT / "reports" / "explanations"
    data_synthetic = PROJECT_ROOT / "data" / "synthetic"
    
    for d in [models_dir, reports_metrics, reports_plots, reports_expl, data_synthetic]:
        d.mkdir(parents=True, exist_ok=True)

    # 1. Dataset Generation or Loading
    if data_path and Path(data_path).exists():
        logger.info(f"Loading existing dataset from '{data_path}'...")
        raw_df = pd.read_csv(data_path)
    else:
        logger.info(f"Generating {num_rows} synthetic records (seed={seed})...")
        raw_df = generate_synthetic_dataset(num_rows=num_rows, seed=seed)
        save_csv_path = data_synthetic / "synthetic_verifications.csv"
        raw_df.to_csv(save_csv_path, index=False)
        logger.info(f"Saved synthetic dataset to '{save_csv_path}'")

    # 2. Dataset Validation & Sanity
    clean_df, audit_report = validate_dataset_dataframe(raw_df)
    with open(reports_metrics / "data_validation_report.json", "w", encoding="utf-8") as f:
        json.dump(audit_report, f, indent=2)

    # 3. Feature Engineering
    logger.info("Computing derived metrological features...")
    fe_df = engineer_features(clean_df)

    # 4. Stratified / Grouped Split
    split_cfg = config.get("split", {})
    train_df, val_df, test_df = split_metrology_dataset(
        fe_df,
        test_size=split_cfg.get("test_size", 0.15),
        val_size=split_cfg.get("val_size", 0.15),
        random_state=seed,
        group_by_instrument=split_cfg.get("group_by_instrument", False),
        group_col=split_cfg.get("grouping_column", "instrument_id"),
        target_col="verification_result",
    )

    # 5. Preprocessing & Encoding
    preprocessor = MetrologyDataPreprocessor(config)
    preprocessor.fit(train_df)
    preprocessor.save(models_dir / "preprocessor.joblib")

    # Transform partitions for CatBoost
    X_train_cb = preprocessor.transform_catboost(train_df)
    X_val_cb = preprocessor.transform_catboost(val_df)
    X_test_cb = preprocessor.transform_catboost(test_df)

    y_train = train_df["verification_result"]
    y_val = val_df["verification_result"]
    y_test = test_df["verification_result"]

    # Transform partitions for Random Forest Baseline
    X_train_rf = preprocessor.transform_rf(train_df)
    X_val_rf = preprocessor.transform_rf(val_df)
    X_test_rf = preprocessor.transform_rf(test_df)

    # 6. Train Primary Model: CatBoostClassifier
    logger.info("Step 6: Training primary CatBoostClassifier...")
    cb_model, cb_meta = train_catboost_model(
        X_train=X_train_cb,
        y_train=y_train,
        X_val=X_val_cb,
        y_val=y_val,
        categorical_features=preprocessor.categorical_cols,
        config=config.get("catboost", {}),
    )
    cb_model.save_model(str(models_dir / "catboost_model.cbm"))

    # 7. Train Baseline Model: RandomForestClassifier
    logger.info("Step 7: Training baseline RandomForestClassifier...")
    rf_model, rf_meta = train_random_forest_model(
        X_train=X_train_rf,
        y_train=y_train.values,
        feature_names=preprocessor.all_feature_cols,
        config=config.get("random_forest", {}),
    )
    import joblib
    joblib.dump(rf_model, models_dir / "baseline_rf.joblib")

    # 8. Model Evaluation & Comparison on Validation Set
    logger.info("Step 8: Comparing models on validation set...")
    val_cb_metrics = evaluate_classifier(cb_model, X_val_cb, y_val, model_name="CatBoost_Val")
    val_rf_metrics = evaluate_classifier(rf_model, X_val_rf, y_val, model_name="RandomForest_Val")

    selected_model_name, comparison_table = compare_models(val_cb_metrics, val_rf_metrics)
    with open(reports_metrics / "model_comparison_val.json", "w", encoding="utf-8") as f:
        json.dump(comparison_table, f, indent=2)

    # 9. Probability Calibration
    logger.info("Step 9: Calibrating probabilities on validation set...")
    calibrated_cb = calibrate_model(
        model=cb_model,
        X_val=X_val_cb,
        y_val=y_val,
        method=config.get("calibration", {}).get("method", "sigmoid"),
    )
    joblib.dump(calibrated_cb, models_dir / "calibrated_classifier.joblib")

    # 10. Comprehensive Final Evaluation on Test Set
    logger.info("Step 10: Evaluating final models on unseen Test Set...")
    test_cb_metrics = evaluate_classifier(
        cb_model,
        X_test_cb,
        y_test,
        model_name="CatBoost_Test",
        output_dir=reports_plots,
    )
    test_cal_metrics = evaluate_classifier(
        calibrated_cb,
        X_test_cb,
        y_test,
        model_name="Calibrated_CatBoost_Test",
        output_dir=reports_plots,
    )
    test_rf_metrics = evaluate_classifier(
        rf_model,
        X_test_rf,
        y_test,
        model_name="RandomForest_Test",
        output_dir=reports_plots,
    )

    final_eval_summary = {
        "test_catboost_metrics": test_cb_metrics,
        "test_calibrated_catboost_metrics": test_cal_metrics,
        "test_random_forest_metrics": test_rf_metrics,
        "selected_primary_model": selected_model_name,
    }
    with open(reports_metrics / "test_evaluation_summary.json", "w", encoding="utf-8") as f:
        json.dump(final_eval_summary, f, indent=2)

    # 11. SHAP Global Explainability
    logger.info("Step 11: Computing SHAP feature attributions...")
    explainer = MetrologyShapExplainer(cb_model, feature_names=list(X_train_cb.columns))
    sample_background = X_val_cb.sample(n=min(200, len(X_val_cb)), random_state=seed)
    explainer.fit(cb_model, background_sample=sample_background)
    explainer.save(models_dir / "shap_explainer.joblib")

    sample_test_shap = X_test_cb.sample(n=min(300, len(X_test_cb)), random_state=seed)
    global_shap_importance = explainer.explain_global(sample_test_shap, output_dir=reports_plots)
    with open(reports_expl / "global_shap_importance.json", "w", encoding="utf-8") as f:
        json.dump(global_shap_importance, f, indent=2)

    # 12. Save Model Metadata
    metadata = {
        "model_name": "Legal Metrology Verification Engine",
        "model_version": config.get("model_version", "1.0.0"),
        "primary_model_type": "CatBoostClassifier",
        "baseline_model_type": "RandomForestClassifier",
        "num_training_samples": len(train_df),
        "num_validation_samples": len(val_df),
        "num_test_samples": len(test_df),
        "features": list(X_train_cb.columns),
        "test_metrics": test_cal_metrics,
        "calibration_method": config.get("calibration", {}).get("method", "sigmoid"),
        "leakage_prevention": (
            "Stratified partitioning with option for StratifiedGroupKFold on instrument_id to guarantee "
            "that historical multi-inspection records of a single instrument never span multiple splits."
        ),
    }
    with open(models_dir / "model_metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Print Clean Console Summary
    print("\n" + "=" * 80)
    print("        LEGAL METROLOGY ML ENGINE: TRAINING PIPELINE COMPLETE")
    print("=" * 80)
    print(f"Dataset Size:         {len(clean_df)} records")
    print(f"Primary Model:        CatBoost (with Sigmoid Probability Calibration)")
    print(f"Baseline Model:       RandomForestClassifier")
    print("-" * 80)
    print(f"CatBoost Test Accuracy:     {test_cb_metrics['accuracy']:.4f}")
    print(f"CatBoost Test F1 Score:     {test_cb_metrics['f1_score']:.4f}")
    print(f"CatBoost Test ROC-AUC:      {test_cb_metrics['roc_auc'] or 0.0:.4f}")
    print(f"CatBoost FALSE PASS RATE:   {test_cb_metrics['false_pass_rate']:.4f} (Crucial Safety Metric)")
    print(f"CatBoost FALSE FAIL RATE:   {test_cb_metrics['false_fail_rate']:.4f}")
    print("-" * 80)
    print(f"RandomForest Test Accuracy: {test_rf_metrics['accuracy']:.4f}")
    print(f"RandomForest Test F1:       {test_rf_metrics['f1_score']:.4f}")
    print(f"RandomForest FALSE PASS:    {test_rf_metrics['false_pass_rate']:.4f}")
    print(f"RandomForest FALSE FAIL:    {test_rf_metrics['false_fail_rate']:.4f}")
    print("=" * 80)
    print(f"Model Artifacts Saved In:   {models_dir}")
    print(f"Reports & Plots Saved In:   {reports_plots}")
    print("=" * 80 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Train and evaluate Legal Metrology ML Models.")
    parser.add_argument("--data", type=str, default=None, help="Path to input CSV data file (optional)")
    parser.add_argument("--config", type=str, default=None, help="Path to model config YAML file")
    parser.add_argument("--rows", type=int, default=10000, help="Number of synthetic rows to generate if no data given")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    args = parser.parse_args()

    run_training_pipeline(
        data_path=Path(args.data) if args.data else None,
        config_path=Path(args.config) if args.config else None,
        num_rows=args.rows,
        seed=args.seed,
    )


if __name__ == "__main__":
    main()
