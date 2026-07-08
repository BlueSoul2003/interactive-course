# Task 4 Report: Normalize OCR/Text Into Structured Workbook JSON

Status: DONE_WITH_CONCERNS

## Files changed

- `tools/workbook_pipeline/normalize_workbook.py`
- `tools/workbook_pipeline/test_normalize_workbook.py`
- `_drafts/kssr_english_workbooks/primary3/workbook.json`
- `_drafts/kssr_english_workbooks/primary6/workbook.json`
- `_drafts/kssr_english_workbooks/_sdd/task-4-report.md`

## Commands run

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m unittest tools.workbook_pipeline.test_normalize_workbook
```

Result: passed, 1 test.

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\workbook_pipeline\normalize_workbook.py --raw _drafts\kssr_english_workbooks\primary3\raw_pages.json --manifest _drafts\kssr_english_workbooks\primary3\source_manifest.json --out _drafts\kssr_english_workbooks\primary3\workbook.json
```

Result: wrote Primary 3 workbook, `units=10`, `questions=80`, `frontMatterExcluded=[1, 2]`, `answerPagesExcluded=[83, 84, 85, 86, 87, 88]`.

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\workbook_pipeline\normalize_workbook.py --raw _drafts\kssr_english_workbooks\primary6\raw_pages.json --manifest _drafts\kssr_english_workbooks\primary6\source_manifest.json --out _drafts\kssr_english_workbooks\primary6\workbook.json
```

Result: wrote Primary 6 workbook, `units=10`, `questions=89`, `frontMatterExcluded=[1]`, `answerPagesExcluded=[91, 92, 93, 94, 95, 96, 97, 98]`.

```powershell
C:\Users\hong0\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\verify_kssr_workbook_json.py _drafts\kssr_english_workbooks\primary3\workbook.json _drafts\kssr_english_workbooks\primary6\workbook.json
```

Result:

- `PASS _drafts\kssr_english_workbooks\primary3\workbook.json units=10 questions=80`
- `PASS _drafts\kssr_english_workbooks\primary6\workbook.json units=10 questions=89`

## Counts

Primary 3:

- Units: 10
- Questions: 80
- Question type counts: `fill_blank=12`, `grammar_transform=5`, `matching=15`, `picture_based=3`, `read_and_answer=6`, `sequencing=5`, `short_answer=23`, `word_bank=5`, `writing_prompt=6`

Primary 6:

- Units: 10
- Questions: 89
- Question type counts: `fill_blank=17`, `grammar_transform=3`, `matching=18`, `multiple_choice=1`, `picture_based=3`, `read_and_answer=10`, `sequencing=2`, `short_answer=13`, `word_bank=8`, `writing_prompt=14`

## Caveats

- This is OCR-derived normalization, not final human-corrected content. Each question carries `notesForReviewer` and must be compared with the source PDF in Task 5 before learner-facing HTML is promoted.
- The normalizer is conservative: it creates page-level review blocks rather than pretending OCR can perfectly split every sub-question. This preserves source order and source pages for manual review.
- No answer keys were promoted. All generated questions use `answer: null` and `acceptedAnswers: []`.

## Commit

- Task 4 content commit hash: `b6d004d`
