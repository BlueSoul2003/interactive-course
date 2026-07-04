import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

try:
    from pypdf import PdfReader
except Exception:  # pragma: no cover - optional when only filenames are needed
    PdfReader = None


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "resources" / "pdf-catalog.json"
IGNORED_DIRS = {".git", "node_modules", ".agents"}


CURATED = {
    "hardcopy/SPM_Syllabus/Form3/Science/Form3_Science_Bab5_Thermochemistry_Bilingual_Student.pdf": {
        "title": "Form 3 Science Bab 5 Thermochemistry - Bilingual Student Notes",
        "syllabus": "SPM",
        "level": "Form 3",
        "subject": "Science",
        "type": "Student Notes",
        "audience": "Student",
    },
    "hardcopy/SPM_Syllabus/Form4/Sains_Komputer/SPM_Sains_Komputer_Java_Ch1_3_4_to_1_4_3_Student.pdf": {
        "title": "Sains Komputer Java Basics Ch 1.3.4 to 1.4.3 - Student Notes",
        "syllabus": "SPM",
        "level": "Form 4",
        "subject": "Sains Komputer",
        "type": "Student Notes",
        "audience": "Student",
    },
    "hardcopy/SPM_Syllabus/Form4/Sains_Komputer/SPM_Sains_Komputer_Java_Ch1_3_4_to_1_4_3_Teacher_Answers.pdf": {
        "title": "Sains Komputer Java Basics Ch 1.3.4 to 1.4.3 - Teacher Answers",
        "syllabus": "SPM",
        "level": "Form 4",
        "subject": "Sains Komputer",
        "type": "Teacher Answer Key",
        "audience": "Teacher",
    },
    "hardcopy/IGCSE_Syllabus/Year8/Science/IGCSE_Y8_Science_Ch8_Chemical_Reactions_Student.pdf": {
        "title": "IGCSE Year 8 Science Ch 8 Chemical Reactions - Student Fill-In Notes",
        "syllabus": "IGCSE",
        "level": "Year 8",
        "subject": "Science",
        "type": "Student Notes",
        "audience": "Student",
    },
    "hardcopy/IGCSE_Syllabus/Year8/Science/IGCSE_Y8_Science_Ch8_Chemical_Reactions_Tutor_Key.pdf": {
        "title": "IGCSE Year 8 Science Ch 8 Chemical Reactions - Tutor Key",
        "syllabus": "IGCSE",
        "level": "Year 8",
        "subject": "Science",
        "type": "Tutor Key",
        "audience": "Teacher",
    },
}


def repo_path(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def slug(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "pdf"


def readable_title(path: Path) -> str:
    stem = path.stem
    stem = re.sub(r"[_-]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    replacements = {
        "IGCSE": "IGCSE",
        "SPM": "SPM",
        "Y4": "Year 4",
        "Y8": "Year 8",
        "Ch": "Ch",
        "BM": "BM",
        "KSSM": "KSSM",
    }
    words = []
    for word in stem.split(" "):
        upper = word.upper()
        words.append(replacements.get(upper, word if word.isupper() else word.capitalize()))
    return " ".join(words)


def extract_text(path: Path) -> tuple[int | None, str | None, str]:
    if PdfReader is None:
        return None, None, ""

    try:
        reader = PdfReader(str(path))
        snippets = []
        for page in reader.pages[:2]:
            snippets.append(page.extract_text() or "")
        title = None
        if reader.metadata and reader.metadata.title:
            title = str(reader.metadata.title)
        return len(reader.pages), title, "\n".join(snippets)[:2500]
    except Exception:
        return None, None, ""


def infer_syllabus(parts: list[str], haystack: str) -> str:
    if "IGCSE_Syllabus" in parts or "IGCSE" in parts or "igcse" in haystack:
        return "IGCSE"
    if "SPM_Syllabus" in parts or "SPM" in parts or "kssm" in haystack:
        return "SPM"
    if "Singapore_Syllabus" in parts or "Singapore" in parts:
        return "Singapore"
    if "UEC_Syllabus" in parts or "UEC" in parts:
        return "UEC"
    if "University" in parts:
        return "University"
    return "General"


def infer_level(parts: list[str], haystack: str) -> str:
    for part in parts:
        match = re.fullmatch(r"Year(\d+)", part, re.IGNORECASE)
        if match:
            return f"Year {match.group(1)}"
        match = re.fullmatch(r"Form(\d+)", part, re.IGNORECASE)
        if match:
            return f"Form {match.group(1)}"

    stage = re.search(r"stage\s*([0-9]+)", haystack)
    if stage:
        return f"Stage {stage.group(1)}"
    year = re.search(r"\byear\s*([0-9]+)\b", haystack)
    if year:
        return f"Year {year.group(1)}"
    form = re.search(r"\bform\s*([0-9]+)\b", haystack)
    if form:
        return f"Form {form.group(1)}"
    return "General"


def infer_subject(parts: list[str], haystack: str) -> str:
    normalized_parts = {part.lower() for part in parts}

    if "sains_komputer" in normalized_parts or "sains komputer" in haystack or "java" in haystack:
        return "Sains Komputer"
    if "bm" in normalized_parts or "bahasa melayu" in haystack or "komsas" in haystack or "rumusan" in haystack:
        return "Bahasa Melayu"
    if "chemistry" in normalized_parts:
        return "Chemistry"
    if "science" in normalized_parts or "sains" in haystack:
        return "Science"
    if "math" in normalized_parts or "mathematics" in haystack or "math" in haystack:
        return "Mathematics"
    if "english" in normalized_parts:
        return "English"
    if "physics" in normalized_parts:
        return "Physics"
    if "japanese" in normalized_parts:
        return "Japanese"
    return "General"


def infer_audience_type(haystack: str) -> tuple[str, str]:
    if any(token in haystack for token in ["teacher", "tutor", "answers", "answer key", "jawapan", "skema"]):
        audience = "Teacher"
    elif any(token in haystack for token in ["student", "murid"]):
        audience = "Student"
    else:
        audience = "Student"

    if "paper" in haystack and re.search(r"20[0-9]{2}", haystack):
        doc_type = "Past Year Paper"
    elif "slides" in haystack or "presentation" in haystack:
        doc_type = "Slides"
    elif "worksheet" in haystack or "latihan" in haystack:
        doc_type = "Worksheet"
    elif any(token in haystack for token in ["answers", "answer key", "teacher", "tutor", "jawapan", "skema"]):
        doc_type = "Answer Key"
    elif "revision" in haystack or "review" in haystack:
        doc_type = "Revision Notes"
    elif "guide" in haystack or "nota" in haystack or "notes" in haystack or "dossier" in haystack:
        doc_type = "Notes"
    else:
        doc_type = "PDF Notes"

    return audience, doc_type


def collect_pdfs() -> list[Path]:
    pdfs = []
    for path in ROOT.rglob("*.pdf"):
        if any(part in IGNORED_DIRS for part in path.parts):
            continue
        pdfs.append(path)
    return sorted(pdfs, key=lambda item: repo_path(item).lower())


def build_item(path: Path) -> dict:
    relative = repo_path(path)
    pages, metadata_title, text = extract_text(path)
    haystack = f"{relative} {metadata_title or ''} {text}".lower()
    parts = list(path.relative_to(ROOT).parts)

    item = {
        "id": slug(relative),
        "title": metadata_title or readable_title(path),
        "file": relative,
        "syllabus": infer_syllabus(parts, haystack),
        "level": infer_level(parts, haystack),
        "subject": infer_subject(parts, haystack),
        "audience": infer_audience_type(haystack)[0],
        "type": infer_audience_type(haystack)[1],
        "sizeBytes": path.stat().st_size,
        "pages": pages,
    }

    item.update(CURATED.get(relative, {}))
    return item


def fingerprint(resources: list[dict]) -> str:
    digest = hashlib.sha256()
    for item in resources:
        digest.update(item["file"].encode("utf-8"))
        digest.update(str(item["sizeBytes"]).encode("utf-8"))
    return digest.hexdigest()[:16]


def main() -> None:
    resources = [build_item(path) for path in collect_pdfs()]
    catalog = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "fingerprint": fingerprint(resources),
        "total": len(resources),
        "resources": resources,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(resources)} PDFs.")


if __name__ == "__main__":
    main()
