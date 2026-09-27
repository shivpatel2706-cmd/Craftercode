import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { applicationService } from '../../services/applicationService';
import { inspectionService } from '../../services/inspectionService';
import {
  mlService,
  MLVerificationPayload,
  MLPredictionResponse,
  MLFeatureExplanation,
} from '../../services/mlService';
import { Application } from '../../types/application';
import { InspectionResult } from '../../types/inspection';
import {
  Smartphone,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Save,
  Send,
  ArrowLeft,
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Info,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const n = (v: string): number => parseFloat(v) || 0;

function SectionHeader({
  letter,
  title,
  color = 'bg-blue-600',
}: {
  letter: string;
  title: string;
  color?: string;
}) {
  return (
    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
      <span
        className={`w-6 h-6 rounded-md ${color} text-white flex items-center justify-center text-xs`}
      >
        {letter}
      </span>
      {title}
    </h2>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 text-xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
}

/* ─── ML Result Panel — Professional Government Dashboard ──────────────────── */

type Verdict = 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';

const VERDICT_CONFIG: Record<Verdict, {
  bg: string; border: string; headerBg: string; headerText: string;
  badgeText: string; badgeBg: string; icon: React.ReactNode; tagline: string; dot: string;
}> = {
  PASS: {
    bg: 'bg-emerald-50', border: 'border-emerald-300',
    headerBg: 'bg-gradient-to-r from-emerald-700 to-emerald-600',
    headerText: 'text-emerald-50', badgeText: 'text-emerald-800', badgeBg: 'bg-emerald-100 border-emerald-300',
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
    tagline: 'Metrologically Compliant — Certificate Eligible',
    dot: 'bg-emerald-400',
  },
  FAIL: {
    bg: 'bg-rose-50', border: 'border-rose-300',
    headerBg: 'bg-gradient-to-r from-rose-700 to-rose-600',
    headerText: 'text-rose-50', badgeText: 'text-rose-800', badgeBg: 'bg-rose-100 border-rose-300',
    icon: <ShieldAlert className="w-8 h-8 text-white" />,
    tagline: 'Regulatory Non-Compliance Detected — Certification Denied',
    dot: 'bg-rose-400',
  },
  REVIEW_REQUIRED: {
    bg: 'bg-amber-50', border: 'border-amber-300',
    headerBg: 'bg-gradient-to-r from-amber-600 to-amber-500',
    headerText: 'text-amber-50', badgeText: 'text-amber-800', badgeBg: 'bg-amber-100 border-amber-300',
    icon: <AlertTriangle className="w-8 h-8 text-white" />,
    tagline: 'Borderline Result — Escalated for Supervisory Review',
    dot: 'bg-amber-400',
  },
};

function verdictKey(v: string): Verdict {
  if (v === 'PASS') return 'PASS';
  if (v === 'FAIL') return 'FAIL';
  return 'REVIEW_REQUIRED';
}

function verdictLabel(v: string) {
  if (v === 'PASS') return 'PASS';
  if (v === 'FAIL') return 'FAIL';
  return 'REVIEW REQUIRED';
}

function GaugeMeter({ value, size = 88 }: { value: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = Math.PI * r; // half circle
  const fill = circ * Math.min(Math.max(value, 0), 1);
  const pct = Math.round(value * 100);
  const color = value >= 0.7 ? '#10b981' : value >= 0.4 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
      {/* Track */}
      <path
        d={`M 5 ${size / 2} A ${r} ${r} 0 0 1 ${size - 5} ${size / 2}`}
        fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M 5 ${size / 2} A ${r} ${r} 0 0 1 ${size - 5} ${size / 2}`}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${fill} ${circ}`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      {/* Label */}
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle"
        fontSize="14" fontWeight="800" fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

function ShapWaterfallBar({ factor, index }: { factor: MLFeatureExplanation; index: number }) {
  const isPass = factor.direction === 'supports_pass';
  const impact = factor.impact;
  const barW = impact === 'high' ? 85 : impact === 'medium' ? 55 : 30;
  const rankColors = ['bg-indigo-600', 'bg-indigo-500', 'bg-indigo-400', 'bg-violet-500', 'bg-violet-400'];
  const passColor = 'bg-emerald-500'; const failColor = 'bg-rose-500';
  const barColor = isPass ? passColor : failColor;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 group">
      {/* Rank badge */}
      <div className={`w-5 h-5 rounded-full ${rankColors[index] || 'bg-slate-400'} flex items-center justify-center shrink-0`}>
        <span className="text-[9px] font-black text-white">{index + 1}</span>
      </div>

      {/* Feature name */}
      <div className="w-36 shrink-0">
        <p className="text-[11px] font-semibold text-slate-700 capitalize leading-tight truncate">
          {factor.feature.replace(/_/g, ' ')}
        </p>
        {factor.observed_value != null && (
          <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
            val: {String(factor.observed_value)}
          </p>
        )}
      </div>

      {/* Waterfall bar */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-700`}
            style={{ width: `${barW}%` }}
          />
        </div>
        <span className={`text-[10px] font-bold shrink-0 ${isPass ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isPass ? '−' : '+'}{(Math.abs(factor.shap_value ?? 0)).toFixed(3)}
        </span>
      </div>

      {/* Direction chip */}
      <div className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border
        ${isPass ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
        {isPass ? '▼ PASS' : '▲ RISK'}
      </div>
    </div>
  );
}

function MLResultPanel({ result, onReset }: { result: MLPredictionResponse; onReset: () => void }) {
  const vk = verdictKey(result.final_result);
  const cfg = VERDICT_CONFIG[vk];
  const conf = result.confidence;
  const risk = result.risk_score;

  return (
    <div className="rounded-2xl border-2 overflow-hidden shadow-lg" style={{ borderColor: '' }}>

      {/* ── Header Banner ── */}
      <div className={`${cfg.headerBg} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              {cfg.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
                <p className={`text-[10px] font-bold uppercase tracking-widest ${cfg.headerText} opacity-80`}>
                  AI/ML Verification Engine — Final Determination
                </p>
              </div>
              <p className={`text-2xl sm:text-3xl font-black tracking-widest ${cfg.headerText} mt-0.5`}>
                {verdictLabel(result.final_result)}
              </p>
              <p className={`text-[11px] ${cfg.headerText} opacity-75 mt-0.5`}>
                {cfg.tagline}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText} border`}>
              CatBoost v{result.model_version}
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText} border`}>
              {result.request_id ? `REQ: ${result.request_id.slice(0, 8).toUpperCase()}` : 'METROVERIFY ML'}
            </span>
          </div>
        </div>
      </div>

      <div className={`${cfg.bg} p-5 space-y-5`}>

        {/* ── Engine Breakdown Table ── */}
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-400 rounded" />
            Verification Pipeline Breakdown
          </p>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Engine Layer</th>
                  <th className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Method</th>
                  <th className="text-right px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wide text-[10px]">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">Regulatory Rules Engine</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">Deterministic MPE Brackets</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-black text-sm ${
                      result.rules_engine_result === 'PASS' ? 'text-emerald-700'
                        : result.rules_engine_result === 'FAIL' ? 'text-rose-700' : 'text-amber-600'
                    }`}>{result.rules_engine_result}</span>
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">CatBoost ML Model</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">Calibrated Probability (Platt)</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-black text-sm ${
                      result.prediction === 'PASS' ? 'text-emerald-700'
                        : result.prediction === 'FAIL' ? 'text-rose-700' : 'text-amber-600'
                    }`}>{result.prediction}</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-700">Decision Policy</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">Rules-Priority Arbitration</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-black text-sm ${vk === 'PASS' ? 'text-emerald-700' : vk === 'FAIL' ? 'text-rose-700' : 'text-amber-600'}`}>
                      {verdictLabel(result.final_result)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Gauge Meters ── */}
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-400 rounded" />
            Model Metrics
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Confidence */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center">
              <GaugeMeter value={conf} size={100} />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mt-1">Model Confidence</p>
              <p className={`text-xs font-black mt-0.5 ${conf >= 0.7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {conf >= 0.85 ? 'Very High' : conf >= 0.7 ? 'High' : conf >= 0.5 ? 'Moderate' : 'Low'}
              </p>
            </div>
            {/* Risk Score — inverted */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col items-center">
              <GaugeMeter value={risk} size={100} />
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mt-1">Risk Score</p>
              <p className={`text-xs font-black mt-0.5 ${risk < 0.2 ? 'text-emerald-600' : risk < 0.4 ? 'text-sky-600' : risk < 0.6 ? 'text-amber-600' : 'text-rose-600'}`}>
                {risk < 0.2 ? 'Very Low' : risk < 0.4 ? 'Low' : risk < 0.6 ? 'Moderate' : 'High'} Risk
              </p>
            </div>
          </div>
        </div>

        {/* ── Decision Note ── */}
        {result.decision_note && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-4 py-2 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-blue-100" />
              <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">System Decision Rationale</p>
            </div>
            <p className="text-xs text-slate-700 px-4 py-3 leading-relaxed">{result.decision_note}</p>
          </div>
        )}

        {/* ── Rule Violations ── */}
        {result.rule_violations && result.rule_violations.length > 0 && (
          <div className="bg-white border border-rose-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-rose-600 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-rose-100" />
                <p className="text-[10px] font-black text-rose-100 uppercase tracking-widest">Regulatory Violations Detected</p>
              </div>
              <span className="bg-white text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {result.rule_violations.length} VIOLATION{result.rule_violations.length > 1 ? 'S' : ''}
              </span>
            </div>
            <div className="divide-y divide-rose-100">
              {result.rule_violations.map((v, i) => (
                <div key={i} className="flex gap-3 items-start px-4 py-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-rose-800 leading-relaxed">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SHAP Waterfall ── */}
        {result.explanation && result.explanation.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-indigo-700 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-200" />
                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">
                  SHAP Feature Attribution — Top {result.explanation.length} Factors
                </p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[9px] text-indigo-200 font-semibold">
                  <span className="w-2 h-2 rounded-sm bg-emerald-400" />▼ Supports PASS
                </span>
                <span className="flex items-center gap-1 text-[9px] text-indigo-200 font-semibold">
                  <span className="w-2 h-2 rounded-sm bg-rose-400" />▲ Raises Risk
                </span>
              </div>
            </div>
            <div className="px-4 py-1">
              {result.explanation.map((f, i) => (
                <ShapWaterfallBar key={i} factor={f} index={i} />
              ))}
            </div>
            <div className="px-4 pb-3 pt-1 bg-slate-50 border-t border-slate-100">
              <p className="text-[9px] text-slate-400 italic leading-relaxed">
                ⚖ Legal Notice: SHAP feature attributions represent statistical model sensitivity.
                They must not be cited as statutory legal reasoning or official causes for refusal.
                Legal determinations must cite specific regulatory sections and MPE values.
              </p>
            </div>
          </div>
        )}

        {/* ── Re-run ── */}
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-700 py-2.5 border border-slate-200 hover:border-indigo-300 rounded-xl hover:bg-indigo-50 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-run Analysis with Updated Values
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────────── */

export const FieldInspectionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, info, error, warning } = useToast();

  const requestedAppId = searchParams.get('appId') || 'APP-2026-0841';
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId] = useState(requestedAppId);
  const [currentApp, setCurrentApp] = useState<Application | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mlOnline, setMlOnline] = useState<boolean | null>(null);

  /* ── Section A — Instrument Metadata ── */
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [instrumentType, setInstrumentType] = useState('Electronic Weighing Machine');
  const [accuracyClass, setAccuracyClass] = useState('III');
  const [capacity, setCapacity] = useState('30');
  const [scaleInterval, setScaleInterval] = useState('0.005');
  const [instrumentAgeYears, setInstrumentAgeYears] = useState('2');
  const [prevVerifications, setPrevVerifications] = useState('2');
  const [prevFailures, setPrevFailures] = useState('0');
  const [repairCount, setRepairCount] = useState('0');
  const [lastVerDaysAgo, setLastVerDaysAgo] = useState('365');
  const [manufacturer, setManufacturer] = useState('');
  const [modelName, setModelName] = useState('');

  /* ── Section B — Physical Inspection ── */
  const [physicalCondition, setPhysicalCondition] = useState('Good');
  const [sealCondition, setSealCondition] = useState('Intact');
  const [displayCondition, setDisplayCondition] = useState('Clear');
  const [tamperingIndicator, setTamperingIndicator] = useState(false);
  const [displayFunctioning, setDisplayFunctioning] = useState(true);
  const [manufacturerDetailsVerified, setManufacturerDetailsVerified] = useState(true);
  const [serialNumberVerified, setSerialNumberVerified] = useState(true);
  const [levelIndicatorOk, setLevelIndicatorOk] = useState(true);
  const [leadAndWireSealAffixed, setLeadAndWireSealAffixed] = useState(true);
  const [sealTagNumber, setSealTagNumber] = useState(
    `DL-LM-SEAL-${Math.floor(10000 + Math.random() * 90000)}`
  );

  /* ── Section C — Precision Measurements ── */
  // Accuracy (3 load points)
  const [refLoad1, setRefLoad1] = useState('3');
  const [obsReading1, setObsReading1] = useState('3.001');
  const [refLoad2, setRefLoad2] = useState('15');
  const [obsReading2, setObsReading2] = useState('15.002');
  const [refLoad3, setRefLoad3] = useState('30');
  const [obsReading3, setObsReading3] = useState('30.003');
  // Repeatability
  const [rpt1, setRpt1] = useState('15.000');
  const [rpt2, setRpt2] = useState('15.001');
  const [rpt3, setRpt3] = useState('15.001');
  const [rpt4, setRpt4] = useState('15.000');
  const [rpt5, setRpt5] = useState('15.001');
  // Eccentric
  const [centerReading, setCenterReading] = useState('10.000');
  const [frontLeft, setFrontLeft] = useState('10.001');
  const [frontRight, setFrontRight] = useState('10.002');
  const [backLeft, setBackLeft] = useState('10.001');
  const [backRight, setBackRight] = useState('10.000');
  // Zero Test
  const [initialZero, setInitialZero] = useState('0.000');
  const [finalZero, setFinalZero] = useState('0.001');
  // Tare (optional)
  const [tareRef, setTareRef] = useState('6.000');
  const [tareObs, setTareObs] = useState('6.001');
  // Sensitivity (optional)
  const [sensLoad, setSensLoad] = useState('0.007');
  const [sensChange, setSensChange] = useState('0.007');

  /* ── Section D — Documentation ── */
  const [modelApprovalNumber, setModelApprovalNumber] = useState('IND/09/2024/712');
  const [modelApprovalVerified, setModelApprovalVerified] = useState(true);
  const [previousCertificateAvailable, setPreviousCertificateAvailable] = useState(true);
  const [previousCertificateValid, setPreviousCertificateValid] = useState(true);
  const [userManualAvailable, setUserManualAvailable] = useState(true);
  const [taxInvoiceVerified, setTaxInvoiceVerified] = useState(true);
  const [certificateExpiredDays, setCertificateExpiredDays] = useState('0');

  /* ── Section E — ML & Result ── */
  const [mlResult, setMlResult] = useState<MLPredictionResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /* ── Section F — Final Result & Remarks ── */
  // Derived entirely from ML verdict — no manual override
  const result: InspectionResult =
    mlResult?.final_result === 'PASS'
      ? 'PASS'
      : mlResult?.final_result === 'FAIL'
      ? 'FAIL'
      : 'REQUIRES REINSPECTION';
  const [remarks, setRemarks] = useState(
    'All metrological tests conducted on-site in compliance with Legal Metrology General Rules 2011.'
  );
  const [uploadedPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
  ]);

  /* ── Effects ── */
  useEffect(() => {
    loadAppOptions();
    checkMLService();
  }, []);

  useEffect(() => {
    if (selectedAppId) loadSelectedApp(selectedAppId);
  }, [selectedAppId]);

  useEffect(() => {
    if (currentApp) {
      // Auto-populate instrument type from application
      if (currentApp.instrumentType) setInstrumentType(currentApp.instrumentType);
      if (currentApp.capacity) {
        const cap = parseFloat(currentApp.capacity);
        if (!isNaN(cap)) {
          setCapacity(String(cap));
          const half = cap / 2;
          const ten = cap * 0.1;
          setRefLoad1(ten.toFixed(3));
          setObsReading1(ten.toFixed(3));
          setRefLoad2(half.toFixed(3));
          setObsReading2(half.toFixed(3));
          setRefLoad3(cap.toFixed(3));
          setObsReading3(cap.toFixed(3));
          setRpt1(half.toFixed(3));
          setRpt2(half.toFixed(3));
          setRpt3(half.toFixed(3));
          setRpt4(half.toFixed(3));
          setRpt5(half.toFixed(3));
          setCenterReading((cap * 0.33).toFixed(3));
          setFrontLeft((cap * 0.33 + 0.001).toFixed(3));
          setFrontRight((cap * 0.33 + 0.002).toFixed(3));
          setBackLeft((cap * 0.33 + 0.001).toFixed(3));
          setBackRight((cap * 0.33).toFixed(3));
        }
      }
    }
  }, [currentApp]);

  const checkMLService = async () => {
    const health = await mlService.checkHealth();
    setMlOnline(health?.status === 'healthy' && health.model_loaded);
  };

  const loadAppOptions = async () => {
    try {
      const apps = await applicationService.getApplications();
      setApplications(apps);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSelectedApp = async (id: string) => {
    const app = await applicationService.getApplicationById(id);
    if (app) setCurrentApp(app);
  };

  /* ── Build ML Payload ── */
  const buildMLPayload = (): MLVerificationPayload => ({
    instrument_id: currentApp?.instrumentId,
    instrument_type: instrumentType,
    manufacturer: manufacturer || undefined,
    model: modelName || undefined,
    accuracy_class: accuracyClass,
    capacity: n(capacity),
    scale_interval: n(scaleInterval),
    instrument_age_years: n(instrumentAgeYears),
    previous_verifications: parseInt(prevVerifications) || 0,
    previous_failures: parseInt(prevFailures) || 0,
    repair_count: parseInt(repairCount) || 0,
    last_verification_days_ago: parseInt(lastVerDaysAgo) || 365,
    reference_load_1: n(refLoad1),
    observed_reading_1: n(obsReading1),
    reference_load_2: n(refLoad2),
    observed_reading_2: n(obsReading2),
    reference_load_3: n(refLoad3),
    observed_reading_3: n(obsReading3),
    repeatability_reading_1: n(rpt1),
    repeatability_reading_2: n(rpt2),
    repeatability_reading_3: n(rpt3),
    repeatability_reading_4: n(rpt4),
    repeatability_reading_5: n(rpt5),
    center_reading: n(centerReading),
    front_left_reading: n(frontLeft),
    front_right_reading: n(frontRight),
    back_left_reading: n(backLeft),
    back_right_reading: n(backRight),
    initial_zero: n(initialZero),
    final_zero: n(finalZero),
    tare_reference: n(tareRef) || undefined,
    tare_observed: n(tareObs) || undefined,
    sensitivity_test_load: n(sensLoad) || undefined,
    sensitivity_indication_change: n(sensChange) || undefined,
    physical_condition: physicalCondition,
    display_condition: displayCondition,
    seal_condition: sealCondition,
    tampering_indicator: tamperingIndicator,
    display_functioning: displayFunctioning,
    previous_certificate_available: previousCertificateAvailable,
    previous_certificate_valid: previousCertificateValid,
    certificate_expired_days: parseInt(certificateExpiredDays) || 0,
  });

  /* ── Run ML Analysis ── */
  const handleRunML = async () => {
    if (n(capacity) <= 0) {
      error('Please enter a valid instrument capacity first.');
      return;
    }
    if (n(scaleInterval) <= 0 || n(scaleInterval) >= n(capacity)) {
      error('Scale interval must be > 0 and < capacity.');
      return;
    }

    setIsAnalyzing(true);
    setMlResult(null);
    try {
      const payload = buildMLPayload();
      const prediction = await mlService.predictVerification(payload);
      setMlResult(prediction);

      // Toast notification based on ML verdict
      const finalVerdict = prediction.final_result;
      if (finalVerdict === 'PASS') {
        success('ML Analysis complete — instrument PASSED verification.', 'ML Analysis');
      } else if (finalVerdict === 'FAIL') {
        error('ML Analysis complete — instrument FAILED verification.', 'ML Analysis');
      } else {
        warning('ML Analysis flagged this instrument for supervisory review.', 'ML Analysis');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;

      if (status === 503) {
        // ML engine is still warming up (auto-started by dotnet, give it a few seconds)
        error(
          serverMsg || 'ML engine is still starting up. Please wait 5–10 seconds and try again.',
          'ML Engine Warming Up'
        );
      } else if (!err?.response) {
        // Network error — ASP.NET backend itself is not running
        error(
          'Cannot reach the server. Make sure the backend is running:\n  cd MetroVerify360 && dotnet run',
          'Backend Offline'
        );
      } else {
        error(serverMsg || `ML analysis failed (HTTP ${status}).`, 'ML Error');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ── Submit Inspection ── */
  const handleSaveDraft = async () => {
    info('Inspection draft saved to device storage.', 'Draft Saved');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp) {
      error('Please select an application to inspect.');
      return;
    }
    if (!mlResult) {
      error('Please run the ML Analysis in Section E before submitting.', 'ML Required');
      return;
    }

    setIsSubmitting(true);
    try {
      await inspectionService.submitInspection({
        applicationId: currentApp.id,
        instrumentId: currentApp.instrumentId,
        officerId: user?.id || 'usr_officer_1',
        officerName: user?.name || 'Inspector S. K. Verma',
        officerBadge: user?.badgeNumber || 'LMI-DL-2018-044',
        inspectionDate,
        location: currentApp.location,
        physical: {
          instrumentCondition:
            physicalCondition === 'Severely Damaged' || physicalCondition === 'Critical Corrosion'
              ? 'Damaged'
              : physicalCondition === 'Worn' || physicalCondition === 'Fair'
              ? 'Fair'
              : physicalCondition === 'Excellent'
              ? 'Excellent'
              : 'Good',
          manufacturerDetailsVerified,
          serialNumberVerified,
          sealCondition:
            sealCondition === 'New Seal Applied' || sealCondition === 'Verified'
              ? 'Intact'
              : sealCondition === 'Intact'
              ? 'Intact'
              : sealCondition === 'Broken'
              ? 'Broken'
              : sealCondition === 'Missing'
              ? 'Missing'
              : sealCondition === 'Tampered'
              ? 'Tampered'
              : 'Intact',
          displayCondition: displayFunctioning ? 'Clear & Readable' : 'Faulty Segments',
          levelIndicatorOk,
          leadAndWireSealAffixed,
          sealTagNumber,
        },
        measurement: {
          standardWeightsUsed: 'OIML Class M1 Standard Weights (Traceable to NPL/RRSL)',
          zeroLoadError: `${((n(finalZero) - n(initialZero)) * 1000).toFixed(1)} g`,
          observedMeasurement: `${obsReading3} kg on ${refLoad3} kg standard`,
          permissibleError: `+/- ${(n(scaleInterval) * 1000).toFixed(0)} g (MPE class ${accuracyClass})`,
          repeatabilityResult:
            Math.max(n(rpt1), n(rpt2), n(rpt3), n(rpt4), n(rpt5)) -
              Math.min(n(rpt1), n(rpt2), n(rpt3), n(rpt4), n(rpt5)) <=
            n(scaleInterval)
              ? 'Satisfactory (Range < 1 e)'
              : 'Unsatisfactory',
          eccentricityTestResult:
            Math.max(n(frontLeft), n(frontRight), n(backLeft), n(backRight)) -
              Math.min(n(frontLeft), n(frontRight), n(backLeft), n(backRight)) <=
            n(scaleInterval)
              ? 'Pass (Corners within MPE)'
              : 'Fail (Corner error exceeds MPE)',
          accuracyTestResult:
            mlResult?.final_result === 'PASS' ||
            (Math.abs(n(obsReading3) - n(refLoad3)) <= n(scaleInterval) * 2 &&
              Math.abs(n(obsReading2) - n(refLoad2)) <= n(scaleInterval) * 2)
              ? 'Pass'
              : 'Fail',
        },
        documentation: {
          modelApprovalVerified,
          modelApprovalNumber,
          previousCertificateVerified: previousCertificateAvailable,
          userManualAvailable,
          taxInvoiceVerified,
        },
        result,
        remarks,
        photos: uploadedPhotos,
      });

      success(`Field inspection submitted with result: ${result}`, 'Inspection Completed');
      navigate('/officer/completed-inspections');
    } catch (err) {
      error('Failed to submit inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Officer Suite</span>
        </button>
        <div className="flex items-center gap-2">
          {mlOnline === true && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              <Wifi className="w-3.5 h-3.5" />
              ML Engine Online
            </span>
          )}
          {mlOnline === false && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-full border border-red-200">
              <WifiOff className="w-3.5 h-3.5" />
              ML Engine Offline
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-200">
            <Smartphone className="w-3.5 h-3.5" />
            AI-Powered Inspection
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm">
        {/* Title */}
        <div className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              NAWI Field Inspection — ML Verification Sheet
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Conduct on-site metrological examination. Enter precision measurements and run the ML
            analysis engine for an AI-assisted PASS/FAIL determination under the Legal Metrology Act 2009.
          </p>
        </div>

        {/* Application Selector */}
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Select Assigned Verification Application
          </label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full text-sm font-semibold p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.id} — {app.instrumentName} ({app.status})
              </option>
            ))}
          </select>

          {currentApp && (
            <div className="pt-2 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 border-t border-slate-200">
              <div>
                <strong>Owner:</strong> {currentApp.ownerName}
              </div>
              <div>
                <strong>Serial:</strong>{' '}
                <span className="font-mono">{currentApp.serialNumber}</span>
              </div>
              <div className="sm:col-span-2">
                <strong>Location:</strong> {currentApp.location}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── SECTION A: Instrument Metadata ── */}
          <div>
            <SectionHeader letter="A" title="Instrument Metadata & Classification" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Inspection Date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                required
              />
              <Input
                label="Verifying Officer"
                value={`${user?.name || 'Inspector S. K. Verma'} (${user?.badgeNumber || 'LMI-DL-2018-044'})`}
                disabled
              />

              <Select
                label="Instrument Type"
                value={instrumentType}
                onChange={(e) => setInstrumentType(e.target.value)}
                options={[
                  { value: 'Electronic Weighing Machine', label: 'Electronic Weighing Machine' },
                  { value: 'Mechanical Weighing Machine', label: 'Mechanical Weighing Machine' },
                  { value: 'Weighbridge / Truck Scale', label: 'Weighbridge / Truck Scale' },
                  { value: 'Crane / Hanging Scale', label: 'Crane / Hanging Scale' },
                  { value: 'Counting Scale', label: 'Counting Scale' },
                  { value: 'Price Computing Scale', label: 'Price Computing Scale' },
                  {
                    value: 'Precision / Analytical Balance',
                    label: 'Precision / Analytical Balance',
                  },
                ]}
                required
              />

              <Select
                label="OIML Accuracy Class"
                value={accuracyClass}
                onChange={(e) => setAccuracyClass(e.target.value)}
                options={[
                  { value: 'I', label: 'Class I — Special Accuracy' },
                  { value: 'II', label: 'Class II — High Accuracy' },
                  { value: 'III', label: 'Class III — Medium Accuracy' },
                  { value: 'IIII', label: 'Class IIII — Ordinary Accuracy' },
                ]}
                required
              />

              <Input
                label="Max Capacity (kg)"
                type="number"
                step="any"
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
              <Input
                label="Scale Interval e (kg)"
                type="number"
                step="any"
                min="0"
                value={scaleInterval}
                onChange={(e) => setScaleInterval(e.target.value)}
                required
              />
              <Input
                label="Manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Avery India"
              />
              <Input
                label="Model Number"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. AVE-300"
              />
              <Input
                label="Instrument Age (years)"
                type="number"
                step="0.1"
                min="0"
                value={instrumentAgeYears}
                onChange={(e) => setInstrumentAgeYears(e.target.value)}
              />
              <Input
                label="Days Since Last Verification"
                type="number"
                min="0"
                value={lastVerDaysAgo}
                onChange={(e) => setLastVerDaysAgo(e.target.value)}
              />
              <Input
                label="Previous Verifications"
                type="number"
                min="0"
                value={prevVerifications}
                onChange={(e) => setPrevVerifications(e.target.value)}
              />
              <Input
                label="Previous Failures"
                type="number"
                min="0"
                value={prevFailures}
                onChange={(e) => setPrevFailures(e.target.value)}
              />
            </div>
          </div>

          {/* ── SECTION B: Physical Inspection ── */}
          <div>
            <SectionHeader letter="B" title="Physical & Visual Inspection" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Physical Condition"
                value={physicalCondition}
                onChange={(e) => setPhysicalCondition(e.target.value)}
                options={[
                  { value: 'Good', label: 'Good (Normal Wear)' },
                  { value: 'Fair', label: 'Fair (Acceptable)' },
                  { value: 'Worn', label: 'Worn (Visible Deterioration)' },
                  { value: 'Severely Damaged', label: 'Severely Damaged / Rust' },
                  { value: 'Critical Corrosion', label: 'Critical Corrosion' },
                ]}
                required
              />
              <Select
                label="Seal Condition"
                value={sealCondition}
                onChange={(e) => setSealCondition(e.target.value)}
                options={[
                  { value: 'Intact', label: 'Intact (Prior Official Seal)' },
                  { value: 'Verified', label: 'Verified' },
                  { value: 'New Seal Applied', label: 'New Seal Applied (Brand New)' },
                  { value: 'Broken', label: 'Broken' },
                  { value: 'Missing', label: 'Missing' },
                  { value: 'Tampered', label: 'Tampered (Evidence of Alteration)' },
                ]}
                required
              />
              <Select
                label="Display Condition"
                value={displayCondition}
                onChange={(e) => setDisplayCondition(e.target.value)}
                options={[
                  { value: 'Clear', label: 'Clear & Readable (All segments OK)' },
                  { value: 'Flickering', label: 'Flickering' },
                  { value: 'Faulty Segments', label: 'Faulty Segments' },
                  { value: 'Analog Needle Defective', label: 'Analog Needle Defective' },
                ]}
                required
              />
              <Input
                label="New Official Seal Tag Number"
                value={sealTagNumber}
                onChange={(e) => setSealTagNumber(e.target.value)}
                required
              />
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <Toggle
                checked={tamperingIndicator}
                onChange={setTamperingIndicator}
                label="⚠ Tampering indicator — suspicious mechanical/electronic alteration observed"
              />
              <Toggle
                checked={displayFunctioning}
                onChange={setDisplayFunctioning}
                label="Display/indication unit functioning correctly"
              />
              <Toggle
                checked={manufacturerDetailsVerified}
                onChange={setManufacturerDetailsVerified}
                label="Manufacturer plate, model, and year match statutory declarations"
              />
              <Toggle
                checked={serialNumberVerified}
                onChange={setSerialNumberVerified}
                label="Instrument serial number physically stamped/embossed and verified"
              />
              <Toggle
                checked={levelIndicatorOk}
                onChange={setLevelIndicatorOk}
                label="Spirit level / leveling bubble centered on stable foundation"
              />
              <Toggle
                checked={leadAndWireSealAffixed}
                onChange={setLeadAndWireSealAffixed}
                label="Tamper-evident verification seal wire properly routed through calibration switch"
              />
            </div>
          </div>

          {/* ── SECTION C: Precision Measurements ── */}
          <div>
            <SectionHeader
              letter="C"
              title="Precision Measurement Data (for ML Analysis)"
              color="bg-indigo-600"
            />
            <p className="text-xs text-slate-500 mb-4">
              Enter actual numeric readings observed during the metrological test. These values feed
              directly into the ML verification engine.
            </p>

            {/* Accuracy Test */}
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Accuracy Test — 3 Load Points
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-600">
                        Load Point
                      </th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-600">
                        Reference Load (kg)
                      </th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-600">
                        Observed Reading (kg)
                      </th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-600">
                        Error (kg)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Load 1 */}
                    <tr>
                      <td className="border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 bg-blue-50">
                        ~10% Capacity
                      </td>
                      <td className="border border-slate-200 px-1 py-1">
                        <input
                          type="number"
                          step="any"
                          value={refLoad1}
                          onChange={(e) => setRefLoad1(e.target.value)}
                          className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded font-mono"
                          required
                        />
                      </td>
                      <td className="border border-slate-200 px-1 py-1">
                        <input
                          type="number"
                          step="any"
                          value={obsReading1}
                          onChange={(e) => setObsReading1(e.target.value)}
                          className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded font-mono"
                          required
                        />
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5 font-mono text-slate-500">
                        {(n(obsReading1) - n(refLoad1)).toFixed(4)}
                      </td>
                    </tr>
                    {/* Load 2 */}
                    <tr>
                      <td className="border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 bg-blue-50">
                        ~50% Capacity
                      </td>
                      <td className="border border-slate-200 px-1 py-1">
                        <input
                          type="number"
                          step="any"
                          value={refLoad2}
                          onChange={(e) => setRefLoad2(e.target.value)}
                          className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded font-mono"
                          required
                        />
                      </td>
                      <td className="border border-slate-200 px-1 py-1">
                        <input
                          type="number"
                          step="any"
                          value={obsReading2}
                          onChange={(e) => setObsReading2(e.target.value)}
                          className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded font-mono"
                          required
                        />
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5 font-mono text-slate-500">
                        {(n(obsReading2) - n(refLoad2)).toFixed(4)}
                      </td>
                    </tr>
                    {/* Load 3 */}
                    <tr>
                      <td className="border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 bg-blue-50">
                        ~100% Capacity
                      </td>
                      <td className="border border-slate-200 px-1 py-1">
                        <input
                          type="number"
                          step="any"
                          value={refLoad3}
                          onChange={(e) => setRefLoad3(e.target.value)}
                          className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded font-mono"
                          required
                        />
                      </td>
                      <td className="border border-slate-200 px-1 py-1">
                        <input
                          type="number"
                          step="any"
                          value={obsReading3}
                          onChange={(e) => setObsReading3(e.target.value)}
                          className="w-full px-2 py-1 text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded font-mono"
                          required
                        />
                      </td>
                      <td className="border border-slate-200 px-3 py-1.5 font-mono text-slate-500">
                        {(n(obsReading3) - n(refLoad3)).toFixed(4)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Repeatability Test */}
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Repeatability Test — 5 Readings at ~50% Capacity
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  [rpt1, setRpt1],
                  [rpt2, setRpt2],
                  [rpt3, setRpt3],
                  [rpt4, setRpt4],
                  [rpt5, setRpt5],
                ].map(([val, setter], idx) => (
                  <div key={idx}>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Reading {idx + 1} (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={val as string}
                      onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      required={idx < 3}
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Range:{' '}
                <span className="font-mono font-semibold">
                  {(
                    Math.max(n(rpt1), n(rpt2), n(rpt3), n(rpt4), n(rpt5)) -
                    Math.min(n(rpt1), n(rpt2), n(rpt3), n(rpt4), n(rpt5))
                  ).toFixed(4)}{' '}
                  kg
                </span>{' '}
                — must not exceed scale interval e ({scaleInterval} kg)
              </p>
            </div>

            {/* Eccentric Test */}
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Eccentric / Corner Load Test (~33% Capacity)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Center Reading (kg) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={centerReading}
                    onChange={(e) => setCenterReading(e.target.value)}
                    className="w-full sm:w-40 px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
                {[
                  ['Front Left (kg)', frontLeft, setFrontLeft],
                  ['Front Right (kg)', frontRight, setFrontRight],
                  ['Back Left (kg)', backLeft, setBackLeft],
                  ['Back Right (kg)', backRight, setBackRight],
                ].map(([label, val, setter]) => (
                  <div key={label as string}>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      {label as string}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={val as string}
                      onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Zero, Tare, Sensitivity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Zero Test
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Initial Zero (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={initialZero}
                      onChange={(e) => setInitialZero(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Final Zero (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={finalZero}
                      onChange={(e) => setFinalZero(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Drift:{' '}
                  <span className="font-mono font-semibold">
                    {((n(finalZero) - n(initialZero)) * 1000).toFixed(1)} g
                  </span>{' '}
                  — limit: {(n(scaleInterval) * 500).toFixed(0)} g (0.5×e)
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Tare Test (optional)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Tare Reference (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={tareRef}
                      onChange={(e) => setTareRef(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Tare Observed (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={tareObs}
                      onChange={(e) => setTareObs(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 sm:col-span-2">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Sensitivity Test (optional)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Sensitivity Test Load (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={sensLoad}
                      onChange={(e) => setSensLoad(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Indication Change (kg)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={sensChange}
                      onChange={(e) => setSensChange(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION D: Documentation ── */}
          <div>
            <SectionHeader letter="D" title="Documentation Scrutiny" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
              <Input
                label="Government Model Approval Certificate No."
                value={modelApprovalNumber}
                onChange={(e) => setModelApprovalNumber(e.target.value)}
                required
              />
              <Input
                label="Certificate Expired Days (0 = valid)"
                type="number"
                min="0"
                value={certificateExpiredDays}
                onChange={(e) => setCertificateExpiredDays(e.target.value)}
              />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <Toggle
                checked={modelApprovalVerified}
                onChange={setModelApprovalVerified}
                label="Model Approval verified on Central Portal"
              />
              <Toggle
                checked={taxInvoiceVerified}
                onChange={setTaxInvoiceVerified}
                label="Tax Invoice / Purchase proof verified"
              />
              <Toggle
                checked={userManualAvailable}
                onChange={setUserManualAvailable}
                label="Operator instruction manual available"
              />
              <Toggle
                checked={previousCertificateAvailable}
                onChange={setPreviousCertificateAvailable}
                label="Previous certificate available"
              />
              <Toggle
                checked={previousCertificateValid}
                onChange={setPreviousCertificateValid}
                label="Previous certificate currently valid"
              />
            </div>
          </div>

          {/* ── SECTION E: ML Analysis ── */}
          <div>
            <SectionHeader letter="E" title="AI/ML Verification Analysis" color="bg-indigo-600" />

            {/* ML Offline Warning */}
            {mlOnline === false && (
              <div className="mb-4 rounded-xl overflow-hidden border border-amber-300 shadow-sm">
                <div className="bg-amber-500 px-4 py-2 flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-white" />
                  <p className="text-xs font-black text-white uppercase tracking-widest">ML Engine Offline</p>
                </div>
                <div className="p-4 bg-amber-50 text-xs text-amber-900">
                  <p className="font-semibold mb-2">Start the verification engine with:</p>
                  <code className="block bg-slate-900 text-green-400 px-3 py-2 rounded-lg font-mono text-[11px] break-all leading-relaxed">
                    cd "C:\Users\Shivp\ml model\legal_metrology_ml"<br />
                    python -m uvicorn src.api.main:app --port 8000 --reload
                  </code>
                  <p className="mt-2 text-amber-700">Then refresh this page — the engine indicator will turn green.</p>
                </div>
              </div>
            )}

            {!mlResult ? (
              /* ── Pre-Analysis Professional Card ── */
              <div className="rounded-2xl border-2 border-indigo-200 overflow-hidden shadow-md">
                {/* Dark header */}
                <div className="bg-gradient-to-r from-indigo-800 to-indigo-700 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                        MetroVerify 360 — Legal Metrology ML Engine v1.0
                      </p>
                      <p className="text-xl font-black text-white mt-0.5">
                        AI-Powered Verification Analysis
                      </p>
                      <p className="text-[11px] text-indigo-300 mt-0.5">
                        CatBoost · Regulatory Rules · SHAP Explainability
                      </p>
                    </div>
                  </div>

                  {/* Pipeline stage chips */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {[
                      { label: '01 — Rules Engine', sub: 'MPE Bracket Check' },
                      { label: '02 — ML Model', sub: 'CatBoost + Platt Calibration' },
                      { label: '03 — Decision Policy', sub: 'Arbitration & SHAP' },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
                        <div>
                          <p className="text-[10px] font-black text-white">{s.label}</p>
                          <p className="text-[9px] text-indigo-300">{s.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="bg-indigo-50 px-5 py-5 space-y-5">
                  {/* What the engine checks */}
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-slate-400 rounded" />
                      Engine Verification Checklist
                    </p>
                    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
                      {[
                        { icon: <ShieldCheck className="w-4 h-4 text-indigo-500" />, label: 'Physical & Seal Compliance', desc: 'Tamper detection, display functioning, seal integrity check' },
                        { icon: <Scale className="w-4 h-4 text-indigo-500" />, label: 'Metrological Accuracy (MPE)', desc: 'Error 1/2/3 vs. OIML R76 Maximum Permissible Error brackets' },
                        { icon: <TrendingUp className="w-4 h-4 text-indigo-500" />, label: 'Repeatability & Eccentricity', desc: 'Reading spread and corner-load deviations vs. scale interval e' },
                        { icon: <BrainCircuit className="w-4 h-4 text-indigo-500" />, label: 'CatBoost ML Risk Scoring', desc: 'Calibrated probability of failure across 68 engineered features' },
                        { icon: <Info className="w-4 h-4 text-indigo-500" />, label: 'SHAP Feature Attribution', desc: 'Top-5 factors driving the risk score with directional impact' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                          <div className="ml-auto">
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              Queued
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model info strip */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Primary Model', value: 'CatBoostClassifier' },
                      { label: 'Test Accuracy', value: '94.47%' },
                      { label: 'False PASS Rate', value: '7.1% (min.)' },
                    ].map((m) => (
                      <div key={m.label} className="bg-white rounded-xl border border-slate-200 px-3 py-2.5 text-center shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{m.label}</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={handleRunML}
                    disabled={isAnalyzing}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-sm transition-all shadow-lg
                      ${isAnalyzing
                        ? 'bg-indigo-400 cursor-not-allowed text-white'
                        : 'bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white active:scale-[0.98]'
                      }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Running Verification Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="w-5 h-5" />
                        <span>Run AI/ML Verification Analysis</span>
                        <span className="text-xs font-semibold text-indigo-200 bg-indigo-800/50 px-2 py-0.5 rounded-full">
                          CatBoost + SHAP
                        </span>
                      </>
                    )}
                  </button>

                  <p className="text-[9px] text-slate-400 text-center">
                    ⚖ Decision-support only. Final statutory determination under Legal Metrology Act 2009, Section 24.
                  </p>
                </div>
              </div>
            ) : (
              <MLResultPanel result={mlResult} onReset={() => setMlResult(null)} />
            )}
          </div>

          {/* ── SECTION F: Photos, Remarks, Final Result ── */}
          <div>
            <SectionHeader letter="F" title="Evidence, Remarks & Statutory Recommendation" />

            {/* Photos */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                On-Site Evidence Photos ({uploadedPhotos.length} Attached)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-300"
                  >
                    <img src={url} alt="Proof" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1 rounded font-mono">
                      Photo {idx + 1}
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => alert('Camera capture integrated for mobile inspection device.')}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:text-blue-700 transition-colors"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                </button>
              </div>
            </div>

            <Textarea
              label="Verifying Officer Remarks & Notes"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              required
            />

            {/* Final ML Verdict — Read-Only, set by ML engine */}
            <div className="mt-5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Statutory Decision — Determined by ML Verification Engine
              </label>

              {!mlResult ? (
                <div className="flex items-center gap-3 p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                  <BrainCircuit className="w-8 h-8 text-slate-300 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-400">Awaiting ML Analysis</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Complete Section E — Run ML Analysis to determine the verdict automatically.
                    </p>
                  </div>
                </div>
              ) : result === 'PASS' ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xl font-black text-emerald-800 tracking-widest">PASS</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Instrument is metrologically compliant — certificate will be issued.
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200">
                    ML VERDICT
                  </span>
                </div>
              ) : result === 'FAIL' ? (
                <div className="flex items-center gap-3 p-4 bg-rose-50 border-2 border-rose-500 rounded-xl">
                  <XCircle className="w-9 h-9 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-xl font-black text-rose-800 tracking-widest">FAIL</p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      Instrument does not meet regulatory requirements — certification denied.
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-rose-500 bg-rose-100 px-2 py-1 rounded-full border border-rose-200">
                    ML VERDICT
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-500 rounded-xl">
                  <AlertTriangle className="w-9 h-9 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-lg font-black text-amber-800 tracking-widest">REQUIRES REINSPECTION</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Borderline result — flagged for supervisory verification.
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-amber-500 bg-amber-100 px-2 py-1 rounded-full border border-amber-200">
                    ML VERDICT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              icon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>

            {!mlResult ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-sm font-semibold">
                <BrainCircuit className="w-5 h-5" />
                Run ML Analysis to unlock submission
              </div>
            ) : (
              <Button
                type="submit"
                variant={
                  result === 'PASS' ? 'success' : result === 'FAIL' ? 'danger' : 'primary'
                }
                size="lg"
                isLoading={isSubmitting}
                icon={<Send className="w-4 h-4" />}
                className="w-full sm:w-auto font-bold px-8 shadow-md"
              >
                Submit — {result === 'PASS' ? '✅ PASS' : result === 'FAIL' ? '❌ FAIL' : '⚠ REINSPECT'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
