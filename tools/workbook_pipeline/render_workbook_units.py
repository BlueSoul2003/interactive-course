from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path
from typing import Any


QUESTION_TYPE_LABELS = {
    "multiple_choice": "Multiple choice",
    "fill_blank": "Fill in the blank",
    "matching": "Matching",
    "sequencing": "Sequencing",
    "short_answer": "Short answer",
    "writing_prompt": "Writing",
    "read_and_answer": "Read and answer",
    "grammar_transform": "Grammar",
    "word_bank": "Word bank",
    "picture_based": "Picture based",
}

DEFAULT_CHOICES = ["A", "B", "C", "D"]


def e(value: Any) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def safe_script_json(value: Any) -> str:
    return (
        json.dumps(value, ensure_ascii=False)
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
    )


def strip_trailing_whitespace(text: str) -> str:
    return "\n".join(line.rstrip() for line in text.splitlines()) + "\n"


def level_code(level: str) -> str:
    match = re.search(r"(\d+)", level)
    return f"p{match.group(1)}" if match else re.sub(r"[^a-z0-9]+", "", level.lower())


def level_path(level: str) -> str:
    return re.sub(r"\s+", "", level)


def module_id(book: dict[str, Any], unit: dict[str, Any]) -> str:
    return f"kssr-{level_code(str(book['level']))}-en-unit{unit['unitNumber']}"


def module_name(book: dict[str, Any], unit: dict[str, Any]) -> str:
    return f"{book['level']} English {unit['title']}"


def module_url(book: dict[str, Any], unit: dict[str, Any]) -> str:
    return (
        f"content/KSSR_Syllabus/{level_path(str(book['level']))}/English/"
        f"Unit{unit['unitNumber']}/index.html"
    )


def render_meta(book: dict[str, Any], unit: dict[str, Any], question: dict[str, Any]) -> str:
    qtype = str(question["questionType"])
    label = QUESTION_TYPE_LABELS.get(qtype, qtype.replace("_", " ").title())
    return f"""
      <div class="question-meta" aria-label="Question details">
        <span>{e(book["level"])}</span>
        <span>{e(unit["title"])}</span>
        <span>Page {e(question["sourcePage"])}</span>
        <span>{e(label)}</span>
        <span>{e(question["itemId"])}</span>
      </div>
    """


def render_multiple_choice(question: dict[str, Any]) -> str:
    qid = e(question["itemId"])
    choices = question.get("choices") or DEFAULT_CHOICES
    choice_html = []
    for index, choice in enumerate(choices):
        choice_id = f"{qid}-choice-{index + 1}"
        choice_html.append(
            f"""
            <label class="choice" for="{choice_id}">
              <input id="{choice_id}" type="radio" name="{qid}" value="{e(choice)}">
              <span>{e(choice)}</span>
            </label>
            """
        )
    return f"""
      <fieldset class="control-group choices">
        <legend>Choose one answer.</legend>
        {''.join(choice_html)}
      </fieldset>
    """


def render_text_input(question: dict[str, Any]) -> str:
    qid = e(question["itemId"])
    return f"""
      <label class="answer-label" for="{qid}-answer">Your answer</label>
      <input id="{qid}-answer" class="answer-input" data-answer-input="{qid}" aria-describedby="{qid}-hint">
      <p id="{qid}-hint" class="control-hint">Type your answer, then save it.</p>
    """


def render_textarea(question: dict[str, Any], label: str = "Your answer") -> str:
    qid = e(question["itemId"])
    return f"""
      <label class="answer-label" for="{qid}-answer">{e(label)}</label>
      <textarea id="{qid}-answer" class="answer-box" data-answer-input="{qid}" rows="5"></textarea>
    """


def render_matching(question: dict[str, Any]) -> str:
    qid = e(question["itemId"])
    return f"""
      <div class="interactive-grid matching-board" data-matching-board="true">
        <label>
          <span>Left item</span>
          <input class="answer-input" data-answer-input="{qid}-left" aria-label="Matching left item for {qid}">
        </label>
        <label>
          <span>Matches with</span>
          <input class="answer-input" data-answer-input="{qid}-right" aria-label="Matching right item for {qid}">
        </label>
      </div>
      <button type="button" class="mini-btn" data-add-row="matching">Add another match</button>
    """


def render_sequencing(question: dict[str, Any]) -> str:
    qid = e(question["itemId"])
    rows = []
    for index in range(1, 5):
        rows.append(
            f"""
            <label class="sequence-row">
              <span>Step {index}</span>
              <textarea class="answer-box compact" data-answer-input="{qid}-step-{index}" rows="2"></textarea>
            </label>
            """
        )
    return f"""
      <div class="sequence-board" data-sequence-board="true">
        {''.join(rows)}
      </div>
    """


def render_word_bank(question: dict[str, Any]) -> str:
    qid = e(question["itemId"])
    words = question.get("choices") or []
    chips = "".join(
        f"""
        <label class="word-chip">
          <input type="checkbox" data-answer-input="{qid}-word-{index + 1}" value="{e(word)}">
          <span>{e(word)}</span>
        </label>
        """
        for index, word in enumerate(words)
    )
    if not chips:
        chips = f"""
          <label class="answer-label" for="{qid}-words">Words you used</label>
          <input id="{qid}-words" class="answer-input" data-answer-input="{qid}-words">
        """
    return f"""
      <div class="word-bank-board" data-word-bank-board="true">
        {chips}
      </div>
      {render_textarea(question, "Write your completed answer")}
    """


def render_picture_based(question: dict[str, Any]) -> str:
    qid = e(question["itemId"])
    return f"""
      <div class="picture-response" data-picture-response="true">
        <p>Look closely at the source picture in the workbook, then write your answer here.</p>
        {render_textarea(question, "Picture answer")}
        <label class="answer-label" for="{qid}-picture-note">Picture note</label>
        <input id="{qid}-picture-note" class="answer-input" data-answer-input="{qid}-picture-note">
      </div>
    """


def render_read_and_answer(question: dict[str, Any]) -> str:
    qid = e(question["itemId"])
    return f"""
      <div class="read-answer-board" data-read-and-answer-board="true">
        <label class="answer-label" for="{qid}-evidence">Text clue</label>
        <input id="{qid}-evidence" class="answer-input" data-answer-input="{qid}-evidence">
        {render_textarea(question, "Answer after reading")}
      </div>
    """


def render_control(question: dict[str, Any]) -> str:
    qtype = question["questionType"]
    if qtype == "multiple_choice":
        return render_multiple_choice(question)
    if qtype in {"fill_blank", "grammar_transform"}:
        return render_text_input(question)
    if qtype in {"short_answer", "writing_prompt"}:
        return render_textarea(question)
    if qtype == "matching":
        return render_matching(question)
    if qtype == "sequencing":
        return render_sequencing(question)
    if qtype == "word_bank":
        return render_word_bank(question)
    if qtype == "picture_based":
        return render_picture_based(question)
    if qtype == "read_and_answer":
        return render_read_and_answer(question)
    return render_textarea(question)


def render_question(book: dict[str, Any], unit: dict[str, Any], question: dict[str, Any]) -> str:
    qid = e(question["itemId"])
    qtype = e(question["questionType"])
    source_page = e(question["sourcePage"])
    return f"""
      <article class="question-card"
               data-question-id="{qid}"
               data-question-type="{qtype}"
               data-source-page="{source_page}">
        {render_meta(book, unit, question)}
        <h3 id="{qid}-prompt">Try this question</h3>
        <pre class="prompt-text" aria-labelledby="{qid}-prompt">{e(question["prompt"])}</pre>
        <div class="response-area">
          {render_control(question)}
        </div>
        <div class="actions">
          <button type="button" class="check-btn">Check</button>
          <button type="button" class="save-btn">Save</button>
        </div>
        <p class="feedback" role="status" aria-live="polite"></p>
      </article>
    """


def render_section(book: dict[str, Any], unit: dict[str, Any], section: dict[str, Any]) -> str:
    questions = "".join(render_question(book, unit, question) for question in section["questions"])
    return f"""
      <section class="practice-section" aria-labelledby="{e(section["sectionId"])}-heading">
        <div class="section-heading">
          <p>Source page set</p>
          <h2 id="{e(section["sectionId"])}-heading">{e(section["heading"])}</h2>
        </div>
        <p class="section-instructions">{e(section["instructions"])}</p>
        {questions}
      </section>
    """


def render_unit(book: dict[str, Any], unit: dict[str, Any], root_prefix: str) -> str:
    theme = unit["theme"]
    sections = "".join(render_section(book, unit, section) for section in unit["sections"])
    data_json = safe_script_json(
        {
            "bookId": book["bookId"],
            "level": book["level"],
            "unitId": unit["unitId"],
            "unitNumber": unit["unitNumber"],
            "title": unit["title"],
            "questionIds": [
                question["itemId"]
                for section in unit["sections"]
                for question in section["questions"]
            ],
        }
    )
    mod_id = module_id(book, unit)
    mod_name = module_name(book, unit)
    mod_url = module_url(book, unit)
    source_pages = ", ".join(str(page) for page in unit.get("sourcePages", []))
    accent = e(theme["accent"])
    surface = e(theme["surface"])
    theme_name = e(theme["name"])
    illustration_prompt = e(theme.get("illustrationPrompt", "cute English workbook theme"))

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(mod_name)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {{
      color-scheme: light;
      --accent: {accent};
      --surface: {surface};
      --ink: #172033;
      --muted: #526070;
      --paper: #fffdf8;
      --line: color-mix(in srgb, var(--accent), #ffffff 72%);
      --soft-line: #d7dee8;
      --shadow: 0 18px 42px rgb(23 32 51 / .10);
    }}
    * {{ box-sizing: border-box; }}
    html {{ scroll-behavior: smooth; }}
    body {{
      margin: 0;
      background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--accent), transparent 86%), transparent 28rem),
        linear-gradient(180deg, var(--surface), #ffffff 64%);
      color: var(--ink);
      font-family: ui-rounded, "Trebuchet MS", Arial, sans-serif;
      line-height: 1.55;
    }}
    button, input, textarea, select {{ font: inherit; }}
    button:focus-visible, input:focus-visible, textarea:focus-visible, a:focus-visible {{
      outline: 3px solid color-mix(in srgb, var(--accent), white 42%);
      outline-offset: 3px;
    }}
    .shell {{
      width: min(1120px, 100%);
      margin: 0 auto;
      padding: 18px;
    }}
    .topbar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 6px 0 18px;
    }}
    .back-link {{
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      border: 2px solid var(--line);
      border-radius: 999px;
      padding: 8px 14px;
      background: #ffffff;
      color: var(--accent);
      font-weight: 800;
      text-decoration: none;
    }}
    .book-label {{
      color: var(--muted);
      font-size: .95rem;
      font-weight: 800;
    }}
    .hero {{
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(260px, .65fr);
      gap: 20px;
      align-items: stretch;
      background: color-mix(in srgb, var(--paper), var(--surface) 34%);
      border: 2px solid var(--line);
      border-radius: 8px;
      box-shadow: var(--shadow);
      padding: clamp(18px, 4vw, 30px);
    }}
    .theme-pill, .source-pill {{
      display: inline-flex;
      width: fit-content;
      border-radius: 999px;
      border: 2px solid var(--line);
      background: #ffffff;
      color: var(--accent);
      font-size: .82rem;
      font-weight: 900;
      letter-spacing: .02em;
      padding: 6px 10px;
    }}
    .hero h1 {{
      margin: 12px 0 8px;
      color: var(--accent);
      font-size: clamp(2rem, 6vw, 4.35rem);
      line-height: 1;
      letter-spacing: 0;
    }}
    .hero-copy {{
      max-width: 62ch;
      margin: 0;
      color: #334155;
      font-size: 1.04rem;
    }}
    .hero-panel {{
      border: 2px dashed var(--line);
      border-radius: 8px;
      background: #ffffff;
      padding: 16px;
      display: grid;
      align-content: space-between;
      min-height: 210px;
    }}
    .hero-panel strong {{
      color: var(--accent);
      font-size: 1.08rem;
    }}
    .hero-panel p {{ margin: 6px 0 0; color: var(--muted); }}
    .progress-wrap {{
      margin-top: 14px;
      height: 14px;
      overflow: hidden;
      border: 1px solid var(--soft-line);
      border-radius: 999px;
      background: #eef2f7;
    }}
    .progress-bar {{
      width: 0%;
      height: 100%;
      border-radius: inherit;
      background: var(--accent);
      transition: width .25s ease;
    }}
    .progress-status {{
      margin: 8px 0 0;
      color: #334155;
      font-size: .92rem;
      font-weight: 800;
    }}
    .practice-section {{
      margin: 26px 0;
    }}
    .section-heading {{
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 2px solid var(--line);
      padding-bottom: 8px;
    }}
    .section-heading p {{
      order: 2;
      margin: 0;
      color: var(--muted);
      font-size: .86rem;
      font-weight: 800;
    }}
    h2 {{
      margin: 0;
      font-size: clamp(1.35rem, 3vw, 2rem);
      color: #1f2937;
    }}
    .section-instructions {{
      margin: 10px 0 14px;
      color: var(--muted);
    }}
    .question-card {{
      margin: 14px 0;
      border: 2px solid var(--soft-line);
      border-left: 7px solid var(--accent);
      border-radius: 8px;
      background: #ffffff;
      padding: clamp(14px, 3vw, 20px);
    }}
    .question-card[data-saved="true"] {{
      border-color: color-mix(in srgb, var(--accent), #ffffff 55%);
      background: color-mix(in srgb, var(--surface), #ffffff 72%);
    }}
    .question-meta {{
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-bottom: 12px;
    }}
    .question-meta span {{
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #ffffff;
      color: #334155;
      font-size: .78rem;
      font-weight: 800;
      padding: 3px 9px;
    }}
    h3 {{
      margin: 0 0 8px;
      color: var(--accent);
      font-size: 1.18rem;
    }}
    .prompt-text {{
      width: 100%;
      max-height: 24rem;
      overflow: auto;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      margin: 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      padding: 12px;
      color: #263447;
      font: inherit;
    }}
    .response-area {{
      margin-top: 14px;
    }}
    .control-group {{
      margin: 0;
      border: 0;
      padding: 0;
    }}
    legend, .answer-label, .interactive-grid label span, .sequence-row span {{
      display: block;
      margin-bottom: 6px;
      color: #334155;
      font-size: .88rem;
      font-weight: 900;
    }}
    .choices {{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }}
    .choice, .word-chip {{
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      border: 2px solid #d7dee8;
      border-radius: 8px;
      background: #ffffff;
      padding: 10px 12px;
      cursor: pointer;
    }}
    .choice:has(input:checked), .word-chip:has(input:checked) {{
      border-color: var(--accent);
      background: var(--surface);
    }}
    .answer-input, .answer-box {{
      width: 100%;
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      background: #ffffff;
      color: var(--ink);
      padding: 11px 12px;
    }}
    .answer-box {{
      min-height: 116px;
      resize: vertical;
    }}
    .answer-box.compact {{
      min-height: 58px;
    }}
    .control-hint, .picture-response p {{
      margin: 7px 0 0;
      color: var(--muted);
      font-size: .9rem;
    }}
    .interactive-grid {{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 10px;
    }}
    .sequence-board {{
      display: grid;
      gap: 10px;
    }}
    .word-bank-board {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 12px;
    }}
    .actions {{
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 14px;
    }}
    button {{
      min-height: 42px;
      border: 0;
      border-radius: 999px;
      padding: 9px 16px;
      font-weight: 900;
      cursor: pointer;
    }}
    button:active {{
      transform: translateY(1px);
    }}
    .check-btn {{
      background: var(--accent);
      color: #ffffff;
    }}
    .save-btn, .mini-btn {{
      border: 2px solid var(--line);
      background: #ffffff;
      color: var(--accent);
    }}
    .feedback {{
      min-height: 1.5rem;
      margin: 10px 0 0;
      color: #334155;
      font-weight: 900;
    }}
    @media (max-width: 768px) {{
      .shell {{ padding: 12px; }}
      .topbar {{ align-items: flex-start; flex-direction: column; }}
      .hero, .choices, .interactive-grid {{ grid-template-columns: 1fr; }}
      .section-heading {{ display: block; }}
      .hero-panel {{ min-height: 0; }}
      .prompt-text {{ max-height: 18rem; }}
    }}
    @media (prefers-reduced-motion: reduce) {{
      *, *::before, *::after {{
        scroll-behavior: auto !important;
        transition-duration: .01ms !important;
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
      }}
    }}
  </style>
</head>
<body>
  <div class="shell">
    <nav class="topbar" aria-label="Workbook navigation">
      <a class="back-link home-btn-fixed" href="{root_prefix}index.html">Back to dashboard</a>
      <span class="book-label">{e(book["level"])} English workbook draft</span>
    </nav>
    <header class="hero">
      <div>
        <span class="theme-pill">{theme_name}</span>
        <h1>{e(unit["title"])}</h1>
        <p class="hero-copy">Read the source text, try each activity, and save your progress as you go.</p>
      </div>
      <aside class="hero-panel" aria-label="Unit summary">
        <div>
          <strong>Theme note</strong>
          <p>{illustration_prompt}</p>
        </div>
        <div>
          <span class="source-pill">Source pages {e(source_pages)}</span>
          <div class="progress-wrap" aria-label="Progress">
            <div class="progress-bar" id="progressBar"></div>
          </div>
          <p class="progress-status" id="progressStatus">0 saved</p>
        </div>
      </aside>
    </header>
    <main>
      {sections}
    </main>
  </div>
  <script id="unitData" type="application/json">{data_json}</script>
  <script>
    (function () {{
      'use strict';

      var unitData = JSON.parse(document.getElementById('unitData').textContent);
      var storageKey = 'kssr-workbook-draft:' + unitData.level + ':' + unitData.unitId;
      var cards = Array.prototype.slice.call(document.querySelectorAll('.question-card'));
      var progressBar = document.getElementById('progressBar');
      var progressStatus = document.getElementById('progressStatus');
      var state = {{
        completed: {{}},
        answers: {{}}
      }};

      function collectCardAnswer(card) {{
        var values = {{}};
        card.querySelectorAll('input, textarea, select').forEach(function (field) {{
          var key = field.dataset.answerInput || field.name || field.id;
          if (!key) return;
          if (field.type === 'radio') {{
            if (field.checked) values[key] = field.value;
            return;
          }}
          if (field.type === 'checkbox') {{
            values[key] = field.checked;
            return;
          }}
          values[key] = field.value;
        }});
        return values;
      }}

      function paintState() {{
        var done = Object.keys(state.completed).filter(function (key) {{
          return state.completed[key];
        }}).length;
        var percent = cards.length ? Math.round(done / cards.length * 100) : 0;
        progressBar.style.width = percent + '%';
        progressStatus.textContent = done + ' of ' + cards.length + ' saved';
        cards.forEach(function (card) {{
          card.dataset.saved = state.completed[card.dataset.questionId] ? 'true' : 'false';
        }});
      }}

      function persist(debounce) {{
        try {{
          window.localStorage.setItem(storageKey, JSON.stringify(state));
        }} catch (error) {{
          console.warn('Local progress could not be saved.', error);
        }}
        paintState();
        if (window.ProgressTracker) {{
          var payload = {{
            unitId: unitData.unitId,
            unitNumber: unitData.unitNumber,
            completed: state.completed,
            answers: state.answers
          }};
          if (debounce && window.ProgressTracker.autoSave) {{
            window.ProgressTracker.autoSave(payload, 1200);
          }} else if (window.ProgressTracker.save) {{
            window.ProgressTracker.save(payload);
          }}
        }}
      }}

      function restoreLocal() {{
        try {{
          var saved = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
          if (saved && typeof saved === 'object') {{
            state.completed = saved.completed || {{}};
            state.answers = saved.answers || {{}};
          }}
        }} catch (error) {{
          console.warn('Local progress could not be restored.', error);
        }}
      }}

      function restoreFields() {{
        cards.forEach(function (card) {{
          var answers = state.answers[card.dataset.questionId] || {{}};
          card.querySelectorAll('input, textarea, select').forEach(function (field) {{
            var key = field.dataset.answerInput || field.name || field.id;
            if (!(key in answers)) return;
            if (field.type === 'radio') {{
              field.checked = answers[key] === field.value;
            }} else if (field.type === 'checkbox') {{
              field.checked = Boolean(answers[key]);
            }} else {{
              field.value = answers[key];
            }}
          }});
        }});
      }}

      function markCard(card, message, debounce) {{
        var qid = card.dataset.questionId;
        state.answers[qid] = collectCardAnswer(card);
        state.completed[qid] = true;
        card.querySelector('.feedback').textContent = message;
        persist(debounce);
      }}

      document.addEventListener('click', function (event) {{
        var card = event.target.closest('.question-card');
        if (!card) return;
        if (event.target.classList.contains('check-btn')) {{
          markCard(card, 'Nice effort. Your answer is saved for review.', false);
        }}
        if (event.target.classList.contains('save-btn')) {{
          markCard(card, 'Saved. Keep going when you are ready.', false);
        }}
        if (event.target.dataset.addRow === 'matching') {{
          var board = card.querySelector('.matching-board');
          var rowNumber = board.querySelectorAll('label').length / 2 + 1;
          var left = document.createElement('label');
          var right = document.createElement('label');
          left.innerHTML = '<span>Left item ' + rowNumber + '</span><input class="answer-input" data-answer-input="' + card.dataset.questionId + '-left-' + rowNumber + '">';
          right.innerHTML = '<span>Matches with ' + rowNumber + '</span><input class="answer-input" data-answer-input="' + card.dataset.questionId + '-right-' + rowNumber + '">';
          board.appendChild(left);
          board.appendChild(right);
        }}
      }});

      document.addEventListener('input', function (event) {{
        var card = event.target.closest('.question-card');
        if (!card) return;
        state.answers[card.dataset.questionId] = collectCardAnswer(card);
        persist(true);
      }});

      restoreLocal();
      restoreFields();
      paintState();

      window.addEventListener('load', function () {{
        if (!window.ProgressTracker) return;
        window.ProgressTracker.init(async function (tracker) {{
          var saved = await tracker.load();
          if (saved && saved.answers) {{
            state.completed = saved.completed || state.completed;
            state.answers = saved.answers || state.answers;
            restoreFields();
            persist(false);
          }}
        }});
      }});
    }})();
  </script>
  <script src="{root_prefix}js/navigation.js?v=1.0.0"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="{root_prefix}js/auth-access.js"></script>
  <script src="{root_prefix}js/progress-tracker.js"
          data-module-id="{e(mod_id)}"
          data-module-name="{e(mod_name)}"
          data-module-url="{e(mod_url)}"></script>
</body>
</html>
"""


def render_book(workbook_path: Path, out_dir: Path, root_prefix: str) -> list[Path]:
    book = json.loads(workbook_path.read_text(encoding="utf-8"))
    written: list[Path] = []
    for unit in book["units"]:
        unit_dir = out_dir / f"Unit{unit['unitNumber']}"
        unit_dir.mkdir(parents=True, exist_ok=True)
        out_path = unit_dir / "index.html"
        out_path.write_text(strip_trailing_whitespace(render_unit(book, unit, root_prefix)), encoding="utf-8")
        written.append(out_path)
        print(f"Wrote {out_path}")
    return written


def main() -> int:
    parser = argparse.ArgumentParser(description="Render draft interactive KSSR English workbook units.")
    parser.add_argument("--workbook", required=True, type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    parser.add_argument("--root-prefix", default="../../../../../")
    args = parser.parse_args()
    render_book(args.workbook, args.out_dir, args.root_prefix)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
