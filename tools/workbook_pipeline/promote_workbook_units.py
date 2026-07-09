from __future__ import annotations

import argparse
import shutil
from pathlib import Path


def unit_sort_key(path: Path) -> tuple[int, str]:
    suffix = path.name.removeprefix("Unit")
    return (int(suffix), path.name) if suffix.isdigit() else (10_000, path.name)


def promote(source: Path, target: Path) -> list[tuple[Path, Path]]:
    if not source.exists():
        raise SystemExit(f"Source does not exist: {source}")

    promoted: list[tuple[Path, Path]] = []
    for unit_dir in sorted(source.glob("Unit*"), key=unit_sort_key):
        if not unit_dir.is_dir():
            continue
        source_html = unit_dir / "index.html"
        if not source_html.exists():
            continue

        target_dir = target / unit_dir.name
        target_dir.mkdir(parents=True, exist_ok=True)
        target_html = target_dir / "index.html"
        shutil.copy2(source_html, target_html)
        promoted.append((source_html, target_html))
        print(f"Promoted {source_html} -> {target_html}")

    if not promoted:
        raise SystemExit(f"No Unit*/index.html files found under {source}")
    return promoted


def main() -> int:
    parser = argparse.ArgumentParser(description="Promote reviewed workbook draft unit pages to live content.")
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--target", required=True, type=Path)
    args = parser.parse_args()
    promote(args.source, args.target)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
