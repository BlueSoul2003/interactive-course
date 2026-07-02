import os

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    bad_string = "feedback.innerHTML = ? Wrong! The correct answer is:<br><span class=\"text-green-700 text-3xl mt-2 block\"></span>;"
    good_string = "feedback.innerHTML = `❌ Wrong! The correct answer is:<br><span class=\"text-green-700 text-3xl mt-2 block\">${targetZh}</span>`;"
    
    if bad_string in content:
        content = content.replace(bad_string, good_string)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {path}")
    else:
        print(f"Bad string not found in {path}")

fix_file('content/KSSR_Syllabus/Primary6/English/Revision1/index.html')
fix_file('content/KSSR_Syllabus/Primary6/English/Revision2/index.html')
