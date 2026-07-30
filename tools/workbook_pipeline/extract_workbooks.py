from __future__ import annotations

import argparse
import json
import shutil
from dataclasses import dataclass
from pathlib import Path

import pdfplumber


@dataclass
class ExtractionConfig:
    source_pdf: Path
    out_dir: Path
    expected_pages: int
    book_id: str


def detect_ocr_command() -> list[str] | None:
    for name in ("tesseract", "ocrmypdf"):
        path = shutil.which(name)
        if path:
            return [path]
    return None


def extract_embedded_text(pdf_path: Path) -> list[dict]:
    pages: list[dict] = []
    with pdfplumber.open(str(pdf_path)) as pdf:
        for index, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            pages.append(
                {
                    "page": index,
                    "embeddedText": text,
                    "embeddedTextChars": len(text),
                    "width": page.width,
                    "height": page.height,
                    "mode": "embedded_text" if text.strip() else "image_only_or_empty",
                    "ocrText": "",
                    "ocrTextChars": 0,
                }
            )
    return pages


def write_audit(config: ExtractionConfig, pages: list[dict], ocr_available: bool) -> None:
    total_embedded = sum(page["embeddedTextChars"] for page in pages)
    image_only_pages = [page["page"] for page in pages if page["embeddedTextChars"] == 0]
    audit = [
        f"# {config.book_id} Extraction Audit",
        "",
        f"- Source PDF: `{config.source_pdf.as_posix()}`",
        f"- Expected pages: {config.expected_pages}",
        f"- Detected pages: {len(pages)}",
        f"- Embedded text characters: {total_embedded}",
        f"- Image-only or empty pages: {len(image_only_pages)}",
        f"- OCR command available: {'yes' if ocr_available else 'no'}",
        "",
        "## Page Status",
        "",
        "| Page | Mode | Embedded chars | OCR chars |",
        "|---:|---|---:|---:|",
    ]
    for page in pages:
        audit.append(
            f"| {page['page']} | {page['mode']} | {page['embeddedTextChars']} | {page['ocrTextChars']} |"
        )
    config.out_dir.joinpath("extraction_audit.md").write_text("\n".join(audit), encoding="utf-8")


def run(config: ExtractionConfig) -> int:
    config.out_dir.mkdir(parents=True, exist_ok=True)
    pages = extract_embedded_text(config.source_pdf)
    ocr_cmd = detect_ocr_command()
    ocr_available = ocr_cmd is not None

    if len(pages) != config.expected_pages:
        raise SystemExit(
            f"{config.book_id}: expected {config.expected_pages} pages, detected {len(pages)}"
        )

    config.out_dir.joinpath("raw_pages.json").write_text(
        json.dumps({"bookId": config.book_id, "pages": pages}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_audit(config, pages, ocr_available)

    if sum(page["embeddedTextChars"] for page in pages[:5]) == 0 and not ocr_available:
        print(
            f"{config.book_id}: image-only PDF detected. Install or expose an OCR command before normalization."
        )
        return 3

    print(f"{config.book_id}: extracted page metadata for {len(pages)} pages")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-pdf", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--expected-pages", required=True, type=int)
    parser.add_argument("--book-id", required=True)
    args = parser.parse_args()
    return run(
        ExtractionConfig(
            source_pdf=Path(args.source_pdf),
            out_dir=Path(args.out_dir),
            expected_pages=args.expected_pages,
            book_id=args.book_id,
        )
    )


if __name__ == "__main__":
    raise SystemExit(main())
