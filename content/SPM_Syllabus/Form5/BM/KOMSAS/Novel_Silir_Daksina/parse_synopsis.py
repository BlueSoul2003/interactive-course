import json
import re
import os

input_file = r"C:\Users\hong0\Desktop\interactive-course-main\content\SPM_Syllabus\Form5\BM\KOMSAS\Novel_Silir_Daksina\Sinopsis_ikut_bab.md"
output_file = r"C:\Users\hong0\Desktop\interactive-course-main\content\SPM_Syllabus\Form5\BM\KOMSAS\Novel_Silir_Daksina\chapters.js"

with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

chapters = []
current_chapter_title = "Pengenalan"
current_chapter_sentences = []

def add_sentences(text):
    if not text.strip():
        return
    # Split by '.', '?', '!' followed by space or end of string
    # We want to keep the punctuation.
    parts = re.split(r'(?<=[.?!])\s+', text.strip())
    for part in parts:
        if part.strip():
            current_chapter_sentences.append(part.strip())

current_paragraph = ""

for line in lines:
    line = line.strip()
    if line.startswith('## Bab'):
        # Save previous chapter
        if current_paragraph:
            add_sentences(current_paragraph)
            current_paragraph = ""
            
        chapters.append({
            "title": current_chapter_title,
            "sentences": current_chapter_sentences,
            "image": "silir_intro" if current_chapter_title == "Pengenalan" else f"silir_bab{len(chapters)}"
        })
        current_chapter_title = line.replace('##', '').strip()
        current_chapter_sentences = []
    elif line.startswith('# Sinopsis'):
        continue
    elif line.startswith('###'):
        # It's a sub-heading, treat it as a sentence
        if current_paragraph:
            add_sentences(current_paragraph)
            current_paragraph = ""
        current_chapter_sentences.append(line)
    elif line == "":
        if current_paragraph:
            add_sentences(current_paragraph)
            current_paragraph = ""
    else:
        current_paragraph += " " + line

if current_paragraph:
    add_sentences(current_paragraph)

if current_chapter_sentences:
    chapters.append({
        "title": current_chapter_title,
        "sentences": current_chapter_sentences,
        "image": f"silir_bab{len(chapters)}"
    })

os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("const synopsisData = " + json.dumps(chapters, ensure_ascii=False, indent=2) + ";\n")

print(f"Successfully written {len(chapters)} chapters to {output_file}")
