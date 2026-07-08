# Task 2 Report: Workbook Schema And JSON Validation

Status: completed

## Reviewed files

- `tools/workbook_pipeline/__init__.py`
- `tools/workbook_pipeline/workbook_schema.py`
- `tools/verify_kssr_workbook_json.py`
- `package.json`

## Brief check

The current Task 2 implementation matches the brief:

- `tools/workbook_pipeline/__init__.py` is present as the package marker.
- `tools/workbook_pipeline/workbook_schema.py` exports `validate_workbook(data: dict) -> list[str]`.
- `tools/verify_kssr_workbook_json.py` provides the CLI entrypoint for workbook JSON validation.
- `package.json` includes the `verify:kssr-workbooks` script.

## Verification

Ran the required focused check with the bundled Python:

```powershell
& 'C:/Users/hong0/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' 'tools/verify_kssr_workbook_json.py'
```

Observed result:

- printed the usage line
- exited nonzero with exit code `2`

## Notes

- No changes were needed to the Task 2 source files themselves.
- I did not modify Task 1 PDFs/manifests, live `content/`, `index.html`, extraction/render scripts, or unrelated files.

## Fix after review

The reviewer flagged that `validate_workbook()` could raise a `TypeError` for invalid `multiple_choice` questions when `choices` was `null` or not a list. I updated `tools/workbook_pipeline/workbook_schema.py` so the validator now returns a validation error instead of crashing:

- `units[0].sections[0].questions[0].choices must be a list`

I also re-ran the focused checks with the bundled Python runtime, since plain `python` is not on `PATH` in this environment.

Commands and outcomes:

```powershell
& 'C:/Users/hong0/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' 'tools/verify_kssr_workbook_json.py'
```

- printed the usage line
- exited with code `2`

```powershell
$tmp = Join-Path $env:TEMP 'kssr-workbook-invalid-choices-null.json'
$json = @'
{
  "bookId": "B1",
  "level": "Primary 3",
  "subject": "English",
  "sourcePdf": "source.pdf",
  "sourcePageCount": 1,
  "units": [
    {
      "unitId": "U1",
      "unitNumber": 1,
      "title": "Unit 1",
      "theme": "Theme 1",
      "sourcePages": [1],
      "sections": [
        {
          "sectionId": "S1",
          "heading": "Section 1",
          "instructions": "Answer the question.",
          "questions": [
            {
              "itemId": "Q1",
              "sourcePage": 1,
              "questionType": "multiple_choice",
              "prompt": "Pick one.",
              "choices": null,
              "answer": null,
              "acceptedAnswers": [],
              "assets": [],
              "notesForReviewer": ""
            }
          ]
        }
      ]
    }
  ]
}
'@
[System.IO.File]::WriteAllText($tmp, $json, (New-Object System.Text.UTF8Encoding($false)))
& 'C:/Users/hong0/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' 'tools/verify_kssr_workbook_json.py' $tmp
Remove-Item $tmp
```

- printed `FAIL ...choices must be a list`
- exited with code `1`
- did not raise a traceback

The `verify:kssr-workbooks` package script remains wired for the later full pipeline and still references `workbook.json` plus `tools/verify_kssr_workbook_pages.js`; it will not pass until Tasks 4 and 7 create those artifacts.
