from pathlib import Path
import unittest

from tools.workbook_pipeline.normalize_workbook import classify_question, normalize


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

    def test_writing_prompt_wins_over_join_as_subject_text(self) -> None:
        text = "Write an email to your friend. Join the school trip next week."

        self.assertEqual(classify_question(text), "writing_prompt")

    def test_rewrite_prompt_wins_over_pair_as_incidental_text(self) -> None:
        text = "Rewrite the sentences with correct punctuation. Use a pair of commas where needed."

        self.assertEqual(classify_question(text), "grammar_transform")


if __name__ == "__main__":
    unittest.main()
