"""Data preprocessing, splitting, and encoding pipeline for Legal Metrology ML Engine."""
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold, train_test_split
from sklearn.preprocessing import OrdinalEncoder
from src.utils.logger import get_logger

logger = get_logger("preprocessor")


class MetrologyDataPreprocessor:
    """Handles feature selection, categorical encoding, and dataset splitting."""

    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        
        self.categorical_cols = [
            "instrument_type",
            "manufacturer",
            "model",
            "accuracy_class",
            "physical_condition",
            "display_condition",
            "platform_condition",
            "seal_condition",
            "instrument_age_bucket",
        ]
        
        self.boolean_cols = [
            "tampering_indicator",
            "display_functioning",
            "previous_certificate_available",
            "previous_certificate_valid",
        ]

        self.numerical_cols = [
            "capacity",
            "scale_interval",
            "instrument_age_years",
            "previous_verifications",
            "previous_failures",
            "repair_count",
            "last_verification_days_ago",
            "certificate_expired_days",
            "reference_load_1",
            "observed_reading_1",
            "error_1",
            "reference_load_2",
            "observed_reading_2",
            "error_2",
            "reference_load_3",
            "observed_reading_3",
            "error_3",
            "repeatability_reading_1",
            "repeatability_reading_2",
            "repeatability_reading_3",
            "repeatability_reading_4",
            "repeatability_reading_5",
            "repeatability_mean",
            "repeatability_range",
            "repeatability_std",
            "center_reading",
            "front_left_reading",
            "front_right_reading",
            "back_left_reading",
            "back_right_reading",
            "eccentric_max_error",
            "eccentric_min_error",
            "eccentric_range",
            "eccentric_max_deviation_from_center",
            "initial_zero",
            "final_zero",
            "zero_drift",
            "tare_reference",
            "tare_observed",
            "tare_error",
            "sensitivity_test_load",
            "sensitivity_indication_change",
            "sensitivity_error",
            # Engineered features
            "absolute_error_1",
            "absolute_error_2",
            "absolute_error_3",
            "relative_error_1",
            "relative_error_2",
            "relative_error_3",
            "maximum_absolute_error",
            "mean_absolute_error",
            "maximum_relative_error",
            "zero_drift_absolute",
            "tare_error_absolute",
            "historical_failure_rate",
            "certificate_expiry_risk",
        ]

        self.all_feature_cols = self.categorical_cols + self.boolean_cols + self.numerical_cols
        self.ordinal_encoder: Optional[OrdinalEncoder] = None
        self.median_imputer_values: Dict[str, float] = {}

    def fit(self, df: pd.DataFrame) -> "MetrologyDataPreprocessor":
        """Fits encoders and imputation statistics on training data."""
        # Fit ordinal encoder for baseline RandomForest
        cat_present = [c for c in self.categorical_cols if c in df.columns]
        self.ordinal_encoder = OrdinalEncoder(
            handle_unknown="use_encoded_value",
            unknown_value=-1,
        )
        self.ordinal_encoder.fit(df[cat_present].astype(str))

        # Compute numerical medians for imputation
        num_present = [c for c in self.numerical_cols if c in df.columns]
        for col in num_present:
            self.median_imputer_values[col] = float(df[col].median(skipna=True))

        return self

    def transform_catboost(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepares dataframe for CatBoost (preserves categorical strings, fills nulls)."""
        res = df.copy()
        for col in self.categorical_cols:
            if col in res.columns:
                res[col] = res[col].fillna("Unknown").astype(str)
            else:
                res[col] = "Unknown"

        for col in self.boolean_cols:
            if col in res.columns:
                res[col] = res[col].fillna(False).astype(int)
            else:
                res[col] = 0

        for col in self.numerical_cols:
            if col in res.columns:
                res[col] = pd.to_numeric(res[col], errors="coerce").fillna(
                    self.median_imputer_values.get(col, 0.0)
                )
            else:
                res[col] = self.median_imputer_values.get(col, 0.0)

        feature_subset = [c for c in self.all_feature_cols if c in res.columns]
        return res[feature_subset]

    def transform_rf(self, df: pd.DataFrame) -> np.ndarray:
        """Encodes all categorical features numerically for RandomForest."""
        cb_df = self.transform_catboost(df)
        res = cb_df.copy()

        cat_present = [c for c in self.categorical_cols if c in res.columns]
        if self.ordinal_encoder and cat_present:
            res[cat_present] = self.ordinal_encoder.transform(res[cat_present].astype(str))

        return res.values

    def save(self, path: Path | str) -> None:
        """Saves fitted preprocessor to disk."""
        joblib.dump(self, path)
        logger.info(f"Saved preprocessor to {path}")

    @staticmethod
    def load(path: Path | str) -> "MetrologyDataPreprocessor":
        """Loads preprocessor from disk."""
        return joblib.load(path)


def split_metrology_dataset(
    df: pd.DataFrame,
    test_size: float = 0.15,
    val_size: float = 0.15,
    random_state: int = 42,
    group_by_instrument: bool = False,
    group_col: str = "instrument_id",
    target_col: str = "verification_result",
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Splits dataset into train, validation, and test partitions.
    
    PREVENTING DATA LEAKAGE NOTE:
    When multiple verification records exist for the same physical instrument (e.g. annual re-verifications),
    standard random splitting will leak instrument-specific idiosyncrasies, wear profiles, and serial-level
    metadata between training and test sets. To prevent this, `group_by_instrument=True` partitions by
    `group_col` (e.g. instrument_id), guaranteeing that any given physical device appears exclusively in
    one split partition.
    """
    y = df[target_col]

    if group_by_instrument and group_col in df.columns:
        # Grouped split
        groups = df[group_col].values
        sgkf = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=random_state)
        
        # Split out test set (fold 0 as test)
        train_val_idx, test_idx = next(sgkf.split(df, y, groups))
        train_val_df = df.iloc[train_val_idx].reset_index(drop=True)
        test_df = df.iloc[test_idx].reset_index(drop=True)

        # Split train and validation from remaining folds
        train_val_groups = train_val_df[group_col].values
        train_val_y = train_val_df[target_col].values
        sgkf_val = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=random_state)
        train_idx, val_idx = next(sgkf_val.split(train_val_df, train_val_y, train_val_groups))

        train_df = train_val_df.iloc[train_idx].reset_index(drop=True)
        val_df = train_val_df.iloc[val_idx].reset_index(drop=True)
    else:
        # Stratified train/val/test split
        train_val_df, test_df = train_test_split(
            df, test_size=test_size, stratify=y, random_state=random_state
        )
        val_relative_size = val_size / (1.0 - test_size)
        train_df, val_df = train_test_split(
            train_val_df,
            test_size=val_relative_size,
            stratify=train_val_df[target_col],
            random_state=random_state,
        )

    logger.info(
        f"Dataset split summary -> Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}"
    )
    return (
        train_df.reset_index(drop=True),
        val_df.reset_index(drop=True),
        test_df.reset_index(drop=True),
    )
