import glob
import re

files = [
    "content/IGCSE_Syllabus/Year4/Science/Topic2_Living_Things/index.html",
    "content/SPM_Syllabus/Form5/English/Advice_Expert/index.html",
    "content/SPM_Syllabus/Form5/English/My_Dream_Holiday/index.html",
    "content/UEC_Syllabus/Senior/English/Grammar/index.html",
    "content/UEC_Syllabus/Senior/English/Reading/index.html",
    "content/UEC_Syllabus/Senior/English/Summary/index.html"
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    start_str = "async function _loadProgress() {\n            if (!window.ProgressTracker) return;"
    if start_str not in content:
        start_str = "async function _loadProgress() {\n            if (!window.ProgressTracker) return;"
        
    # We will match the entire _loadProgress function.
    match = re.search(r"async function _loadProgress\(\) \{([\s\S]*?)        \}", content)
    if match:
        body = match.group(1)
        
        # We replace the starting async with sync, and wrap the body inside ProgressTracker.init
        # We need to strip out the early return from the body and put it outside
        
        # Original body starts with `\n            if (!window.ProgressTracker) return;`
        new_body = body.replace("if (!window.ProgressTracker) return;", "").strip()
        
        replacement = """function _loadProgress() {
            if (!window.ProgressTracker) return;
            ProgressTracker.init(async function(tracker) {
                """ + new_body.replace("\n", "\n    ") + """
            });
        }"""
        
        new_content = content[:match.start()] + replacement + content[match.end():]
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
            print(f"Fixed {f}")
