import os
import re

def fix_setinterval(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to keep `}, isCorrect ? 1000 : 3000);` ONLY for setTimeout in selectAnswer.
    # The others are setInterval in endStage and playMG4.
    
    # Let's just find and replace them directly if they are preceded by setInterval stuff.
    # Actually, we can just replace ALL "isCorrect ? 1000 : 3000" back to "1000" EXCEPT the one in selectAnswer.
    # Let's do it carefully using python replace.
    
    # To be safe, I'll use regex to fix the exact lines for penaltyInterval and tInt
    content = re.sub(r'(\}\s*,\s*)isCorrect \? 1000 : 3000\);', r'\1 1000);', content)
    
    # Now we need to put it BACK for selectAnswer:
    # selectAnswer's setTimeout ends exactly before:
    #         function endStage() {
    
    pattern = r'(setTimeout\(\(\) => \{[\s\S]*?endStage\(\);\s*\}\s*\}\s*,\s*)1000\);'
    replacement = r'\1 isCorrect ? 1000 : 3000);'
    content = re.sub(pattern, replacement, content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed setIntervals in {path}")

fix_setinterval('content/KSSR_Syllabus/Primary6/English/Revision1/index.html')
fix_setinterval('content/KSSR_Syllabus/Primary6/English/Revision2/index.html')
