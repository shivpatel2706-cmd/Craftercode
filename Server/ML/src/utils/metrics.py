"""Metrology-specific evaluation metrics, including False PASS Rate and False FAIL Rate."""
from typing import Any, Dict, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
)


def calculate_metrology_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob_fail: Optional[np.ndarray] = None,
    pos_label: str = "FAIL",
) -> Dict[str, Any]:
    """
    Computes standard classification metrics plus explicit Legal Metrology safety metrics:
    - False PASS Rate: Proportion of actual non-compliant (FAIL) instruments incorrectly passed.
    - False FAIL Rate: Proportion of actual compliant (PASS) instruments incorrectly failed.
    """
    y_true_str = np.array([str(x).upper() for x in y_true])
    y_pred_str = np.array([str(x).upper() for x in y_pred])

    # Counts
    actual_fail_mask = (y_true_str == "FAIL")
    actual_pass_mask = (y_true_str == "PASS")
    
    total_actual_fail = int(np.sum(actual_fail_mask))
    total_actual_pass = int(np.sum(actual_pass_mask))

    # False PASS: Ground Truth is FAIL, but model predicted PASS
    # (High risk in legal metrology - allows defective/fraudulent scales in trade)
    false_pass_count = int(np.sum((y_true_str == "FAIL") & (y_pred_str == "PASS")))
    false_pass_rate = (
        float(false_pass_count / total_actual_fail) if total_actual_fail > 0 else 0.0
    )

    # False FAIL: Ground Truth is PASS, but model predicted FAIL
    # (Operational burden - legitimate businesses face unwarranted re-inspection)
    false_fail_count = int(np.sum((y_true_str == "PASS") & (y_pred_str == "FAIL")))
    false_fail_rate = (
        float(false_fail_count / total_actual_pass) if total_actual_pass > 0 else 0.0
    )

    # Convert binary labels for scikit-learn standard evaluation (1 for FAIL, 0 for PASS)
    y_true_binary = (y_true_str == "FAIL").astype(int)
    y_pred_binary = (y_pred_str == "FAIL").astype(int)

    acc = float(accuracy_score(y_true_binary, y_pred_binary))
    prec = float(precision_score(y_true_binary, y_pred_binary, zero_division=0))
    rec = float(recall_score(y_true_binary, y_pred_binary, zero_division=0))
    f1 = float(f1_score(y_true_binary, y_pred_binary, zero_division=0))

    cm = confusion_matrix(y_true_binary, y_pred_binary, labels=[0, 1])
    # cm layout:
    # Row 0: True PASS -> [True PASS (tn), False FAIL (fp)]
    # Row 1: True FAIL -> [False PASS (fn), True FAIL (tp)]
    tn, fp, fn, tp = cm.ravel()

    roc_auc = None
    pr_auc = None
    if y_prob_fail is not None and len(np.unique(y_true_binary)) > 1:
        try:
            roc_auc = float(roc_auc_score(y_true_binary, y_prob_fail))
            pr_auc = float(average_precision_score(y_true_binary, y_prob_fail))
        except Exception:
            pass

    return {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        # Explicit Metrological Safety Metrics
        "false_pass_rate": false_pass_rate,
        "false_fail_rate": false_fail_rate,
        "false_pass_count": false_pass_count,
        "false_fail_count": false_fail_count,
        "total_actual_fail": total_actual_fail,
        "total_actual_pass": total_actual_pass,
        "confusion_matrix": {
            "true_pass_pred_pass": int(tn),
            "true_pass_pred_fail": int(fp),
            "true_fail_pred_pass": int(fn),
            "true_fail_pred_fail": int(tp),
        },
        "raw_confusion_matrix": cm.tolist(),
    }
