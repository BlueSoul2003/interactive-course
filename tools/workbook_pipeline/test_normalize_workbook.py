from pathlib import Path
import unittest

from tools.workbook_pipeline.normalize_workbook import normalize


ROOT = Path(__file__).resolve().parents[2]


class NormalizeWorkbookTests(unittest.TestCase):
    def test_normalizer_outputs_theme_objects(self) -> None:
        workbook = normalize(
            ROOT / "_drafts/kssr_english_workbooks/primary3/raw_pages.json",
            ROOT / "_drafts/kssr_english_workbooks/primary3/source_manifest.json",
        )

        self.assertTrue(workbook["units"])
        first_theme = workbook["units"][0]["theme"]
        self.assertEqual(first_theme["name"], "Rainbow Classroom")
        self.assertEqual(first_theme["accent"], "#0f766e")
        self.assertEqual(first_theme["surface"], "#f0fdfa")
        self.assertIn("illustrationPrompt", first_theme)


if __name__ == "__main__":
    unittest.main()
