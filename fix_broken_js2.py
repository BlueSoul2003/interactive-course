import os
import re

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use regex to find the bad innerHTML assignment
    # We are looking for something like: feedback.innerHTML = ❌ Wrong! The correct answer is:<br><span class="text-green-700 text-3xl mt-2 block"></span>;
    # It might lack quotes entirely.
    pattern = r'feedback\.innerHTML\s*=\s*.*?Wrong!.*?</span>;'
    good_string = 'feedback.innerHTML = `❌ Wrong! The correct answer is:<br><span class="text-green-700 text-3xl mt-2 block">${targetZh}</span>`;'
    
    if re.search(pattern, content):
        content = re.sub(pattern, good_string, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {path}")
    else:
        print(f"Pattern not found in {path}")

fix_file('content/KSSR_Syllabus/Primary6/English/Revision1/index.html')
fix_file('content/KSSR_Syllabus/Primary6/English/Revision2/index.html')
