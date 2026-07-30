from __future__ import annotations

import json
import sys
from pathlib import Path

from workbook_pipeline.workbook_schema import validate_workbook


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python tools/verify_kssr_workbook_json.py <workbook.json> [...]")
        return 2

    failed = False
    for raw_path in sys.argv[1:]:
        path = Path(raw_path)
        data = json.loads(path.read_text(encoding="utf-8"))
        errors = validate_workbook(data)
        if errors:
            failed = True
            print(f"FAIL {path}")
            for error in errors:
                print(f"  - {error}")
        else:
            question_count = sum(
                len(section["questions"])
                for unit in data["units"]
                for section in unit["sections"]
            )
            print(f"PASS {path} units={len(data['units'])} questions={question_count}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
