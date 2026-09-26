"""Feature engineering pipeline for Legal Metrology verification data."""
from typing import Any, Dict, List, Union
import numpy as np
import pandas as pd


def get_age_bucket(age: float) -> str:
    """Categorizes instrument age into standard risk buckets."""
    if age < 1.0:
        return "< 1 year"
    elif age < 3.0:
        return "1 - 3 years"
    elif age < 7.0:
        return "3 - 7 years"
    elif age < 12.0:
        return "7 - 12 years"
    else:
        return "> 12 years"


def engineer_features(data: Union[pd.DataFrame, Dict[str, Any]]) -> Union[pd.DataFrame, Dict[str, Any]]:
    """
    Computes derived metrological features including absolute/relative errors,
    repeatability and eccentricity deviations, zero drift, tare errors,
    historical failure rates, and documentation expiry risks.
    
    Accepts either a pandas DataFrame (for training/batch) or a dict (for single-record inference).
    """
    is_dict = isinstance(data, dict)
    df = pd.DataFrame([data]) if is_dict else data.copy()

    # 1. Accuracy Absolute and Relative Errors
    for i in [1, 2, 3]:
        ref_col = f"reference_load_{i}"
        obs_col = f"observed_reading_{i}"
        err_col = f"error_{i}"

        # Error if not present
        if err_col not in df.columns or df[err_col].isna().all():
            if ref_col in df.columns and obs_col in df.columns:
                df[err_col] = df[obs_col] - df[ref_col]
            else:
                df[err_col] = np.nan

        df[f"absolute_error_{i}"] = pd.to_numeric(df[err_col], errors="coerce").abs().fillna(0.0)
        
        # Relative error
        if ref_col in df.columns:
            ref_safe = pd.to_numeric(df[ref_col], errors="coerce").replace(0, np.nan)
            df[f"relative_error_{i}"] = df[f"absolute_error_{i}"] / ref_safe
        else:
            df[f"relative_error_{i}"] = np.nan

    # Aggregate accuracy metrics
    abs_err_cols = ["absolute_error_1", "absolute_error_2", "absolute_error_3"]
    rel_err_cols = ["relative_error_1", "relative_error_2", "relative_error_3"]

    df["maximum_absolute_error"] = df[abs_err_cols].max(axis=1)
    df["mean_absolute_error"] = df[abs_err_cols].mean(axis=1)
    df["maximum_relative_error"] = df[rel_err_cols].max(axis=1)

    # 2. Repeatability Metrics
    rep_cols = [f"repeatability_reading_{i}" for i in range(1, 6) if f"repeatability_reading_{i}" in df.columns]
    if rep_cols and "repeatability_range" not in df.columns:
        rep_numeric = df[rep_cols].apply(pd.to_numeric, errors="coerce")
        df["repeatability_range"] = rep_numeric.max(axis=1) - rep_numeric.min(axis=1)
    if rep_cols and "repeatability_std" not in df.columns:
        rep_numeric = df[rep_cols].apply(pd.to_numeric, errors="coerce")
        df["repeatability_std"] = rep_numeric.std(axis=1).fillna(0.0)

    # 3. Eccentric Loading Metrics
    ecc_points = ["front_left_reading", "front_right_reading", "back_left_reading", "back_right_reading"]
    all_ecc = ["center_reading"] + [p for p in ecc_points if p in df.columns]
    
    if all(p in df.columns for p in all_ecc):
        ecc_numeric = df[all_ecc].apply(pd.to_numeric, errors="coerce")
        if "eccentric_range" not in df.columns:
            df["eccentric_range"] = ecc_numeric.max(axis=1) - ecc_numeric.min(axis=1)
        
        # Max deviation from center
        c_series = pd.to_numeric(df["center_reading"], errors="coerce")
        dev_dfs = [(pd.to_numeric(df[p], errors="coerce") - c_series).abs() for p in ecc_points if p in df.columns]
        if dev_dfs:
            df["eccentric_max_deviation"] = pd.concat(dev_dfs, axis=1).max(axis=1).fillna(0.0)
        else:
            df["eccentric_max_deviation"] = 0.0
    else:
        df["eccentric_max_deviation"] = pd.to_numeric(df.get("eccentric_max_deviation_from_center", 0.0), errors="coerce").fillna(0.0)

    # 4. Zero Drift Absolute
    if "zero_drift" in df.columns and df["zero_drift"].notna().any():
        df["zero_drift_absolute"] = pd.to_numeric(df["zero_drift"], errors="coerce").abs().fillna(0.0)
    elif "initial_zero" in df.columns and "final_zero" in df.columns:
        df["zero_drift_absolute"] = (
            pd.to_numeric(df["final_zero"], errors="coerce") - pd.to_numeric(df["initial_zero"], errors="coerce")
        ).abs().fillna(0.0)
    else:
        df["zero_drift_absolute"] = 0.0

    # 5. Tare Error Absolute
    if "tare_error" in df.columns and df["tare_error"].notna().any():
        df["tare_error_absolute"] = pd.to_numeric(df["tare_error"], errors="coerce").abs().fillna(0.0)
    elif "tare_observed" in df.columns and "tare_reference" in df.columns:
        df["tare_error_absolute"] = (
            pd.to_numeric(df["tare_observed"], errors="coerce") - pd.to_numeric(df["tare_reference"], errors="coerce")
        ).abs().fillna(0.0)
    else:
        df["tare_error_absolute"] = 0.0

    # 6. Instrument Age Bucket
    if "instrument_age_years" in df.columns:
        df["instrument_age_bucket"] = df["instrument_age_years"].apply(
            lambda a: get_age_bucket(float(a)) if pd.notna(a) else "Unknown"
        )
    else:
        df["instrument_age_bucket"] = "Unknown"

    # 7. Historical Failure Rate
    if "previous_failures" in df.columns and "previous_verifications" in df.columns:
        prev_ver = df["previous_verifications"].fillna(0)
        prev_fail = df["previous_failures"].fillna(0)
        df["historical_failure_rate"] = np.where(
            prev_ver > 0,
            (prev_fail / prev_ver).clip(0.0, 1.0),
            0.0,
        )
    else:
        df["historical_failure_rate"] = 0.0

    # 8. Certificate Expiry Risk
    if "previous_certificate_available" in df.columns:
        avail = df["previous_certificate_available"].fillna(False)
        valid = df.get("previous_certificate_valid", pd.Series(False, index=df.index)).fillna(False)
        expired_days = df.get("certificate_expired_days", pd.Series(0, index=df.index)).fillna(0)

        # Vectorized risk computation
        risk = np.where(
            ~avail,
            0.85,
            np.where(
                valid,
                0.0,
                np.clip(expired_days / 180.0, 0.1, 1.0),
            ),
        )
        df["certificate_expiry_risk"] = risk
    else:
        df["certificate_expiry_risk"] = 0.5

    if is_dict:
        return df.iloc[0].to_dict()
    return df
