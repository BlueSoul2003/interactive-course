from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any


PRIMARY3_THEMES = [
    ("Rainbow Classroom", "#0f766e", "#f0fdfa"),
    ("Garden Words", "#65a30d", "#f7fee7"),
    ("Space Picnic", "#2563eb", "#eff6ff"),
    ("Animal Parade", "#ea580c", "#fff7ed"),
    ("Toy Town", "#be123c", "#fff1f2"),
    ("Sunny Revision", "#ca8a04", "#fefce8"),
    ("Sticker Review", "#7c3aed", "#f5f3ff"),
]

PRIMARY6_THEMES = [
    ("Explorer Camp", "#047857", "#ecfdf5"),
    ("Future City", "#1d4ed8", "#eff6ff"),
    ("Ocean Lab", "#0284c7", "#f0f9ff"),
    ("Mystery Library", "#7c2d12", "#fff7ed"),
    ("Travel Journal", "#be123c", "#fff1f2"),
    ("Eco Quest", "#4d7c0f", "#f7fee7"),
    ("Exam Launchpad", "#4338ca", "#eef2ff"),
    ("Final Review", "#0f766e", "#f0fdfa"),
]

UNIT_DIRECT_RE = re.compile(
    r"\b(?:W?Uni(?:t|ty|ti|s)|Hint)\b\s*[\)\]:;'\u2019=-]*\s*(10|[1-9])\b",
    re.IGNORECASE,
)
UNIT_WORD_RE = re.compile(r"\bW?Uni(?:t|ty|ti|s)\b", re.IGNORECASE)
STANDALONE_UNIT_NUMBER_RE = re.compile(r"\b(10|[1-9])\b")
ANSWER_RE = re.compile(r"\banswers\b|\bansweys\b|\bnswers\b", re.IGNORECASE)


@dataclass(frozen=True)
class PageText:
    page: int
    text: str


def clean_text(text: str) -> str:
    lines = [" ".join(line.split()) for line in text.replace("\r\n", "\n").split("\n")]
    return "\n".join(line for line in lines if line)


def normalized_inline(text: str, limit: int | None = None) -> str:
    value = " ".join(text.replace("\r\n", "\n").replace("\n", " ").split())
    return value[:limit] if limit is not None else value


def page_text_from(raw_page: dict[str, Any]) -> PageText:
    text = raw_page.get("ocrText") or raw_page.get("embeddedText") or ""
    return PageText(page=int(raw_page["page"]), text=str(text))


def detect_answer_start(pages: list[PageText]) -> int | None:
    earliest_answer_page = max(50, round(len(pages) * 0.8))
    for page in pages:
        if page.page < earliest_answer_page:
            continue
        head = normalized_inline(page.text, 700)
        match = ANSWER_RE.search(head)
        if match and match.start() < 100:
            return page.page
    return None


def detect_unit_number(text: str) -> int | None:
    head = normalized_inline(text, 600)
    for match in UNIT_DIRECT_RE.finditer(head):
        number = int(match.group(1))
        if 1 <= number <= 20:
            return number

    word = UNIT_WORD_RE.search(head)
    if not word:
        return None

    trailing = head[word.end() : word.end() + 120]
    number_match = STANDALONE_UNIT_NUMBER_RE.search(trailing)
    if not number_match:
        return None
    return int(number_match.group(1))


def median_step_from(starts: dict[int, int], answer_start: int | None) -> int:
    adjacent_steps = [
        starts[right] - starts[left]
        for left, right in zip(sorted(starts), sorted(starts)[1:])
        if right - left == 1 and starts[right] > starts[left]
    ]
    if adjacent_steps:
        return sorted(adjacent_steps)[len(adjacent_steps) // 2]

    if starts and answer_start:
        first_unit = min(starts)
        last_unit = max(starts)
        span = max(1, answer_start - starts[first_unit])
        units = max(1, last_unit - first_unit + 1)
        return max(1, round(span / units))

    return 8


def detect_unit_starts(pages: list[PageText], answer_start: int | None) -> tuple[dict[int, int], dict[int, str]]:
    detected: dict[int, int] = {}
    start_notes: dict[int, str] = {}
    for page in pages:
        if answer_start is not None and page.page >= answer_start:
            continue
        number = detect_unit_number(page.text)
        if number is None or number in detected:
            continue
        detected[number] = page.page
        start_notes[number] = "ocr-detected"

    if not detected:
        return {}, {}

    starts = dict(detected)
    notes = dict(start_notes)
    step = median_step_from(starts, answer_start)

    known_numbers = sorted(starts)
    for left, right in zip(known_numbers, known_numbers[1:]):
        missing_count = right - left - 1
        if missing_count <= 0:
            continue
        span = starts[right] - starts[left]
        for offset, unit_number in enumerate(range(left + 1, right), start=1):
            starts[unit_number] = max(1, round(starts[left] + span * offset / (missing_count + 1)))
            notes[unit_number] = "inferred-between-detected-units"

    first_unit = min(starts)
    for unit_number in range(first_unit - 1, 0, -1):
        starts[unit_number] = max(1, starts[unit_number + 1] - step)
        notes[unit_number] = "inferred-before-first-detected-unit"

    return dict(sorted(starts.items())), notes


def classify_question(text: str) -> str:
    compact = normalized_inline(text).lower()

    if re.search(r"\blook at (?:the )?(?:picture|pictures|image|images)\b", compact):
        return "picture_based"
    if re.search(r"\b(?:given|following|shown)\s+(?:picture|pictures|image|images|diagram)\b", compact):
        return "picture_based"
    if re.search(r"\banswer bank\b|\bword bank\b|\bwords? provided\b|\bphrases? from the answer bank\b", compact):
        return "word_bank"
    if re.search(r"\bmatch\b|\bjoin\b|\bpair\b|\bassign each letter\b|\btheir respective\b", compact):
        return "matching"
    if re.search(r"\brearrange\b|\bjumbled\b|\bsequence\b|\border\b|\bascending order\b", compact):
        return "sequencing"
    if re.search(r"\bfill\s*in the blanks?\b|\bblanks? with\b|_{3,}|\bmissing letters?\b", compact):
        return "fill_blank"
    if re.search(
        r"\bwrite (?:an?|the|a short|meaningful|suitable|one|five|about)\b|\bcomposition\b|\bessay\b|\bparagraph\b|\bemail\b|\bdiary entry\b|\bblog entry\b",
        compact,
    ):
        return "writing_prompt"
    if re.search(
        r"\brewrite\b|\btransform\b|\bpassive\b|\breported speech\b|\bquestion tags?\b|\bcorrect form\b|\bcomparative\b|\bsuperlative\b|\bcontractions?\b",
        compact,
    ):
        return "grammar_transform"
    if has_multiple_choice_options(text):
        return "multiple_choice"
    if re.search(r"\bread\b.*\banswer\b|\bpassage\b.*\bquestions?\b|\bdialogue\b.*\bquestions?\b|\binfographic\b.*\bquestions?\b", compact):
        return "read_and_answer"
    return "short_answer"


def has_multiple_choice_options(text: str) -> bool:
    compact = normalized_inline(text)
    return bool(re.search(r"\bA\b.{1,90}\bB\b.{1,90}\bC\b.{1,90}\bD\b", compact))


def extract_choices(text: str) -> list[str]:
    if not has_multiple_choice_options(text):
        return []

    compact = normalized_inline(text)
    choices: list[str] = []
    for label in ("A", "B", "C", "D"):
        pattern = rf"\b{label}\b\s+(.+?)(?=\s+\b[ABCD]\b\s+|$)"
        match = re.search(pattern, compact)
        if match:
            value = match.group(1).strip()
            if value:
                choices.append(f"{label}. {value[:120]}")
    if len(choices) >= 2:
        return choices
    return ["A. OCR option text requires review", "B. OCR option text requires review"]


def is_ocr_noisy(text: str) -> bool:
    compact = normalized_inline(text)
    if not compact:
        return True
    alpha = sum(1 for char in compact if char.isalpha())
    return alpha / max(1, len(compact)) < 0.45


def build_question(unit_id: str, page: PageText, sequence: int) -> dict[str, Any]:
    question_type = classify_question(page.text)
    choices = extract_choices(page.text) if question_type == "multiple_choice" else []
    notes = [
        "Generated from OCR text using deterministic page-level heuristics; verify question boundaries and OCR accuracy.",
        "Answer fields intentionally left blank because normalizer does not promote answer-key content.",
    ]
    if is_ocr_noisy(page.text):
        notes.append("OCR appears noisy on this page; reviewer should compare against the source PDF.")

    return {
        "unitId": unit_id,
        "itemId": f"{unit_id}-p{page.page:03d}-{sequence:02d}",
        "sourcePage": page.page,
        "questionType": question_type,
        "prompt": clean_text(page.text),
        "choices": choices,
        "answer": None,
        "acceptedAnswers": [],
        "assets": [],
        "notesForReviewer": " ".join(notes),
    }


def theme_sequence_for(level: str) -> list[tuple[str, str, str]]:
    return PRIMARY6_THEMES if "6" in level else PRIMARY3_THEMES


def theme_for(level: str, index: int) -> dict[str, str]:
    themes = theme_sequence_for(level)
    name, accent, surface = themes[index % len(themes)]
    return {
        "name": name,
        "accent": accent,
        "surface": surface,
        "illustrationPrompt": f"cute {name.lower()} English workbook theme",
    }


def page_map_for_units(
    pages: list[PageText],
    starts: dict[int, int],
    answer_start: int | None,
) -> dict[int, list[PageText]]:
    unit_numbers = sorted(starts)
    by_page = {page.page: page for page in pages}
    result: dict[int, list[PageText]] = {}
    final_page = (answer_start - 1) if answer_start is not None else max(by_page)

    for index, unit_number in enumerate(unit_numbers):
        start = starts[unit_number]
        next_start = starts[unit_numbers[index + 1]] if index + 1 < len(unit_numbers) else final_page + 1
        end = min(final_page, next_start - 1)
        result[unit_number] = [by_page[number] for number in range(start, end + 1) if number in by_page]
    return result


def normalize(raw_path: Path, manifest_path: Path) -> dict[str, Any]:
    raw = json.loads(raw_path.read_text(encoding="utf-8"))
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    pages = [page_text_from(page) for page in raw["pages"]]
    answer_start = detect_answer_start(pages)
    unit_starts, unit_start_notes = detect_unit_starts(pages, answer_start)
    unit_pages = page_map_for_units(pages, unit_starts, answer_start)
    level = str(manifest["level"])

    units: list[dict[str, Any]] = []
    for unit_index, unit_number in enumerate(sorted(unit_pages)):
        pages_for_unit = unit_pages[unit_number]
        if not pages_for_unit:
            continue

        unit_id = f"unit-{unit_number}"
        sections = []
        for page in pages_for_unit:
            question = build_question(unit_id, page, 1)
            sections.append(
                {
                    "sectionId": f"{unit_id}-page-{page.page:03d}",
                    "heading": f"Source page {page.page}",
                    "instructions": "OCR-derived review block. Confirm boundaries against the source PDF before learner use.",
                    "questions": [question],
                }
            )

        units.append(
            {
                "unitId": unit_id,
                "unitNumber": unit_number,
                "title": f"Unit {unit_number}",
                "theme": theme_for(level, unit_index),
                "sourcePages": [page.page for page in pages_for_unit],
                "sections": sections,
                "normalizationNotes": unit_start_notes.get(unit_number, "ocr-detected"),
            }
        )

    excluded_front_pages: list[int] = []
    if units:
        first_page = min(page for unit in units for page in unit["sourcePages"])
        excluded_front_pages = [page.page for page in pages if page.page < first_page]

    excluded_answer_pages = [
        page.page for page in pages if answer_start is not None and page.page >= answer_start
    ]

    return {
        "bookId": manifest["bookId"],
        "level": manifest["level"],
        "subject": manifest["subject"],
        "sourcePdf": manifest["sourcePdf"],
        "sourcePageCount": len(pages),
        "units": units,
        "normalizationSummary": {
            "rawPath": raw_path.as_posix(),
            "manifestPath": manifest_path.as_posix(),
            "answerStartPage": answer_start,
            "excludedFrontMatterPages": excluded_front_pages,
            "excludedAnswerKeyPages": excluded_answer_pages,
            "unitStartPages": {str(number): page for number, page in unit_starts.items()},
            "unitStartNotes": {str(number): note for number, note in unit_start_notes.items()},
        },
    }


def question_type_counts(workbook: dict[str, Any]) -> Counter[str]:
    counts: Counter[str] = Counter()
    for unit in workbook["units"]:
        for section in unit["sections"]:
            for question in section["questions"]:
                counts[question["questionType"]] += 1
    return counts


def question_count(workbook: dict[str, Any]) -> int:
    return sum(
        len(section["questions"])
        for unit in workbook["units"]
        for section in unit["sections"]
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()

    workbook = normalize(args.raw, args.manifest)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(workbook, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts = question_type_counts(workbook)
    summary = workbook["normalizationSummary"]
    print(
        f"WROTE {args.out} units={len(workbook['units'])} questions={question_count(workbook)} "
        f"frontMatterExcluded={summary['excludedFrontMatterPages']} "
        f"answerPagesExcluded={summary['excludedAnswerKeyPages']} "
        f"typeCounts={dict(sorted(counts.items()))}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
