"""CLI tool for running verification predictions and explanations on sample JSON files."""
import argparse
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.models.predict import VerificationPredictor
from src.utils.logger import get_logger

logger = get_logger("predict_cli")


def run_prediction_on_file(input_file: Path, model_dir: Path) -> None:
    """Reads JSON sample file and prints formatted verification determinations."""
    if not input_file.exists():
        logger.error(f"Input file not found: {input_file}")
        sys.exit(1)

    with open(input_file, "r", encoding="utf-8") as f:
        content = json.load(f)

    # Check whether file contains a list under 'samples' or a single record
    if isinstance(content, dict) and "samples" in content:
        test_cases = content["samples"]
    elif isinstance(content, list):
        test_cases = [{"case_name": f"Case {i+1}", "data": item} for i, item in enumerate(content)]
    else:
        test_cases = [{"case_name": "Single Case", "data": content}]

    predictor = VerificationPredictor(model_dir=model_dir)

    print("\n" + "=" * 80)
    print("        LEGAL METROLOGY VERIFICATION: DECISION SUPPORT INFERENCE")
    print("=" * 80)

    for idx, case in enumerate(test_cases, 1):
        name = case.get("case_name", f"Case #{idx}")
        desc = case.get("description", "")
        data = case.get("data", case)

        result = predictor.predict_verification(data)

        print(f"\n--- [{idx}] {name} ---")
        if desc:
            print(f"Description:        {desc}")
        print(f"Instrument Type:    {data.get('instrument_type')} (Capacity: {data.get('capacity')} kg, e={data.get('scale_interval')})")
        print(f"Regulatory Rules:   {result['rules_engine_result']}")
        print(f"ML Model Result:    {result['prediction']} (Confidence: {result['confidence']:.2f}, Risk Score: {result['risk_score']:.2f})")
        print(f"FINAL DETERMINATION:{result['final_result'].upper()} <---")
        print(f"Decision Rationale: {result.get('decision_note', 'N/A')}")

        if result.get("rule_violations"):
            print("Rule Violations:")
            for v in result["rule_violations"]:
                print(f"  * {v}")

        if result.get("explanation"):
            print("Top Contributing Factors (Model Explainability Only - Non-Statutory):")
            for expl in result["explanation"]:
                feat = expl["feature"]
                impact = expl["impact"].upper()
                direction = expl["direction"].replace("_", " ").upper()
                obs = expl.get("observed_value")
                val_str = f" [value: {obs}]" if obs is not None else ""
                print(f"  * {feat:<32} -> {impact:<6} ({direction}){val_str}")

    print("\n" + "=" * 80 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Run verification determination on a sample JSON file."
    )
    parser.add_argument(
        "--input",
        type=str,
        default="data/synthetic/sample_verification.json",
        help="Path to JSON file containing verification test records",
    )
    parser.add_argument(
        "--model-dir",
        type=str,
        default="models",
        help="Directory containing trained model artifacts",
    )
    args = parser.parse_args()

    run_prediction_on_file(
        input_file=PROJECT_ROOT / args.input,
        model_dir=PROJECT_ROOT / args.model_dir,
    )


if __name__ == "__main__":
    main()
