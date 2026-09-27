"""Synthetic Dataset Generator for Legal Metrology ML Verification Engine.

NOTE: This script generates SYNTHETIC demo data for testing and developing the ML pipeline.
It does NOT represent real-world regulatory measurements.
"""
import argparse
from pathlib import Path
from typing import Dict, Any, List
import numpy as np
import pandas as pd
from src.rules.rules_engine import RegulatoryRulesEngine
from src.utils.logger import get_logger

logger = get_logger("data_generator")

INSTRUMENT_SPECS: Dict[str, Dict[str, Any]] = {
    "Precision / Analytical Balance": {
        "capacity_range": (0.2, 5.0),  # kg
        "scale_intervals": [0.0001, 0.0002, 0.0005, 0.001],
        "accuracy_classes": ["I", "II"],
        "manufacturers": ["Mettler Toledo", "Sartorius", "Shimadzu", "A&D"],
    },
    "Electronic Weighing Machine": {
        "capacity_range": (15.0, 150.0),  # kg
        "scale_intervals": [0.002, 0.005, 0.010, 0.020],
        "accuracy_classes": ["III"],
        "manufacturers": ["Avery India", "Essae", "Eagle", "Citizen", "Sansui"],
    },
    "Price Computing Scale": {
        "capacity_range": (10.0, 35.0),  # kg
        "scale_intervals": [0.002, 0.005],
        "accuracy_classes": ["III"],
        "manufacturers": ["Essae", "Avery", "CAS", "Crown"],
    },
    "Counting Scale": {
        "capacity_range": (6.0, 30.0),  # kg
        "scale_intervals": [0.001, 0.002, 0.005],
        "accuracy_classes": ["III"],
        "manufacturers": ["Kern", "Essae", "CAS", "Avery"],
    },
    "Mechanical Weighing Machine": {
        "capacity_range": (50.0, 500.0),  # kg
        "scale_intervals": [0.050, 0.100, 0.200],
        "accuracy_classes": ["III", "IIII"],
        "manufacturers": ["National Scales", "Bharat Scales", "Standard Mechanical", "Crown Mech"],
    },
    "Crane / Hanging Scale": {
        "capacity_range": (1000.0, 15000.0),  # kg
        "scale_intervals": [0.5, 1.0, 2.0, 5.0],
        "accuracy_classes": ["III", "IIII"],
        "manufacturers": ["EHP", "CraneTech", "Avery Berkel", "HeavyLift"],
    },
    "Weighbridge / Truck Scale": {
        "capacity_range": (30000.0, 100000.0),  # kg
        "scale_intervals": [5.0, 10.0, 20.0],
        "accuracy_classes": ["III", "IIII"],
        "manufacturers": ["Avery India", "Mettler Toledo", "Essae Weighbridge", "Syscon"],
    },
}

PHYSICAL_CONDITIONS = ["Good", "Fair", "Worn", "Severely Damaged", "Critical Corrosion"]
DISPLAY_CONDITIONS = ["Clear", "Dim", "Flickering", "Damaged Digits", "Dead"]
PLATFORM_CONDITIONS = ["Level & Clean", "Minor Scratches", "Rusty", "Unlevel", "Warped"]
SEAL_CONDITIONS = ["Intact", "Verified", "New Seal Applied", "Broken", "Missing", "Tampered"]


def generate_synthetic_dataset(
    num_rows: int = 10000,
    seed: int = 42,
    noise_rate: float = 0.04,
) -> pd.DataFrame:
    """
    Generates a realistic synthetic verification dataset with physically sound relationships,
    metrological errors, and ground truth labels derived from regulatory rules with controlled noise.
    """
    np.random.seed(seed)
    rules_engine = RegulatoryRulesEngine()
    instrument_types = list(INSTRUMENT_SPECS.keys())

    # Pre-generate some instrument IDs to model multiple verifications for same instrument
    unique_instrument_pool_size = max(500, int(num_rows * 0.4))
    instrument_id_pool = [f"INST-{10000 + i}" for i in range(unique_instrument_pool_size)]

    records: List[Dict[str, Any]] = []

    for i in range(num_rows):
        inst_type = np.random.choice(instrument_types)
        spec = INSTRUMENT_SPECS[inst_type]
        manufacturer = np.random.choice(spec["manufacturers"])
        accuracy_class = np.random.choice(spec["accuracy_classes"])
        model_name = f"{manufacturer[:3].upper()}-{np.random.randint(100, 999)}"

        cap_min, cap_max = spec["capacity_range"]
        capacity = round(float(np.random.uniform(cap_min, cap_max)), 2)
        scale_interval = float(np.random.choice(spec["scale_intervals"]))

        # History & Age
        instrument_id = np.random.choice(instrument_id_pool)
        instrument_age_years = round(float(np.random.uniform(0.1, 15.0)), 1)
        prev_verifications = int(np.random.poisson(lam=max(1, instrument_age_years * 1.5)))
        prev_failures = int(np.random.binomial(n=prev_verifications, p=0.15)) if prev_verifications > 0 else 0
        repair_count = int(np.random.binomial(n=max(prev_failures, 1), p=0.7)) if prev_failures > 0 else 0
        last_verification_days_ago = int(np.random.uniform(30, 750))

        # Documentation
        prev_cert_available = bool(np.random.choice([True, False], p=[0.92, 0.08]))
        if prev_cert_available:
            cert_expired_days = int(np.random.choice([0, np.random.randint(1, 180)], p=[0.75, 0.25]))
            prev_cert_valid = cert_expired_days == 0
        else:
            cert_expired_days = int(np.random.randint(60, 400))
            prev_cert_valid = False

        # Physical inspection probabilities influenced by age and repairs
        damage_prob = min(0.40, 0.03 + (instrument_age_years * 0.02) + (prev_failures * 0.04))
        tampering_indicator = bool(np.random.choice([False, True], p=[1.0 - (damage_prob * 0.2), damage_prob * 0.2]))
        display_functioning = bool(np.random.choice([True, False], p=[1.0 - (damage_prob * 0.15), damage_prob * 0.15]))

        if tampering_indicator:
            seal_condition = np.random.choice(["Broken", "Missing", "Tampered"])
        else:
            seal_condition = np.random.choice(
                SEAL_CONDITIONS,
                p=[0.70, 0.15, 0.08, 0.03, 0.02, 0.02],
            )

        physical_condition = np.random.choice(
            PHYSICAL_CONDITIONS,
            p=[0.60, 0.25, 0.10, 0.03, 0.02],
        )
        display_condition = "Dead" if not display_functioning else np.random.choice(
            DISPLAY_CONDITIONS[:4],
            p=[0.75, 0.15, 0.07, 0.03],
        )
        platform_condition = np.random.choice(
            PLATFORM_CONDITIONS,
            p=[0.65, 0.20, 0.08, 0.04, 0.03],
        )

        # Accuracy Test Loads (10%, 50%, 100% capacity)
        ref_load_1 = round(capacity * 0.10, 4)
        ref_load_2 = round(capacity * 0.50, 4)
        ref_load_3 = round(capacity * 1.00, 4)

        # Determine if instrument tends to be defective
        has_defect = (
            tampering_indicator
            or not display_functioning
            or seal_condition in ["Broken", "Missing", "Tampered"]
            or physical_condition in ["Severely Damaged", "Critical Corrosion"]
            or np.random.rand() < 0.20
        )

        # Baseline error scale in terms of scale_interval 'e'
        error_scale = (scale_interval * 2.8) if has_defect else (scale_interval * 0.55)

        # Observed readings & errors
        err_1 = float(np.random.normal(0, error_scale))
        err_2 = float(np.random.normal(0, error_scale * 1.3))
        err_3 = float(np.random.normal(0, error_scale * 1.6))

        obs_1 = round(ref_load_1 + err_1, 4)
        obs_2 = round(ref_load_2 + err_2, 4)
        obs_3 = round(ref_load_3 + err_3, 4)

        # Repeatability (5 readings around 50% capacity)
        rep_base = ref_load_2
        rep_spread = (scale_interval * 2.2) if has_defect else (scale_interval * 0.4)
        rep_readings = [round(rep_base + float(np.random.normal(0, rep_spread)), 4) for _ in range(5)]
        rep_mean = round(float(np.mean(rep_readings)), 4)
        rep_range = round(float(np.max(rep_readings) - np.min(rep_readings)), 4)
        rep_std = round(float(np.std(rep_readings)), 4)

        # Eccentric loading (1/3 capacity)
        ecc_base = round(capacity / 3.0, 4)
        ecc_spread = (scale_interval * 2.5) if has_defect else (scale_interval * 0.45)
        center_reading = round(ecc_base + float(np.random.normal(0, ecc_spread * 0.5)), 4)
        fl_reading = round(ecc_base + float(np.random.normal(0, ecc_spread)), 4)
        fr_reading = round(ecc_base + float(np.random.normal(0, ecc_spread)), 4)
        bl_reading = round(ecc_base + float(np.random.normal(0, ecc_spread)), 4)
        br_reading = round(ecc_base + float(np.random.normal(0, ecc_spread)), 4)

        ecc_readings = [center_reading, fl_reading, fr_reading, bl_reading, br_reading]
        ecc_errors = [r - ecc_base for r in ecc_readings]
        ecc_max_error = round(float(np.max(ecc_errors)), 4)
        ecc_min_error = round(float(np.min(ecc_errors)), 4)
        ecc_range = round(float(np.max(ecc_readings) - np.min(ecc_readings)), 4)
        ecc_max_dev = round(float(np.max([abs(r - center_reading) for r in ecc_readings[1:]])), 4)

        # Zero test
        initial_zero = 0.0
        drift_sigma = (scale_interval * 1.2) if has_defect else (scale_interval * 0.2)
        zero_drift = round(float(np.random.normal(0, drift_sigma)), 4)
        final_zero = round(initial_zero + zero_drift, 4)

        # Tare test
        tare_ref = round(capacity * 0.20, 4)
        tare_err_sigma = (scale_interval * 1.8) if has_defect else (scale_interval * 0.35)
        tare_error = round(float(np.random.normal(0, tare_err_sigma)), 4)
        tare_obs = round(tare_ref + tare_error, 4)

        # Sensitivity test
        sens_test_load = round(scale_interval * 1.4, 4)
        sens_err_mult = 0.4 if has_defect else 1.05
        sens_indication = round(sens_test_load * float(np.random.uniform(sens_err_mult * 0.8, sens_err_mult * 1.2)), 4)
        sens_error = round(sens_indication - sens_test_load, 4)

        record: Dict[str, Any] = {
            "dataset_type": "SYNTHETIC_DEMO",
            "instrument_id": instrument_id,
            "instrument_type": inst_type,
            "manufacturer": manufacturer,
            "model": model_name,
            "accuracy_class": accuracy_class,
            "capacity": capacity,
            "scale_interval": scale_interval,
            "instrument_age_years": instrument_age_years,
            "previous_verifications": prev_verifications,
            "previous_failures": prev_failures,
            "repair_count": repair_count,
            "last_verification_days_ago": last_verification_days_ago,
            "reference_load_1": ref_load_1,
            "observed_reading_1": obs_1,
            "error_1": round(err_1, 4),
            "reference_load_2": ref_load_2,
            "observed_reading_2": obs_2,
            "error_2": round(err_2, 4),
            "reference_load_3": ref_load_3,
            "observed_reading_3": obs_3,
            "error_3": round(err_3, 4),
            "repeatability_reading_1": rep_readings[0],
            "repeatability_reading_2": rep_readings[1],
            "repeatability_reading_3": rep_readings[2],
            "repeatability_reading_4": rep_readings[3],
            "repeatability_reading_5": rep_readings[4],
            "repeatability_mean": rep_mean,
            "repeatability_range": rep_range,
            "repeatability_std": rep_std,
            "center_reading": center_reading,
            "front_left_reading": fl_reading,
            "front_right_reading": fr_reading,
            "back_left_reading": bl_reading,
            "back_right_reading": br_reading,
            "eccentric_max_error": ecc_max_error,
            "eccentric_min_error": ecc_min_error,
            "eccentric_range": ecc_range,
            "eccentric_max_deviation_from_center": ecc_max_dev,
            "initial_zero": initial_zero,
            "final_zero": final_zero,
            "zero_drift": zero_drift,
            "tare_reference": tare_ref,
            "tare_observed": tare_obs,
            "tare_error": tare_error,
            "sensitivity_test_load": sens_test_load,
            "sensitivity_indication_change": sens_indication,
            "sensitivity_error": sens_error,
            "physical_condition": physical_condition,
            "display_condition": display_condition,
            "platform_condition": platform_condition,
            "seal_condition": seal_condition,
            "tampering_indicator": tampering_indicator,
            "display_functioning": display_functioning,
            "previous_certificate_available": prev_cert_available,
            "previous_certificate_valid": prev_cert_valid,
            "certificate_expired_days": cert_expired_days,
        }

        # Evaluate ground truth with Rules Engine + Controlled Noise
        eval_res = rules_engine.evaluate(record)
        rule_outcome = eval_res["overall_rule_result"]

        # Controlled noise: Flip label with small probability to represent real-world edge cases/noise
        final_label = rule_outcome
        if rule_outcome in ["PASS", "FAIL"]:
            if np.random.rand() < noise_rate:
                final_label = "FAIL" if rule_outcome == "PASS" else "PASS"
        else:
            final_label = "FAIL"

        record["verification_result"] = final_label
        record["rules_engine_result"] = rule_outcome
        records.append(record)

    df = pd.DataFrame(records)
    logger.info(
        f"Generated {len(df)} synthetic records. "
        f"Class distribution: {df['verification_result'].value_counts().to_dict()}"
    )
    return df


def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic Legal Metrology verification records for ML training."
    )
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--rows", type=int, default=10000, help="Number of records to generate (>=10000)")
    parser.add_argument(
        "--output",
        type=str,
        default="data/synthetic/synthetic_verifications.csv",
        help="Target output CSV file path",
    )
    args = parser.parse_args()

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    df = generate_synthetic_dataset(num_rows=args.rows, seed=args.seed)
    df.to_csv(out_path, index=False)
    logger.info(f"Successfully saved synthetic dataset to '{out_path}'")


if __name__ == "__main__":
    main()
