"""Random Forest baseline model trainer for Legal Metrology Verification."""
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from src.utils.logger import get_logger

logger = get_logger("rf_trainer")


def train_random_forest_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    feature_names: List[str],
    config: Optional[Dict[str, Any]] = None,
) -> Tuple[RandomForestClassifier, Dict[str, Any]]:
    """
    Trains baseline RandomForestClassifier on preprocessed/encoded features.
    """
    cfg = config or {}
    n_estimators = cfg.get("n_estimators", 200)
    max_depth = cfg.get("max_depth", 12)
    min_samples_split = cfg.get("min_samples_split", 5)
    min_samples_leaf = cfg.get("min_samples_leaf", 2)
    random_state = cfg.get("random_state", 42)
    class_weight = cfg.get("class_weight", "balanced")

    logger.info(
        f"Training baseline RandomForestClassifier: n_estimators={n_estimators}, "
        f"max_depth={max_depth}, random_state={random_state}"
    )

    rf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        class_weight=class_weight,
        random_state=random_state,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)

    metadata = {
        "n_estimators": n_estimators,
        "max_depth": max_depth,
        "feature_names": feature_names,
        "classes": list(rf.classes_),
    }
    logger.info("Random Forest baseline training completed.")
    return rf, metadata
