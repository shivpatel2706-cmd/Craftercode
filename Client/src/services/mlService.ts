/**
 * ML Service — communicates with the Legal Metrology ML Verification Engine
 * via the ASP.NET proxy at /api/ml  (which internally calls Python on port 8000).
 * The frontend only needs ONE server running: dotnet run.
 */
import { apiClient } from './api';

// Re-use the same Axios instance that already points at http://localhost:5051/api
// All ML calls go through  /api/ml/*  on the ASP.NET backend.
const ML_PREFIX = '/ml';

/* ─── Input Schema ─────────────────────────────────────────────────────────── */

export interface MLVerificationPayload {
  // Instrument Metadata
  instrument_id?: string;
  instrument_type: string;
  manufacturer?: string;
  model?: string;
  accuracy_class: string;
  capacity: number;
  scale_interval: number;
  instrument_age_years?: number;
  previous_verifications?: number;
  previous_failures?: number;
  repair_count?: number;
  last_verification_days_ago?: number;

  // Accuracy Test Loads & Readings (~10%, ~50%, ~100% capacity)
  reference_load_1: number;
  observed_reading_1: number;
  error_1?: number;
  reference_load_2: number;
  observed_reading_2: number;
  error_2?: number;
  reference_load_3: number;
  observed_reading_3: number;
  error_3?: number;

  // Repeatability Readings (at ~50% capacity)
  repeatability_reading_1: number;
  repeatability_reading_2: number;
  repeatability_reading_3: number;
  repeatability_reading_4?: number;
  repeatability_reading_5?: number;

  // Eccentric / Corner Load Test
  center_reading: number;
  front_left_reading?: number;
  front_right_reading?: number;
  back_left_reading?: number;
  back_right_reading?: number;

  // Zero Test
  initial_zero: number;
  final_zero: number;
  zero_drift?: number;

  // Tare Test (optional)
  tare_reference?: number;
  tare_observed?: number;
  tare_error?: number;

  // Sensitivity Test (optional)
  sensitivity_test_load?: number;
  sensitivity_indication_change?: number;
  sensitivity_error?: number;

  // Physical Inspection
  physical_condition?: string;
  display_condition?: string;
  platform_condition?: string;
  seal_condition?: string;
  tampering_indicator?: boolean;
  display_functioning?: boolean;

  // Documentation
  previous_certificate_available?: boolean;
  previous_certificate_valid?: boolean;
  certificate_expired_days?: number;
}

/* ─── Response Schema ──────────────────────────────────────────────────────── */

export interface MLFeatureExplanation {
  feature: string;
  impact: 'high' | 'medium' | 'low';
  direction: 'supports_pass' | 'supports_fail';
  observed_value?: number | string | null;
  shap_value?: number | null;
}

export interface MLPredictionResponse {
  prediction: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  confidence: number;
  risk_score: number;
  rules_engine_result: string;
  final_result: 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';
  model_version: string;
  decision_note?: string;
  rule_violations?: string[];
  explanation: MLFeatureExplanation[];
  request_id?: string;
  // Present when data is incomplete
  missing_fields?: string[];
  validation_errors?: string[];
  status_reason?: string;
}

export interface MLHealthResponse {
  status: string;
  service: string;
  model_loaded: boolean;
  calibrated_model_loaded: boolean;
  model_version: string;
}

export interface MLModelInfoResponse {
  model_name: string;
  model_version: string;
  primary_model: string;
  baseline_model: string;
  status: string;
  calibration_method: string;
  benchmark_metrics?: Record<string, number | object>;
}

/* ─── Service Methods ──────────────────────────────────────────────────────── */

export const mlService = {
  /**
   * Check whether the ML engine is running and models are loaded.
   * Calls GET /api/ml/health on the ASP.NET backend.
   */
  async checkHealth(): Promise<MLHealthResponse | null> {
    try {
      const res = await apiClient.get<MLHealthResponse>(`${ML_PREFIX}/health`);
      return res.data;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve model metadata and benchmark performance metrics.
   * Calls GET /api/ml/model/info on the ASP.NET backend.
   */
  async getModelInfo(): Promise<MLModelInfoResponse | null> {
    try {
      const res = await apiClient.get<MLModelInfoResponse>(`${ML_PREFIX}/model/info`);
      return res.data;
    } catch {
      return null;
    }
  },

  /**
   * Run the full AI/ML verification pipeline:
   * Regulatory Rules Engine → CatBoost ML → SHAP Explainability → Decision Policy.
   * Calls POST /api/ml/predict on the ASP.NET backend (proxied internally to Python).
   */
  async predictVerification(
    payload: MLVerificationPayload
  ): Promise<MLPredictionResponse> {
    const res = await apiClient.post<MLPredictionResponse>(`${ML_PREFIX}/predict`, payload);
    return res.data;
  },
};
