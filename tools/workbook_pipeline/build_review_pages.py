from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
from typing import Any


def e(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def page_anchor(page_number: int) -> str:
    return f"page-{page_number:03d}"


def answer_status(question: dict[str, Any]) -> str:
    answer = question.get("answer")
    accepted_answers = question.get("acceptedAnswers") or []
    if answer not in (None, ""):
        return f"Answer present: {answer}"
    if accepted_answers:
        return f"Accepted answers present: {len(accepted_answers)}"
    return "No answer supplied"


def render_list(values: list[Any], empty_text: str) -> str:
    if not values:
        return f"<p class=\"muted\">{e(empty_text)}</p>"
    return "<ol>" + "".join(f"<li>{e(value)}</li>" for value in values) + "</ol>"


def collect_questions_by_page(workbook: dict[str, Any]) -> dict[int, list[dict[str, Any]]]:
    questions_by_page: dict[int, list[dict[str, Any]]] = {}
    for unit in workbook.get("units", []):
        unit_title = unit.get("title", "")
        for section in unit.get("sections", []):
            section_heading = section.get("heading", "")
            section_instructions = section.get("instructions", "")
            for question in section.get("questions", []):
                source_page = question.get("sourcePage")
                if not isinstance(source_page, int):
                    continue
                questions_by_page.setdefault(source_page, []).append(
                    {
                        "unitTitle": unit_title,
                        "sectionHeading": section_heading,
                        "sectionInstructions": section_instructions,
                        "itemId": question.get("itemId", ""),
                        "questionType": question.get("questionType", ""),
                        "sourcePage": source_page,
                        "prompt": question.get("prompt", ""),
                        "choices": question.get("choices") or [],
                        "answerStatus": answer_status(question),
                        "notesForReviewer": question.get("notesForReviewer", ""),
                    }
                )
    return questions_by_page


def render_question(question: dict[str, Any]) -> str:
    notes = question.get("notesForReviewer") or "No reviewer notes."
    choices_html = render_list(question.get("choices") or [], "No choices recorded.")
    return f"""
        <article class="question-card">
          <div class="question-meta">
            <span>{e(question["unitTitle"])}</span>
            <span>{e(question["itemId"])}</span>
            <span>{e(question["questionType"])}</span>
            <span>sourcePage {e(question["sourcePage"])}</span>
          </div>
          <div class="field">
            <h4>Instructions</h4>
            <pre>{e(question.get("sectionInstructions"))}</pre>
          </div>
          <div class="field">
            <h4>Prompt</h4>
            <pre>{e(question.get("prompt"))}</pre>
          </div>
          <div class="field">
            <h4>Choices</h4>
            {choices_html}
          </div>
          <div class="field">
            <h4>Answer Status</h4>
            <p>{e(question.get("answerStatus"))}</p>
          </div>
          <div class="field">
            <h4>notesForReviewer</h4>
            <pre>{e(notes)}</pre>
          </div>
        </article>
    """


def render_page(page: dict[str, Any], questions: list[dict[str, Any]]) -> str:
    page_number = int(page["page"])
    raw_text = page.get("ocrText") or page.get("embeddedText") or ""
    question_html = "\n".join(render_question(question) for question in questions)
    if not question_html:
        question_html = (
            "<div class=\"review-note\">No structured questions detected. Review this raw page manually.</div>"
        )
    return f"""
      <section class="page" id="{page_anchor(page_number)}">
        <div class="page-heading">
          <div>
            <h2>Page {page_number}</h2>
            <p class="status">
              embedded chars: {e(page.get("embeddedTextChars", 0))}
              <span>|</span>
              OCR chars: {e(page.get("ocrTextChars", 0))}
              <span>|</span>
              structured questions: {len(questions)}
            </p>
          </div>
          <a href="#top">Back to top</a>
        </div>
        <div class="cols">
          <div class="panel">
            <h3>Raw OCR Text</h3>
            <pre class="raw-text">{e(raw_text)}</pre>
          </div>
          <div class="panel">
            <h3>Structured Questions</h3>
            {question_html}
          </div>
        </div>
      </section>
    """


def render_review(workbook_path: Path, raw_path: Path, out_path: Path) -> None:
    workbook = load_json(workbook_path)
    raw = load_json(raw_path)
    pages = raw.get("pages", [])
    questions_by_page = collect_questions_by_page(workbook)
    question_count = sum(len(questions) for questions in questions_by_page.values())
    pages_with_questions = sum(1 for page in pages if questions_by_page.get(page.get("page")))
    pages_without_questions = len(pages) - pages_with_questions
    nav_links = "\n".join(
        f"<a href=\"#{page_anchor(int(page['page']))}\">Page {e(page['page'])}</a>"
        for page in pages
    )
    page_sections = "\n".join(
        render_page(page, questions_by_page.get(int(page["page"]), [])) for page in pages
    )
    book_id = workbook.get("bookId", raw.get("bookId", "Workbook"))
    level = workbook.get("level", "")
    subject = workbook.get("subject", "")
    unit_summary = ", ".join(unit.get("title", "") for unit in workbook.get("units", []))

    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(book_id)} extraction review</title>
  <style>
    :root {{
      color-scheme: light;
      --bg: #f8fafc;
      --panel: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --line: #cbd5e1;
      --soft: #f1f5f9;
      --accent: #2563eb;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }}
    header {{
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--panel);
      border-bottom: 1px solid var(--line);
      padding: 16px 24px;
    }}
    header h1 {{
      margin: 0 0 4px;
      font-size: 20px;
    }}
    header p {{
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }}
    main {{
      max-width: 1440px;
      margin: 0 auto;
      padding: 20px 24px 48px;
    }}
    .summary {{
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }}
    .summary-card, .nav, .page {{
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }}
    .summary-card {{
      padding: 12px;
    }}
    .summary-card strong {{
      display: block;
      font-size: 22px;
    }}
    .summary-card span, .muted {{
      color: var(--muted);
      font-size: 13px;
    }}
    .units {{
      margin: 0 0 16px;
      color: var(--muted);
      font-size: 14px;
    }}
    .nav {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px;
      margin-bottom: 20px;
    }}
    .nav a, .page-heading a {{
      color: var(--accent);
      text-decoration: none;
      font-size: 13px;
    }}
    .nav a:hover, .page-heading a:hover {{
      text-decoration: underline;
    }}
    .page {{
      margin-bottom: 18px;
      padding: 16px;
    }}
    .page-heading {{
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 10px;
      margin-bottom: 14px;
    }}
    h2, h3, h4 {{
      margin: 0;
    }}
    h2 {{
      font-size: 18px;
    }}
    h3 {{
      font-size: 15px;
      margin-bottom: 10px;
    }}
    h4 {{
      font-size: 12px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: .04em;
      margin-bottom: 4px;
    }}
    .status {{
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 13px;
    }}
    .cols {{
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 16px;
    }}
    .panel {{
      min-width: 0;
    }}
    pre {{
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      margin: 0;
      font: 13px/1.45 Consolas, "Courier New", monospace;
    }}
    .raw-text {{
      background: var(--soft);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      min-height: 180px;
    }}
    .question-card {{
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      background: #ffffff;
    }}
    .question-meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;
    }}
    .question-meta span {{
      background: var(--soft);
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      color: #334155;
      font-size: 12px;
      padding: 2px 8px;
    }}
    .field {{
      margin-top: 10px;
    }}
    ol {{
      margin: 0 0 0 20px;
      padding: 0;
    }}
    .review-note {{
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      color: var(--muted);
      padding: 12px;
      background: #f8fafc;
    }}
    @media (max-width: 900px) {{
      header {{
        position: static;
      }}
      main {{
        padding: 16px;
      }}
      .summary {{
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }}
      .cols {{
        grid-template-columns: 1fr;
      }}
    }}
    @media (max-width: 560px) {{
      .summary {{
        grid-template-columns: 1fr;
      }}
      .page-heading {{
        display: block;
      }}
    }}
  </style>
</head>
<body>
  <header id="top">
    <h1>{e(book_id)} extraction review</h1>
    <p>{e(level)} {e(subject)} | Generated from {e(workbook_path.name)} and {e(raw_path.name)}</p>
  </header>
  <main>
    <section class="summary" aria-label="Book summary">
      <div class="summary-card"><strong>{len(pages)}</strong><span>raw pages</span></div>
      <div class="summary-card"><strong>{question_count}</strong><span>structured questions</span></div>
      <div class="summary-card"><strong>{pages_with_questions}</strong><span>pages with questions</span></div>
      <div class="summary-card"><strong>{pages_without_questions}</strong><span>pages needing review notes</span></div>
    </section>
    <p class="units"><strong>Units:</strong> {e(unit_summary)}</p>
    <nav class="nav" aria-label="Page navigation">
      {nav_links}
    </nav>
    {page_sections}
  </main>
</body>
</html>
"""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(doc, encoding="utf-8")
    print(f"Wrote {out_path}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build a static side-by-side workbook extraction review page."
    )
    parser.add_argument("--workbook", required=True, type=Path)
    parser.add_argument("--raw", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    render_review(args.workbook, args.raw, args.out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
