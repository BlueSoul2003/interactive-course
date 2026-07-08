from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from workbook_pipeline.extract_workbooks import ExtractionConfig, run


class ExtractWorkbooksTests(unittest.TestCase):
    def test_run_writes_outputs_and_returns_3_when_image_only_without_ocr(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            out_dir = Path(tmp_dir)
            config = ExtractionConfig(
                source_pdf=Path("source.pdf"),
                out_dir=out_dir,
                expected_pages=2,
                book_id="book-1",
            )
            pages = [
                {
                    "page": 1,
                    "embeddedText": "",
                    "embeddedTextChars": 0,
                    "width": 100,
                    "height": 200,
                    "mode": "image_only_or_empty",
                    "ocrText": "",
                    "ocrTextChars": 0,
                },
                {
                    "page": 2,
                    "embeddedText": "",
                    "embeddedTextChars": 0,
                    "width": 100,
                    "height": 200,
                    "mode": "image_only_or_empty",
                    "ocrText": "",
                    "ocrTextChars": 0,
                },
            ]

            with (
                patch("workbook_pipeline.extract_workbooks.extract_embedded_text", return_value=pages),
                patch("workbook_pipeline.extract_workbooks.detect_ocr_command", return_value=None),
            ):
                exit_code = run(config)

            self.assertEqual(exit_code, 3)
            raw_pages = json.loads(out_dir.joinpath("raw_pages.json").read_text(encoding="utf-8"))
            self.assertEqual(raw_pages["bookId"], "book-1")
            self.assertEqual(len(raw_pages["pages"]), 2)

            audit_text = out_dir.joinpath("extraction_audit.md").read_text(encoding="utf-8")
            self.assertIn("- OCR command available: no", audit_text)
            self.assertIn("| 1 | image_only_or_empty | 0 | 0 |", audit_text)

    def test_run_raises_when_detected_page_count_mismatches_expectation(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            config = ExtractionConfig(
                source_pdf=Path("source.pdf"),
                out_dir=Path(tmp_dir),
                expected_pages=3,
                book_id="book-2",
            )
            pages = [
                {
                    "page": 1,
                    "embeddedText": "hello",
                    "embeddedTextChars": 5,
                    "width": 100,
                    "height": 200,
                    "mode": "embedded_text",
                    "ocrText": "",
                    "ocrTextChars": 0,
                }
            ]

            with (
                patch("workbook_pipeline.extract_workbooks.extract_embedded_text", return_value=pages),
                patch("workbook_pipeline.extract_workbooks.detect_ocr_command", return_value=None),
            ):
                with self.assertRaises(SystemExit) as exc:
                    run(config)

            self.assertIn("expected 3 pages, detected 1", str(exc.exception))


if __name__ == "__main__":
    unittest.main()
