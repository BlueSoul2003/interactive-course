import glob
import re

files = [
    'content/SPM_Syllabus/Form5/English/Advice_Expert/index.html',
    'content/SPM_Syllabus/Form5/English/My_Dream_Holiday/index.html',
    'content/UEC_Syllabus/Senior/English/Grammar/index.html',
    'content/UEC_Syllabus/Senior/English/Reading/index.html',
    'content/UEC_Syllabus/Senior/English/Summary/index.html'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    pattern = r"window\.addEventListener\('load',\s*async \(\) => \{\s*if \(!window\.ProgressTracker\) return;\s*const saved = await tracker\.load\(\);\s*([\s\S]*?)\}\);"
    
    match = re.search(pattern, content)
    if match:
        inner = match.group(1).rstrip()
        
        replacement = """window.addEventListener('load', function() {
            if (!window.ProgressTracker) return;
            ProgressTracker.init(async function(tracker) {
                const saved = await tracker.load();
                """ + inner + """
            });
        });"""
        
        new_content = content[:match.start()] + replacement + content[match.end():]
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
            print(f'Fixed {f}')
    else:
        print(f"Could not match {f}")
