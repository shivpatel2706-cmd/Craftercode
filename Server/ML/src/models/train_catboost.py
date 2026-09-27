"""CatBoostClassifier training module for Legal Metrology Verification."""
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from catboost import CatBoostClassifier, Pool
import pandas as pd
from src.utils.logger import get_logger

logger = get_logger("catboost_trainer")


def train_catboost_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    categorical_features: List[str],
    config: Optional[Dict[str, Any]] = None,
) -> Tuple[CatBoostClassifier, Dict[str, Any]]:
    """
    Trains CatBoostClassifier with native categorical feature support and early stopping.
    """
    cfg = config or {}
    iterations = cfg.get("iterations", 500)
    learning_rate = cfg.get("learning_rate", 0.05)
    depth = cfg.get("depth", 6)
    l2_leaf_reg = cfg.get("l2_leaf_reg", 3.0)
    random_seed = cfg.get("random_seed", 42)
    early_stopping_rounds = cfg.get("early_stopping_rounds", 50)
    auto_class_weights = cfg.get("auto_class_weights", "Balanced")

    # Filter categorical features present in dataframe
    cat_cols = [c for c in categorical_features if c in X_train.columns]

    logger.info(
        f"Training CatBoostClassifier: {iterations} iterations, lr={learning_rate}, depth={depth}, "
        f"categorical features={len(cat_cols)}"
    )

    train_pool = Pool(
        data=X_train,
        label=y_train,
        cat_features=cat_cols,
    )
    val_pool = Pool(
        data=X_val,
        label=y_val,
        cat_features=cat_cols,
    )

    model = CatBoostClassifier(
        iterations=iterations,
        learning_rate=learning_rate,
        depth=depth,
        l2_leaf_reg=l2_leaf_reg,
        random_seed=random_seed,
        auto_class_weights=auto_class_weights,
        early_stopping_rounds=early_stopping_rounds,
        eval_metric="F1",
        verbose=100,
        thread_count=-1,
    )

    model.fit(train_pool, eval_set=val_pool, use_best_model=True)

    metadata = {
        "best_iteration": model.get_best_iteration(),
        "best_score": model.get_best_score(),
        "feature_names": list(X_train.columns),
        "categorical_features": cat_cols,
        "classes": list(model.classes_),
    }
    logger.info(f"CatBoost training completed. Best iteration: {metadata['best_iteration']}")
    return model, metadata
