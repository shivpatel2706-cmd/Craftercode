"""Probability calibration module to ensure reliable risk scores."""
from typing import Any, Optional
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from src.utils.logger import get_logger

logger = get_logger("calibration")


def calibrate_model(
    model: Any,
    X_val: Any,
    y_val: Any,
    method: str = "sigmoid",
) -> CalibratedClassifierCV:
    """
    Calibrates model output probabilities using isotonic regression or Platt scaling (sigmoid).
    This ensures that predicted risk scores mathematically align with true empirical failure rates.
    """
    logger.info(f"Calibrating model probabilities using method='{method}' on validation set...")
    
    # In scikit-learn 1.4+, pre-fitted estimators are calibrated using FrozenEstimator
    try:
        from sklearn.frozen import FrozenEstimator
        cal_estimator = FrozenEstimator(model)
        calibrated = CalibratedClassifierCV(
            estimator=cal_estimator,
            method=method,
        )
    except (ImportError, TypeError):
        # Fallback for older scikit-learn versions
        calibrated = CalibratedClassifierCV(
            estimator=model,
            method=method,
            cv="prefit",
        )

    calibrated.fit(X_val, y_val)
    logger.info("Probability calibration complete.")
    return calibrated
