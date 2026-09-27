"""Configurable Regulatory Rules Engine for Legal Metrology Verification.

NOTE: All thresholds in this engine and its configuration are DEMONSTRATION VALUES ONLY.
They demonstrate regulatory calculation patterns (e.g. OIML R76 MPE brackets) and do not
represent official statutory limits. Real-world deployments must load legally certified rules.
"""
from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml
from src.utils.logger import get_logger

logger = get_logger("rules_engine")

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "config" / "rules_config.yaml"


class RegulatoryRulesEngine:
    """Configurable regulatory rules engine evaluating test-level and overall compliance."""

    def __init__(self, config_path: Optional[Path | str] = None):
        path = Path(config_path) if config_path else DEFAULT_CONFIG_PATH
        if not path.exists():
            logger.warning(f"Rules config path '{path}' does not exist. Using built-in demonstration defaults.")
            self.config = self._get_fallback_config()
        else:
            with open(path, "r", encoding="utf-8") as f:
                self.config = yaml.safe_load(f)
        
        self.metadata = self.config.get("metadata", {})
        self.mpe_multipliers = self.config.get("mpe_multipliers", {})
        self.instrument_modifiers = self.config.get("instrument_type_modifiers", {})
        self.tolerances = self.config.get("tolerances", {})
        self.physical_rules = self.config.get("physical_inspection_rules", {})

    def _get_fallback_config(self) -> Dict[str, Any]:
        return {
            "metadata": {"status": "DEMONSTRATION_VALUES_ONLY", "version": "fallback"},
            "mpe_multipliers": {
                "I": {"bracket_1": {"max_e": 50000, "mpe_e": 1.0}, "bracket_2": {"max_e": 200000, "mpe_e": 2.0}, "bracket_3": {"max_e": None, "mpe_e": 3.0}},
                "II": {"bracket_1": {"max_e": 5000, "mpe_e": 1.0}, "bracket_2": {"max_e": 20000, "mpe_e": 2.0}, "bracket_3": {"max_e": None, "mpe_e": 3.0}},
                "III": {"bracket_1": {"max_e": 500, "mpe_e": 1.0}, "bracket_2": {"max_e": 2000, "mpe_e": 2.0}, "bracket_3": {"max_e": None, "mpe_e": 3.0}},
                "IIII": {"bracket_1": {"max_e": 50, "mpe_e": 1.0}, "bracket_2": {"max_e": 200, "mpe_e": 2.0}, "bracket_3": {"max_e": None, "mpe_e": 3.0}},
            },
            "default_mpe_e": 2.0,
            "instrument_type_modifiers": {},
            "tolerances": {
                "accuracy": {"multiplier_of_mpe": 1.0},
                "repeatability": {"multiplier_of_mpe": 1.0},
                "eccentricity": {"multiplier_of_mpe": 1.0},
                "zero_drift": {"max_e_multiplier": 0.5},
                "tare": {"multiplier_of_mpe": 1.0},
                "sensitivity": {"min_indication_ratio": 0.7},
            },
            "physical_inspection_rules": {
                "disallow_tampering": True,
                "require_display_functioning": True,
                "unacceptable_seal_conditions": ["Broken", "Missing", "Tampered"],
                "unacceptable_physical_conditions": ["Severely Damaged", "Critical Corrosion"],
            },
        }

    def calculate_mpe(
        self,
        load: float,
        scale_interval: float,
        accuracy_class: str,
        instrument_type: str,
    ) -> float:
        """
        Calculates Maximum Permissible Error (MPE) for a given reference load.
        Based on number of scale intervals m = load / scale_interval.
        """
        if scale_interval <= 0:
            return 0.0

        m = load / scale_interval
        brackets = self.mpe_multipliers.get(str(accuracy_class).upper(), {})
        
        mpe_e = self.config.get("default_mpe_e", 2.0)
        if brackets:
            b1 = brackets.get("bracket_1", {})
            b2 = brackets.get("bracket_2", {})
            b3 = brackets.get("bracket_3", {})

            if b1.get("max_e") is not None and m <= b1["max_e"]:
                mpe_e = b1.get("mpe_e", 1.0)
            elif b2.get("max_e") is not None and m <= b2["max_e"]:
                mpe_e = b2.get("mpe_e", 2.0)
            else:
                mpe_e = b3.get("mpe_e", 3.0)

        # Apply instrument modifier
        mod = self.instrument_modifiers.get(instrument_type, 1.0)
        return float(mpe_e * scale_interval * mod)

    def evaluate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates physical measurements and conditions against regulatory rules.
        Returns test-level results and overall_rule_result ('PASS', 'FAIL', 'REVIEW_REQUIRED').
        """
        violations: List[str] = []
        details: Dict[str, Any] = {}

        inst_type = str(data.get("instrument_type", "Electronic Weighing Machine"))
        acc_class = str(data.get("accuracy_class", "III"))
        
        try:
            capacity = float(data.get("capacity", 0.0))
            scale_interval = float(data.get("scale_interval", 0.0))
        except (ValueError, TypeError):
            return {
                "overall_rule_result": "REVIEW_REQUIRED",
                "violations": ["Invalid or non-numeric capacity or scale_interval"],
                "details": {"error": "Invalid capacity or scale_interval"},
            }

        if capacity <= 0 or scale_interval <= 0:
            return {
                "overall_rule_result": "REVIEW_REQUIRED",
                "violations": [f"Invalid capacity ({capacity}) or scale_interval ({scale_interval})"],
                "details": {"error": "Capacity and scale interval must be strictly positive"},
            }

        # 1. Physical inspection & Tampering checks
        physical_res = "PASS"
        if data.get("tampering_indicator") is True:
            physical_res = "FAIL"
            violations.append("Physical tampering detected on instrument.")
        
        if data.get("display_functioning") is False:
            physical_res = "FAIL"
            violations.append("Instrument display is non-functioning.")
            
        seal = str(data.get("seal_condition", "")).strip()
        if seal in self.physical_rules.get("unacceptable_seal_conditions", []):
            physical_res = "FAIL"
            violations.append(f"Unacceptable seal condition: {seal}.")
            
        phys_cond = str(data.get("physical_condition", "")).strip()
        if phys_cond in self.physical_rules.get("unacceptable_physical_conditions", []):
            physical_res = "FAIL"
            violations.append(f"Unacceptable physical structure condition: {phys_cond}.")

        details["physical_inspection"] = {"result": physical_res, "seal": seal, "physical_condition": phys_cond}

        # 2. Accuracy test compliance (3 test loads)
        accuracy_res = "PASS"
        accuracy_details: List[Dict[str, Any]] = []
        for i in [1, 2, 3]:
            ref_load = data.get(f"reference_load_{i}")
            obs_read = data.get(f"observed_reading_{i}")
            err = data.get(f"error_{i}")

            if ref_load is None or (obs_read is None and err is None):
                accuracy_res = "REVIEW_REQUIRED"
                violations.append(f"Accuracy test {i}: Missing reference load or reading.")
                continue

            try:
                ref_load_f = float(ref_load)
                if err is not None:
                    error_f = float(err)
                else:
                    error_f = float(obs_read) - ref_load_f
            except (ValueError, TypeError):
                accuracy_res = "REVIEW_REQUIRED"
                violations.append(f"Accuracy test {i}: Non-numeric measurement value.")
                continue

            mpe = self.calculate_mpe(ref_load_f, scale_interval, acc_class, inst_type)
            is_valid = abs(error_f) <= (mpe * self.tolerances.get("accuracy", {}).get("multiplier_of_mpe", 1.0))
            
            accuracy_details.append({
                "test_index": i,
                "load": ref_load_f,
                "error": error_f,
                "mpe": mpe,
                "compliant": is_valid,
            })
            if not is_valid:
                accuracy_res = "FAIL"
                violations.append(f"Accuracy test {i}: Error ({error_f:.4f}) exceeds permissible MPE ({mpe:.4f}).")

        details["accuracy"] = {"result": accuracy_res, "checks": accuracy_details}

        # 3. Repeatability test compliance
        repeat_res = "PASS"
        rep_readings = []
        for i in range(1, 6):
            val = data.get(f"repeatability_reading_{i}")
            if val is not None:
                try:
                    rep_readings.append(float(val))
                except (ValueError, TypeError):
                    pass
        
        rep_range = data.get("repeatability_range")
        if rep_range is not None:
            try:
                computed_range = float(rep_range)
            except (ValueError, TypeError):
                computed_range = max(rep_readings) - min(rep_readings) if len(rep_readings) >= 2 else None
        elif len(rep_readings) >= 3:
            computed_range = max(rep_readings) - min(rep_readings)
        else:
            computed_range = None

        if computed_range is None:
            repeat_res = "REVIEW_REQUIRED"
            violations.append("Repeatability test: Insufficient readings to compute range.")
        else:
            rep_test_load = capacity * 0.5
            rep_mpe = self.calculate_mpe(rep_test_load, scale_interval, acc_class, inst_type)
            allowed_rep_range = rep_mpe * self.tolerances.get("repeatability", {}).get("multiplier_of_mpe", 1.0)
            if computed_range > allowed_rep_range:
                repeat_res = "FAIL"
                violations.append(
                    f"Repeatability range ({computed_range:.4f}) exceeds tolerance ({allowed_rep_range:.4f})."
                )
            details["repeatability"] = {
                "result": repeat_res,
                "range": computed_range,
                "tolerance": allowed_rep_range,
            }

        # 4. Eccentric loading test compliance
        ecc_res = "PASS"
        ecc_center = data.get("center_reading")
        ecc_points = [
            data.get("front_left_reading"),
            data.get("front_right_reading"),
            data.get("back_left_reading"),
            data.get("back_right_reading"),
        ]
        ecc_max_dev = data.get("eccentric_max_deviation_from_center")
        
        if ecc_max_dev is not None:
            try:
                max_dev = float(ecc_max_dev)
            except (ValueError, TypeError):
                max_dev = None
        elif ecc_center is not None:
            try:
                c_val = float(ecc_center)
                devs = [abs(float(p) - c_val) for p in ecc_points if p is not None]
                max_dev = max(devs) if devs else None
            except (ValueError, TypeError):
                max_dev = None
        else:
            max_dev = None

        if max_dev is None:
            ecc_res = "REVIEW_REQUIRED"
            violations.append("Eccentric loading test: Missing center or quadrant readings.")
        else:
            ecc_test_load = capacity / 3.0
            ecc_mpe = self.calculate_mpe(ecc_test_load, scale_interval, acc_class, inst_type)
            allowed_ecc_dev = ecc_mpe * self.tolerances.get("eccentricity", {}).get("multiplier_of_mpe", 1.0)
            if max_dev > allowed_ecc_dev:
                ecc_res = "FAIL"
                violations.append(
                    f"Eccentric deviation ({max_dev:.4f}) exceeds tolerance ({allowed_ecc_dev:.4f})."
                )
            details["eccentric"] = {
                "result": ecc_res,
                "max_deviation": max_dev,
                "tolerance": allowed_ecc_dev,
            }

        # 5. Zero drift compliance
        zero_res = "PASS"
        init_zero = data.get("initial_zero")
        fin_zero = data.get("final_zero")
        z_drift = data.get("zero_drift")
        
        drift_val = None
        if z_drift is not None:
            try:
                drift_val = abs(float(z_drift))
            except (ValueError, TypeError):
                pass
        elif init_zero is not None and fin_zero is not None:
            try:
                drift_val = abs(float(fin_zero) - float(init_zero))
            except (ValueError, TypeError):
                pass

        if drift_val is None:
            zero_res = "REVIEW_REQUIRED"
            violations.append("Zero test: Missing initial or final zero observation.")
        else:
            zero_tol = scale_interval * self.tolerances.get("zero_drift", {}).get("max_e_multiplier", 0.5)
            if drift_val > zero_tol:
                zero_res = "FAIL"
                violations.append(f"Zero drift ({drift_val:.4f}) exceeds tolerance ({zero_tol:.4f}).")
            details["zero"] = {"result": zero_res, "drift": drift_val, "tolerance": zero_tol}

        # 6. Tare test compliance
        tare_res = "PASS"
        tare_ref = data.get("tare_reference")
        tare_obs = data.get("tare_observed")
        tare_err = data.get("tare_error")
        if tare_err is not None:
            try:
                t_error = abs(float(tare_err))
            except (ValueError, TypeError):
                t_error = None
        elif tare_ref is not None and tare_obs is not None:
            try:
                t_error = abs(float(tare_obs) - float(tare_ref))
            except (ValueError, TypeError):
                t_error = None
        else:
            t_error = None

        if t_error is not None:
            ref_val = float(tare_ref) if tare_ref is not None else capacity * 0.2
            tare_mpe = self.calculate_mpe(ref_val, scale_interval, acc_class, inst_type)
            allowed_tare_err = tare_mpe * self.tolerances.get("tare", {}).get("multiplier_of_mpe", 1.0)
            if t_error > allowed_tare_err:
                tare_res = "FAIL"
                violations.append(f"Tare error ({t_error:.4f}) exceeds tolerance ({allowed_tare_err:.4f}).")
            details["tare"] = {"result": tare_res, "error": t_error, "tolerance": allowed_tare_err}
        else:
            # If tare test was not performed, mark REVIEW_REQUIRED if mandatory or note optional
            tare_res = "PASS"  # Or REVIEW_REQUIRED if configured as mandatory
            details["tare"] = {"result": tare_res, "note": "Tare test optional or not recorded"}

        # 7. Sensitivity test compliance
        sens_res = "PASS"
        sens_load = data.get("sensitivity_test_load")
        sens_change = data.get("sensitivity_indication_change")
        if sens_load is not None and sens_change is not None:
            try:
                s_load = float(sens_load)
                s_change = float(sens_change)
                ratio_req = self.tolerances.get("sensitivity", {}).get("min_indication_ratio", 0.7)
                if s_change < (s_load * ratio_req):
                    sens_res = "FAIL"
                    violations.append(f"Sensitivity change ({s_change}) below threshold ({s_load * ratio_req}).")
                details["sensitivity"] = {"result": sens_res, "ratio": s_change / s_load if s_load > 0 else 0}
            except (ValueError, TypeError):
                sens_res = "REVIEW_REQUIRED"
        else:
            sens_res = "PASS"
            details["sensitivity"] = {"result": sens_res, "note": "Sensitivity test not recorded"}

        # Aggregate overall regulatory rule result
        sub_results = [
            physical_res,
            accuracy_res,
            repeat_res,
            ecc_res,
            zero_res,
            tare_res,
            sens_res,
        ]

        if "FAIL" in sub_results:
            overall = "FAIL"
        elif "REVIEW_REQUIRED" in sub_results:
            overall = "REVIEW_REQUIRED"
        else:
            overall = "PASS"

        return {
            "overall_rule_result": overall,
            "accuracy_result": accuracy_res,
            "repeatability_result": repeat_res,
            "eccentric_result": ecc_res,
            "zero_result": zero_res,
            "tare_result": tare_res,
            "sensitivity_result": sens_res,
            "physical_inspection_result": physical_res,
            "violations": violations,
            "details": details,
        }
