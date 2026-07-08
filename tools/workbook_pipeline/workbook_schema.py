from __future__ import annotations

from collections.abc import Mapping

QUESTION_TYPES = {
    "multiple_choice",
    "fill_blank",
    "matching",
    "sequencing",
    "short_answer",
    "writing_prompt",
    "read_and_answer",
    "grammar_transform",
    "word_bank",
    "picture_based",
}

REQUIRED_BOOK_KEYS = {"bookId", "level", "subject", "sourcePdf", "sourcePageCount", "units"}
REQUIRED_UNIT_KEYS = {"unitId", "unitNumber", "title", "theme", "sourcePages", "sections"}
REQUIRED_SECTION_KEYS = {"sectionId", "heading", "instructions", "questions"}
REQUIRED_QUESTION_KEYS = {
    "itemId",
    "sourcePage",
    "questionType",
    "prompt",
    "choices",
    "answer",
    "acceptedAnswers",
    "assets",
    "notesForReviewer",
}


def _missing(prefix: str, obj: Mapping[str, object], keys: set[str]) -> list[str]:
    return [f"{prefix} missing {key}" for key in sorted(keys - set(obj))]


def validate_workbook(data: dict) -> list[str]:
    errors: list[str] = []
    if not isinstance(data, Mapping):
        return ["book must be a mapping"]

    errors.extend(_missing("book", data, REQUIRED_BOOK_KEYS))
    if errors:
        return errors

    units = data["units"]
    if not isinstance(units, list) or not units:
        errors.append("book.units must be a non-empty list")
        return errors

    seen_items: set[str] = set()
    previous_unit_number = 0

    for unit_index, unit in enumerate(units):
        unit_prefix = f"units[{unit_index}]"
        if not isinstance(unit, Mapping):
            errors.append(f"{unit_prefix} must be a mapping")
            continue

        before = len(errors)
        errors.extend(_missing(unit_prefix, unit, REQUIRED_UNIT_KEYS))
        if len(errors) > before:
            continue

        unit_number = unit["unitNumber"]
        if not isinstance(unit_number, int) or unit_number <= previous_unit_number:
            errors.append(f"{unit_prefix}.unitNumber must increase")
        previous_unit_number = unit_number if isinstance(unit_number, int) else previous_unit_number

        source_pages = unit["sourcePages"]
        if not isinstance(source_pages, list) or not source_pages:
            errors.append(f"{unit_prefix}.sourcePages must be a non-empty list")

        sections = unit["sections"]
        if not isinstance(sections, list):
            errors.append(f"{unit_prefix}.sections must be a list")
            continue

        for section_index, section in enumerate(sections):
            section_prefix = f"{unit_prefix}.sections[{section_index}]"
            if not isinstance(section, Mapping):
                errors.append(f"{section_prefix} must be a mapping")
                continue

            before = len(errors)
            errors.extend(_missing(section_prefix, section, REQUIRED_SECTION_KEYS))
            if len(errors) > before:
                continue

            questions = section["questions"]
            if not isinstance(questions, list):
                errors.append(f"{section_prefix}.questions must be a list")
                continue

            for question_index, question in enumerate(questions):
                question_prefix = f"{section_prefix}.questions[{question_index}]"
                if not isinstance(question, Mapping):
                    errors.append(f"{question_prefix} must be a mapping")
                    continue

                before = len(errors)
                errors.extend(_missing(question_prefix, question, REQUIRED_QUESTION_KEYS))
                if len(errors) > before:
                    continue

                item_id = question["itemId"]
                if item_id in seen_items:
                    errors.append(f"{question_prefix}.itemId duplicate: {item_id}")
                else:
                    seen_items.add(item_id)

                question_type = question["questionType"]
                if question_type not in QUESTION_TYPES:
                    errors.append(f"{question_prefix}.questionType unsupported: {question_type}")

                source_page = question["sourcePage"]
                if not isinstance(source_page, int) or source_page < 1:
                    errors.append(f"{question_prefix}.sourcePage must be a positive integer")

                if question["answer"] is not None and not isinstance(question["acceptedAnswers"], list):
                    errors.append(f"{question_prefix}.acceptedAnswers must be a list when answer exists")

                if question_type == "multiple_choice" and len(question["choices"]) < 2:
                    errors.append(f"{question_prefix}.choices must contain at least two options")

    return errors
