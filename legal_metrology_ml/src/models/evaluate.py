"""Model evaluation and comparative benchmarking module with metrology safety metrics."""
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless execution
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import ConfusionMatrixDisplay, RocCurveDisplay, PrecisionRecallDisplay
from src.utils.logger import get_logger
from src.utils.metrics import calculate_metrology_metrics

logger = get_logger("model_evaluator")


def evaluate_classifier(
    model: Any,
    X: Any,
    y_true: pd.Series | np.ndarray,
    model_name: str = "Model",
    output_dir: Optional[Path | str] = None,
) -> Dict[str, Any]:
    """
    Evaluates a model, computes standard metrics + explicit FALSE PASS and FALSE FAIL rates,
    and saves diagnostic plots if output_dir is provided.
    """
    # Get predictions
    y_pred = model.predict(X)
    # Ensure 1D array of string labels
    if isinstance(y_pred, np.ndarray) and y_pred.ndim > 1:
        y_pred = y_pred.ravel()

    # Get probability for FAIL class (risk score)
    classes = list(getattr(model, "classes_", ["PASS", "FAIL"]))
    y_prob_fail = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)
        if "FAIL" in classes:
            fail_idx = list(classes).index("FAIL")
            y_prob_fail = probs[:, fail_idx]
        else:
            y_prob_fail = probs[:, 1]

    metrics = calculate_metrology_metrics(
        y_true=y_true,
        y_pred=y_pred,
        y_prob_fail=y_prob_fail,
    )
    metrics["model_name"] = model_name

    logger.info(
        f"[{model_name}] Acc: {metrics['accuracy']:.4f} | F1: {metrics['f1_score']:.4f} | "
        f"ROC-AUC: {metrics['roc_auc'] or 0.0:.4f} | "
        f"False PASS Rate: {metrics['false_pass_rate']:.4f} | False FAIL Rate: {metrics['false_fail_rate']:.4f}"
    )

    if output_dir:
        out_p = Path(output_dir)
        out_p.mkdir(parents=True, exist_ok=True)
        _generate_evaluation_plots(y_true, y_pred, y_prob_fail, model_name, out_p)

    return metrics


def _generate_evaluation_plots(
    y_true: Any,
    y_pred: Any,
    y_prob_fail: Optional[np.ndarray],
    model_name: str,
    out_dir: Path,
) -> None:
    """Generates and saves Confusion Matrix, ROC curve, and PR curve plots."""
    y_true_binary = (np.array([str(x).upper() for x in y_true]) == "FAIL").astype(int)
    y_pred_binary = (np.array([str(x).upper() for x in y_pred]) == "FAIL").astype(int)

    clean_name = model_name.lower().replace(" ", "_")

    # 1. Confusion Matrix Plot
    fig, ax = plt.subplots(figsize=(6, 5))
    disp = ConfusionMatrixDisplay.from_predictions(
        y_true_binary,
        y_pred_binary,
        display_labels=["PASS", "FAIL"],
        cmap="Blues",
        ax=ax,
    )
    ax.set_title(f"Confusion Matrix: {model_name}\n(Focus: Minimize False PASS)")
    plt.tight_layout()
    cm_path = out_dir / f"{clean_name}_confusion_matrix.png"
    plt.savefig(cm_path, dpi=150)
    plt.close(fig)

    # 2. ROC & PR Curves (if probabilities available)
    if y_prob_fail is not None and len(np.unique(y_true_binary)) > 1:
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        
        RocCurveDisplay.from_predictions(
            y_true_binary,
            y_prob_fail,
            name=model_name,
            ax=ax1,
            plot_chance_level=True,
        )
        ax1.set_title("ROC Curve")
        ax1.grid(True, alpha=0.3)

        PrecisionRecallDisplay.from_predictions(
            y_true_binary,
            y_prob_fail,
            name=model_name,
            ax=ax2,
            plot_chance_level=True,
        )
        ax2.set_title("Precision-Recall Curve")
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        curves_path = out_dir / f"{clean_name}_roc_pr_curves.png"
        plt.savefig(curves_path, dpi=150)
        plt.close(fig)


def compare_models(
    catboost_metrics: Dict[str, Any],
    rf_metrics: Dict[str, Any],
) -> Tuple[str, Dict[str, Any]]:
    """
    Compares CatBoost and Random Forest.
    Selection criteria: Prioritizes composite safety score:
    Safety Score = F1 * (1 - False PASS Rate)
    """
    cb_safety = catboost_metrics["f1_score"] * (1.0 - catboost_metrics["false_pass_rate"])
    rf_safety = rf_metrics["f1_score"] * (1.0 - rf_metrics["false_pass_rate"])

    comparison_table = {
        "Metric": [
            "Accuracy",
            "Precision",
            "Recall",
            "F1 Score",
            "ROC-AUC",
            "PR-AUC",
            "False PASS Rate",
            "False FAIL Rate",
            "Metrology Safety Score",
        ],
        "CatBoost": [
            catboost_metrics["accuracy"],
            catboost_metrics["precision"],
            catboost_metrics["recall"],
            catboost_metrics["f1_score"],
            catboost_metrics["roc_auc"],
            catboost_metrics["pr_auc"],
            catboost_metrics["false_pass_rate"],
            catboost_metrics["false_fail_rate"],
            cb_safety,
        ],
        "RandomForest_Baseline": [
            rf_metrics["accuracy"],
            rf_metrics["precision"],
            rf_metrics["recall"],
            rf_metrics["f1_score"],
            rf_metrics["roc_auc"],
            rf_metrics["pr_auc"],
            rf_metrics["false_pass_rate"],
            rf_metrics["false_fail_rate"],
            rf_safety,
        ],
    }

    winner = "CatBoost" if cb_safety >= rf_safety else "RandomForest"
    logger.info(
        f"Model Comparison: CatBoost Safety Score={cb_safety:.4f}, RF Safety Score={rf_safety:.4f} "
        f"-> Winner: {winner}"
    )
    return winner, comparison_table
