"""FastAPI application for Legal Metrology ML Verification Engine."""
import time
import uuid
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.schemas import (
    ModelInfoResponse,
    PredictionResponse,
    ValidationResponse,
    VerificationInputSchema,
)
from src.data.validate_dataset import validate_verification_record
from src.models.predict import VerificationPredictor
from src.rules.rules_engine import RegulatoryRulesEngine
from src.utils.logger import get_logger

logger = get_logger("api_service")

app = FastAPI(
    title="Legal Metrology ML Verification Engine",
    description=(
        "Standalone decision-support service for legal metrology weighing instrument inspections. "
        "Enforces physical sanity, regulatory rules engine evaluation, calibrated ML risk scoring, "
        "and SHAP model explainability."
    ),
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared Predictor and Rules Engine singletons
predictor = VerificationPredictor()
rules_engine = RegulatoryRulesEngine()


@app.middleware("http")
async def add_request_id_and_timing(request: Request, call_next):
    """Middleware attaching unique request_id and execution latency headers."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-Ms"] = f"{duration * 1000:.2f}"
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Structured error response for input validation failures."""
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.warning(f"[{req_id}] Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "Input payload failed schema validation.",
            "details": exc.errors(),
            "request_id": req_id,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Structured handler for standard HTTP exceptions."""
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail,
            "request_id": req_id,
        },
    )


@app.get("/health", summary="Health check and service status")
async def health_check() -> Dict[str, Any]:
    """Returns runtime health and artifact availability."""
    return {
        "status": "healthy",
        "service": "Legal Metrology ML Engine",
        "model_loaded": predictor.primary_model is not None,
        "calibrated_model_loaded": predictor.calibrated_model is not None,
        "model_version": predictor.model_version,
    }


@app.get("/model/info", response_model=ModelInfoResponse, summary="Model version and metadata")
async def get_model_info():
    """Returns model metadata, performance metrics, and configuration."""
    meta = predictor.metadata
    return ModelInfoResponse(
        model_name="Legal Metrology Verification Engine",
        model_version=predictor.model_version,
        primary_model="CatBoostClassifier",
        baseline_model="RandomForestClassifier",
        status="active" if predictor.primary_model is not None else "unloaded",
        calibration_method="sigmoid",
        benchmark_metrics=meta.get("test_metrics"),
    )


@app.post("/validate", response_model=ValidationResponse, summary="Validate physical sanity and regulatory checks")
async def validate_input(payload: VerificationInputSchema, request: Request):
    """Validates physical limits, positive dimensions, and regulatory rules."""
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    data_dict = payload.model_dump()
    
    is_valid, errors = validate_verification_record(data_dict)
    rules_eval = rules_engine.evaluate(data_dict)
    
    return ValidationResponse(
        is_valid=is_valid and (rules_eval["overall_rule_result"] != "REVIEW_REQUIRED"),
        errors=errors + rules_eval.get("violations", []),
        rules_assessment=rules_eval,
        request_id=req_id,
    )


@app.post("/predict", response_model=PredictionResponse, summary="Perform verification determination")
async def predict_verification(payload: VerificationInputSchema, request: Request):
    """
    Executes full decision-support verification:
    - Regulatory Rules Engine evaluation
    - Calibrated CatBoost ML prediction
    - Risk scoring and confidence calculation
    - SHAP local explanation
    - Decision policy arbitration
    """
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    data_dict = payload.model_dump()
    
    logger.info(f"[{req_id}] Received verification request for {data_dict.get('instrument_type')}")
    result = predictor.predict_verification(data_dict)
    result["request_id"] = req_id
    
    return PredictionResponse(**result)


@app.post("/explain", summary="Generate detailed SHAP feature attributions")
async def explain_verification(payload: VerificationInputSchema, request: Request):
    """Returns local SHAP feature impact rankings for inspection decision support."""
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    data_dict = payload.model_dump()
    
    result = predictor.predict_verification(data_dict)
    
    return {
        "request_id": req_id,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "risk_score": result["risk_score"],
        "rules_engine_result": result["rules_engine_result"],
        "final_result": result["final_result"],
        "top_contributing_factors": result["explanation"],
        "disclaimer": (
            "SHAP attributions represent statistical model contributions to the machine learning "
            "risk score. They are strictly decision-support aids and do not constitute statutory "
            "legal findings."
        ),
    }
