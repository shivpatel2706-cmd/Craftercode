"""Automated tests for dataset generation, schema checks, and physical sanity validations."""
import pytest
from src.data.generate_dataset import generate_synthetic_dataset
from src.data.validate_dataset import validate_verification_record, validate_dataset_dataframe


def test_generate_synthetic_dataset():
    """Verify synthetic dataset generator produces expected records and columns."""
    df = generate_synthetic_dataset(num_rows=50, seed=123)
    assert len(df) == 50
    assert "instrument_type" in df.columns
    assert "verification_result" in df.columns
    assert "accuracy_class" in df.columns
    assert "capacity" in df.columns
    assert "scale_interval" in df.columns
    assert set(df["verification_result"].unique()).issubset({"PASS", "FAIL"})


def test_validate_record_valid():
    """Verify clean record passes validation."""
    valid_record = {
        "instrument_type": "Electronic Weighing Machine",
        "accuracy_class": "III",
        "capacity": 30.0,
        "scale_interval": 0.005,
        "reference_load_1": 3.0,
        "observed_reading_1": 3.001,
        "reference_load_2": 15.0,
        "observed_reading_2": 15.002,
        "reference_load_3": 30.0,
        "observed_reading_3": 30.003,
    }
    is_valid, errors = validate_verification_record(valid_record)
    assert is_valid is True
    assert len(errors) == 0


def test_validate_record_missing_required_fields():
    """Verify missing mandatory fields are trapped."""
    invalid_record = {
        "accuracy_class": "III",
        "capacity": 30.0,
    }
    is_valid, errors = validate_verification_record(invalid_record)
    assert is_valid is False
    assert any("instrument_type" in e for e in errors)
    assert any("scale_interval" in e for e in errors)


def test_validate_record_negative_capacity():
    """Verify negative capacity triggers failure."""
    invalid_record = {
        "instrument_type": "Counting Scale",
        "accuracy_class": "III",
        "capacity": -10.0,
        "scale_interval": 0.001,
    }
    is_valid, errors = validate_verification_record(invalid_record)
    assert is_valid is False
    assert any("Capacity must be strictly positive" in e for e in errors)


def test_validate_record_invalid_scale_interval():
    """Verify scale_interval >= capacity triggers error."""
    invalid_record = {
        "instrument_type": "Electronic Weighing Machine",
        "accuracy_class": "III",
        "capacity": 30.0,
        "scale_interval": 35.0,
    }
    is_valid, errors = validate_verification_record(invalid_record)
    assert is_valid is False
    assert any("scale interval" in e.lower() and "capacity" in e.lower() for e in errors)


def test_validate_record_out_of_range_reading():
    """Verify extreme reading out of physical range is rejected."""
    invalid_record = {
        "instrument_type": "Electronic Weighing Machine",
        "accuracy_class": "III",
        "capacity": 30.0,
        "scale_interval": 0.005,
        "reference_load_1": 5.0,
        "observed_reading_1": 500.0,  # Ridiculously high reading (>1.5x capacity)
    }
    is_valid, errors = validate_verification_record(invalid_record)
    assert is_valid is False
    assert any("outside reasonable physical range" in e for e in errors)
