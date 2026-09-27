"""Dataset validation module for Legal Metrology verification records.

Ensures strict metrological sanity checks:
- No negative capacities or scale intervals
- No impossible readings (e.g. readings vastly outside physical instrument capacity)
- No silent data corruption
- Explicit logging of all anomalies and validation errors
"""
from typing import Any, Dict, List, Tuple
import pandas as pd
from src.utils.logger import get_logger

logger = get_logger("data_validator")

VALID_INSTRUMENT_TYPES = [
    "Electronic Weighing Machine",
    "Mechanical Weighing Machine",
    "Weighbridge / Truck Scale",
    "Crane / Hanging Scale",
    "Counting Scale",
    "Price Computing Scale",
    "Precision / Analytical Balance",
]

VALID_ACCURACY_CLASSES = ["I", "II", "III", "IIII"]


def validate_verification_record(record: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validates a single verification record dictionary for physical sanity and mandatory fields.
    Returns (is_valid, list_of_errors).
    """
    errors: List[str] = []

    # Check instrument type
    inst_type = record.get("instrument_type")
    if not inst_type:
        errors.append("Missing mandatory field: 'instrument_type'")
    elif inst_type not in VALID_INSTRUMENT_TYPES:
        errors.append(f"Invalid 'instrument_type': '{inst_type}'. Must be one of {VALID_INSTRUMENT_TYPES}")

    # Check accuracy class
    acc_class = record.get("accuracy_class")
    if not acc_class:
        errors.append("Missing mandatory field: 'accuracy_class'")
    elif str(acc_class).upper() not in VALID_ACCURACY_CLASSES:
        errors.append(f"Invalid 'accuracy_class': '{acc_class}'. Must be one of {VALID_ACCURACY_CLASSES}")

    # Check capacity
    capacity = record.get("capacity")
    if capacity is None:
        errors.append("Missing mandatory field: 'capacity'")
    else:
        try:
            cap_val = float(capacity)
            if cap_val <= 0:
                errors.append(f"Capacity must be strictly positive. Received: {cap_val}")
        except (ValueError, TypeError):
            errors.append(f"Non-numeric capacity value: {capacity}")

    # Check scale interval
    scale_interval = record.get("scale_interval")
    if scale_interval is None:
        errors.append("Missing mandatory field: 'scale_interval'")
    else:
        try:
            si_val = float(scale_interval)
            if si_val <= 0:
                errors.append(f"Scale interval must be strictly positive. Received: {si_val}")
            elif capacity is not None and isinstance(capacity, (int, float)) and si_val >= float(capacity):
                errors.append(f"Scale interval ({si_val}) cannot be greater than or equal to capacity ({capacity})")
        except (ValueError, TypeError):
            errors.append(f"Non-numeric scale_interval value: {scale_interval}")

    # Validate reference loads and observed readings
    if capacity is not None and isinstance(capacity, (int, float)) and float(capacity) > 0:
        cap_float = float(capacity)
        for i in [1, 2, 3]:
            ref_load = record.get(f"reference_load_{i}")
            obs_read = record.get(f"observed_reading_{i}")

            if ref_load is not None:
                try:
                    ref_f = float(ref_load)
                    if ref_f <= 0:
                        errors.append(f"reference_load_{i} must be positive. Received: {ref_f}")
                    elif ref_f > cap_float * 1.25:
                        errors.append(f"reference_load_{i} ({ref_f}) exceeds 125% of capacity ({cap_float})")
                except (ValueError, TypeError):
                    errors.append(f"reference_load_{i} is non-numeric: {ref_load}")

            if obs_read is not None:
                try:
                    obs_f = float(obs_read)
                    # Reading should not be drastically negative or drastically larger than capacity
                    if obs_f < -0.1 * cap_float or obs_f > cap_float * 1.5:
                        errors.append(
                            f"observed_reading_{i} ({obs_f}) is outside reasonable physical range "
                            f"[-{0.1 * cap_float:.2f}, {cap_float * 1.5:.2f}]"
                        )
                except (ValueError, TypeError):
                    errors.append(f"observed_reading_{i} is non-numeric: {obs_read}")

    is_valid = len(errors) == 0
    if not is_valid:
        logger.warning(f"Record validation failed with {len(errors)} errors: {errors}")
    return is_valid, errors


def validate_dataset_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Validates a batch verification dataframe:
    - Identifies and logs duplicates
    - Filters or flags impossible physical values (negative capacity, negative scale intervals)
    - Returns sanitized dataframe and audit report.
    """
    initial_count = len(df)
    report: Dict[str, Any] = {
        "initial_rows": initial_count,
        "duplicate_rows": 0,
        "invalid_capacity_rows": 0,
        "invalid_scale_interval_rows": 0,
        "unrecognized_instrument_type_rows": 0,
        "anomalous_reading_rows": 0,
        "valid_rows": 0,
    }

    # 1. Duplicates check
    dups = df.duplicated()
    dup_count = int(dups.sum())
    report["duplicate_rows"] = dup_count
    if dup_count > 0:
        logger.warning(f"Detected {dup_count} duplicate rows in dataset. Removing duplicates.")
        df = df.drop_duplicates().copy()

    # 2. Capacity sanity check
    invalid_cap = (df["capacity"] <= 0) | df["capacity"].isna()
    inv_cap_count = int(invalid_cap.sum())
    report["invalid_capacity_rows"] = inv_cap_count
    if inv_cap_count > 0:
        logger.error(f"Detected {inv_cap_count} rows with invalid capacity <= 0. Excluding from training.")
        df = df[~invalid_cap].copy()

    # 3. Scale interval sanity check
    invalid_si = (df["scale_interval"] <= 0) | df["scale_interval"].isna()
    inv_si_count = int(invalid_si.sum())
    report["invalid_scale_interval_rows"] = inv_si_count
    if inv_si_count > 0:
        logger.error(f"Detected {inv_si_count} rows with invalid scale_interval <= 0. Excluding from training.")
        df = df[~invalid_si].copy()

    # 4. Instrument type check
    unknown_types = ~df["instrument_type"].isin(VALID_INSTRUMENT_TYPES)
    unrec_count = int(unknown_types.sum())
    report["unrecognized_instrument_type_rows"] = unrec_count
    if unrec_count > 0:
        logger.error(f"Detected {unrec_count} rows with unrecognized instrument types. Excluding from training.")
        df = df[~unknown_types].copy()

    report["valid_rows"] = len(df)
    logger.info(f"Dataset validation complete. Retained {len(df)} of {initial_count} records. Summary: {report}")
    return df, report
