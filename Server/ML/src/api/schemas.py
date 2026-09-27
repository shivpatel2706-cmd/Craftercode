"""Pydantic schemas for Legal Metrology ML verification REST API."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class VerificationInputSchema(BaseModel):
    """Input payload representing physical verification test records."""

    # Instrument Metadata
    instrument_id: Optional[str] = Field(None, examples=["INST-10492"])
    instrument_type: str = Field(..., examples=["Electronic Weighing Machine"])
    manufacturer: Optional[str] = Field("Avery India", examples=["Avery India"])
    model: Optional[str] = Field("AVE-302", examples=["AVE-302"])
    accuracy_class: str = Field("III", examples=["III"])
    capacity: float = Field(..., gt=0, description="Maximum instrument capacity in kg", examples=[30.0])
    scale_interval: float = Field(..., gt=0, description="Verification scale interval 'e' in kg", examples=[0.005])
    instrument_age_years: Optional[float] = Field(2.5, ge=0, examples=[2.5])
    previous_verifications: Optional[int] = Field(3, ge=0, examples=[3])
    previous_failures: Optional[int] = Field(0, ge=0, examples=[0])
    repair_count: Optional[int] = Field(0, ge=0, examples=[0])
    last_verification_days_ago: Optional[int] = Field(365, ge=0, examples=[365])

    # Accuracy Test Loads & Readings
    reference_load_1: float = Field(..., gt=0, examples=[3.0])
    observed_reading_1: float = Field(..., examples=[3.001])
    error_1: Optional[float] = Field(None, examples=[0.001])

    reference_load_2: float = Field(..., gt=0, examples=[15.0])
    observed_reading_2: float = Field(..., examples=[15.002])
    error_2: Optional[float] = Field(None, examples=[0.002])

    reference_load_3: float = Field(..., gt=0, examples=[30.0])
    observed_reading_3: float = Field(..., examples=[30.004])
    error_3: Optional[float] = Field(None, examples=[0.004])

    # Repeatability
    repeatability_reading_1: float = Field(..., examples=[15.000])
    repeatability_reading_2: float = Field(..., examples=[15.001])
    repeatability_reading_3: float = Field(..., examples=[15.001])
    repeatability_reading_4: Optional[float] = Field(15.000, examples=[15.000])
    repeatability_reading_5: Optional[float] = Field(15.001, examples=[15.001])

    # Eccentric Loading
    center_reading: float = Field(..., examples=[10.000])
    front_left_reading: Optional[float] = Field(10.001, examples=[10.001])
    front_right_reading: Optional[float] = Field(10.002, examples=[10.002])
    back_left_reading: Optional[float] = Field(10.001, examples=[10.001])
    back_right_reading: Optional[float] = Field(10.000, examples=[10.000])

    # Zero Test
    initial_zero: float = Field(0.0, examples=[0.0])
    final_zero: float = Field(0.001, examples=[0.001])
    zero_drift: Optional[float] = Field(None, examples=[0.001])

    # Tare Test
    tare_reference: Optional[float] = Field(6.0, examples=[6.0])
    tare_observed: Optional[float] = Field(6.001, examples=[6.001])
    tare_error: Optional[float] = Field(None, examples=[0.001])

    # Sensitivity Test
    sensitivity_test_load: Optional[float] = Field(0.007, examples=[0.007])
    sensitivity_indication_change: Optional[float] = Field(0.007, examples=[0.007])
    sensitivity_error: Optional[float] = Field(None, examples=[0.0])

    # Physical Inspection & Status
    physical_condition: Optional[str] = Field("Good", examples=["Good"])
    display_condition: Optional[str] = Field("Clear", examples=["Clear"])
    platform_condition: Optional[str] = Field("Level & Clean", examples=["Level & Clean"])
    seal_condition: Optional[str] = Field("Intact", examples=["Intact"])
    tampering_indicator: Optional[bool] = Field(False, examples=[False])
    display_functioning: Optional[bool] = Field(True, examples=[True])

    # Documentation
    previous_certificate_available: Optional[bool] = Field(True, examples=[True])
    previous_certificate_valid: Optional[bool] = Field(True, examples=[True])
    certificate_expired_days: Optional[int] = Field(0, examples=[0])

    @field_validator("scale_interval")
    @classmethod
    def validate_scale_interval(cls, v, info):
        cap = info.data.get("capacity")
        if cap is not None and v >= cap:
            raise ValueError(f"scale_interval ({v}) must be strictly less than capacity ({cap})")
        return v


class FeatureExplanation(BaseModel):
    """Attribution item indicating local feature impact on ML determination."""
    feature: str
    impact: str = Field(..., description="Qualitative impact level: 'high', 'medium', or 'low'")
    direction: str = Field(..., description="'supports_pass' or 'supports_fail'")
    observed_value: Optional[Any] = None
    shap_value: Optional[float] = None


class PredictionResponse(BaseModel):
    """Standardized decision-support response schema."""
    prediction: str = Field(..., examples=["PASS"])
    confidence: float = Field(..., ge=0.0, le=1.0, examples=[0.94])
    risk_score: float = Field(..., ge=0.0, le=1.0, examples=[0.06])
    rules_engine_result: str = Field(..., examples=["PASS"])
    final_result: str = Field(..., examples=["PASS"])
    model_version: str = Field(..., examples=["1.0.0"])
    decision_note: Optional[str] = None
    rule_violations: Optional[List[str]] = None
    explanation: List[FeatureExplanation] = Field(default_factory=list)
    request_id: Optional[str] = None


class ValidationResponse(BaseModel):
    """Schema validation and physical limits assessment response."""
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    rules_assessment: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None


class ModelInfoResponse(BaseModel):
    """Model metadata, version, and performance statistics."""
    model_name: str
    model_version: str
    primary_model: str
    baseline_model: str
    status: str
    calibration_method: str
    benchmark_metrics: Optional[Dict[str, Any]] = None
