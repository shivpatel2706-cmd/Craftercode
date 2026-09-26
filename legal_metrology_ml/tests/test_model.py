"""Automated tests for regulatory rules engine, decision policy, and model inference bounds."""
import pytest
from src.rules.rules_engine import RegulatoryRulesEngine
from src.models.predict import VerificationPredictor


def test_rules_engine_pass():
    """Verify clean measurements pass regulatory checks."""
    engine = RegulatoryRulesEngine()
    data = {
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
        "repeatability_reading_1": 15.000,
        "repeatability_reading_2": 15.001,
        "repeatability_reading_3": 15.001,
        "center_reading": 10.000,
        "front_left_reading": 10.001,
        "front_right_reading": 10.001,
        "back_left_reading": 10.001,
        "back_right_reading": 10.000,
        "initial_zero": 0.0,
        "final_zero": 0.001,
        "seal_condition": "Intact",
        "tampering_indicator": False,
        "display_functioning": True,
    }
    res = engine.evaluate(data)
    assert res["overall_rule_result"] == "PASS"
    assert res["accuracy_result"] == "PASS"
    assert res["repeatability_result"] == "PASS"
    assert res["eccentric_result"] == "PASS"
    assert res["zero_result"] == "PASS"


def test_rules_engine_fail_tampering():
    """Verify tampering triggers immediate regulatory failure."""
    engine = RegulatoryRulesEngine()
    data = {
        "instrument_type": "Electronic Weighing Machine",
        "accuracy_class": "III",
        "capacity": 30.0,
        "scale_interval": 0.005,
        "reference_load_1": 3.0,
        "observed_reading_1": 3.001,
        "reference_load_2": 15.0,
        "observed_reading_2": 15.001,
        "reference_load_3": 30.0,
        "observed_reading_3": 30.001,
        "repeatability_reading_1": 15.000,
        "repeatability_reading_2": 15.001,
        "repeatability_reading_3": 15.001,
        "center_reading": 10.000,
        "front_left_reading": 10.001,
        "initial_zero": 0.0,
        "final_zero": 0.0,
        "tampering_indicator": True,  # Flagged tampering
    }
    res = engine.evaluate(data)
    assert res["overall_rule_result"] == "FAIL"
    assert res["physical_inspection_result"] == "FAIL"
    assert any("tampering" in v.lower() for v in res["violations"])


def test_decision_policy_rules_fail_override_prevention():
    """Verify that a Rules Engine FAIL CANNOT be converted to PASS even if ML predicts PASS."""
    predictor = VerificationPredictor()
    failing_record = {
        "instrument_type": "Electronic Weighing Machine",
        "accuracy_class": "III",
        "capacity": 30.0,
        "scale_interval": 0.005,
        "reference_load_1": 3.0,
        "observed_reading_1": 3.500,  # Massive 500g error!
        "reference_load_2": 15.0,
        "observed_reading_2": 16.000,
        "reference_load_3": 30.0,
        "observed_reading_3": 32.000,
        "repeatability_reading_1": 15.000,
        "repeatability_reading_2": 15.000,
        "repeatability_reading_3": 15.000,
        "center_reading": 10.000,
        "front_left_reading": 10.000,
        "initial_zero": 0.0,
        "final_zero": 0.0,
        "tampering_indicator": True,
    }
    res = predictor.predict_verification(failing_record)
    assert res["rules_engine_result"] == "FAIL"
    assert res["final_result"] == "FAIL"
    assert res["risk_score"] >= 0.0
    assert res["confidence"] >= 0.0
