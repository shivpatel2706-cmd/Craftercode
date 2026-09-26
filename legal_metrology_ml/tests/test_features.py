"""Automated tests for feature engineering transformations and mathematical correctness."""
import pandas as pd
import pytest
from src.data.feature_engineering import engineer_features, get_age_bucket


def test_get_age_bucket():
    """Verify age bucketing logic."""
    assert get_age_bucket(0.5) == "< 1 year"
    assert get_age_bucket(2.0) == "1 - 3 years"
    assert get_age_bucket(5.0) == "3 - 7 years"
    assert get_age_bucket(10.0) == "7 - 12 years"
    assert get_age_bucket(15.0) == "> 12 years"


def test_engineer_features_dict():
    """Verify feature engineering produces all required fields on single record."""
    input_data = {
        "capacity": 30.0,
        "scale_interval": 0.005,
        "instrument_age_years": 4.5,
        "previous_verifications": 4,
        "previous_failures": 1,
        "reference_load_1": 5.0,
        "observed_reading_1": 5.002,
        "reference_load_2": 15.0,
        "observed_reading_2": 15.004,
        "reference_load_3": 30.0,
        "observed_reading_3": 30.006,
        "repeatability_reading_1": 15.000,
        "repeatability_reading_2": 15.002,
        "repeatability_reading_3": 15.001,
        "center_reading": 10.000,
        "front_left_reading": 10.002,
        "front_right_reading": 10.001,
        "back_left_reading": 10.003,
        "back_right_reading": 10.000,
        "initial_zero": 0.0,
        "final_zero": 0.001,
        "tare_reference": 6.0,
        "tare_observed": 6.002,
        "previous_certificate_available": True,
        "previous_certificate_valid": True,
        "certificate_expired_days": 0,
    }

    res = engineer_features(input_data)

    # Check error calculations
    assert pytest.approx(res["absolute_error_1"], 1e-5) == 0.002
    assert pytest.approx(res["absolute_error_2"], 1e-5) == 0.004
    assert pytest.approx(res["absolute_error_3"], 1e-5) == 0.006
    assert pytest.approx(res["maximum_absolute_error"], 1e-5) == 0.006
    assert pytest.approx(res["mean_absolute_error"], 1e-5) == 0.004

    # Relative errors
    assert pytest.approx(res["relative_error_1"], 1e-5) == 0.002 / 5.0
    assert pytest.approx(res["maximum_relative_error"], 1e-5) == 0.002 / 5.0

    # Repeatability & Eccentricity
    assert pytest.approx(res["repeatability_range"], 1e-5) == 0.002
    assert pytest.approx(res["eccentric_max_deviation"], 1e-5) == 0.003
    assert pytest.approx(res["zero_drift_absolute"], 1e-5) == 0.001
    assert pytest.approx(res["tare_error_absolute"], 1e-5) == 0.002

    # Derived categories & ratios
    assert res["instrument_age_bucket"] == "3 - 7 years"
    assert pytest.approx(res["historical_failure_rate"], 1e-5) == 0.25
    assert res["certificate_expiry_risk"] == 0.0
