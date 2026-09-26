"""Automated tests for FastAPI endpoints, request schemas, and error handlers."""
import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify GET /health returns 200 and health status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert "model_version" in data


def test_model_info_endpoint():
    """Verify GET /model/info returns metadata schema."""
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["primary_model"] == "CatBoostClassifier"
    assert data["baseline_model"] == "RandomForestClassifier"


def test_predict_endpoint_valid_pass():
    """Verify POST /predict succeeds on standard compliant instrument payload."""
    payload = {
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
        "initial_zero": 0.0,
        "final_zero": 0.001,
        "tampering_indicator": False,
        "display_functioning": True,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "prediction" in res
    assert "confidence" in res
    assert "risk_score" in res
    assert "rules_engine_result" in res
    assert "final_result" in res
    assert "explanation" in res
    assert "request_id" in res
    assert response.headers.get("X-Request-ID") is not None


def test_predict_endpoint_validation_error():
    """Verify POST /predict returns structured 422 error when capacity is negative."""
    payload = {
        "instrument_type": "Electronic Weighing Machine",
        "accuracy_class": "III",
        "capacity": -30.0,  # Negative capacity violates schema gt=0
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
        "initial_zero": 0.0,
        "final_zero": 0.001,
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    err_body = response.json()
    assert err_body["error"] == "Validation Error"
    assert "request_id" in err_body


def test_explain_endpoint():
    """Verify POST /explain returns local SHAP feature impact ranking."""
    payload = {
        "instrument_type": "Price Computing Scale",
        "accuracy_class": "III",
        "capacity": 15.0,
        "scale_interval": 0.005,
        "reference_load_1": 1.5,
        "observed_reading_1": 1.501,
        "reference_load_2": 7.5,
        "observed_reading_2": 7.502,
        "reference_load_3": 15.0,
        "observed_reading_3": 15.003,
        "repeatability_reading_1": 7.500,
        "repeatability_reading_2": 7.501,
        "repeatability_reading_3": 7.501,
        "center_reading": 5.000,
        "front_left_reading": 5.001,
        "initial_zero": 0.0,
        "final_zero": 0.001,
    }
    response = client.post("/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "top_contributing_factors" in data
    assert "disclaimer" in data
