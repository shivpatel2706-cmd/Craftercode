/**
 * ML Service — communicates with the Legal Metrology ML Verification Engine
 * via the ASP.NET proxy at /api/ml.
 *
 * Frontend → ASP.NET backend → Python ML Engine
 */

import { apiClient, API_BASE_URL } from './api';

// All ML calls go through /api/ml/* on the ASP.NET backend.
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

  // Accuracy Test Loads & Readings
  reference_load_1: number;
  observed_reading_1: number;
  error_1?: number;

  reference_load_2: number;
  observed_reading_2: number;
  error_2?: number;

  reference_load_3: number;
  observed_reading_3: number;
  error_3?: number;

  // Repeatability Readings
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

  // Tare Test
  tare_reference?: number;
  tare_observed?: number;
  tare_error?: number;

  // Sensitivity Test
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
   *
   * Request:
   * GET /api/ml/health
   *
   * Frontend:
   * /api/ml/health
   *
   * ASP.NET:
   * /api/ml/health
   *
   * Python ML:
   * /health
   */
  async checkHealth(): Promise<MLHealthResponse | null> {
    try {
      const healthUrl = `${API_BASE_URL}${ML_PREFIX}/health`;

      console.log('────────────────────────────────────');
      console.log('ML HEALTH CHECK');
      console.log('URL:', healthUrl);

      const res = await apiClient.get<MLHealthResponse>(
        `${ML_PREFIX}/health`
      );

      console.log('HTTP STATUS:', res.status);
      console.log('RESPONSE:', res.data);

      if (
        res.data &&
        res.data.status === 'healthy' &&
        res.data.model_loaded === true
      ) {
        console.log('✅ ML ENGINE ONLINE');
      } else {
        console.warn('⚠️ ML ENGINE RESPONSE IS NOT HEALTHY');
      }

      console.log('────────────────────────────────────');

      return res.data;
    } catch (error) {
      console.error('────────────────────────────────────');
      console.error('❌ ML HEALTH CHECK FAILED');
      console.error('URL:', `${API_BASE_URL}${ML_PREFIX}/health`);
      console.error('ERROR:', error);
      console.error('────────────────────────────────────');

      return null;
    }
  },

  /**
   * Retrieve model metadata and benchmark performance metrics.
   *
   * GET /api/ml/model/info
   */
  async getModelInfo(): Promise<MLModelInfoResponse | null> {
    try {
      const res = await apiClient.get<MLModelInfoResponse>(
        `${ML_PREFIX}/model/info`
      );

      return res.data;
    } catch (error) {
      console.error('ML MODEL INFO FAILED:', error);
      return null;
    }
  },

  /**
   * Run the full AI/ML verification pipeline:
   *
   * Regulatory Rules Engine
   * → CatBoost ML
   * → SHAP Explainability
   * → Decision Policy
   *
   * POST /api/ml/predict
   */
  async predictVerification(
    payload: MLVerificationPayload
  ): Promise<MLPredictionResponse> {
    const res = await apiClient.post<MLPredictionResponse>(
      `${ML_PREFIX}/predict`,
      payload
    );

    return res.data;
  },
};