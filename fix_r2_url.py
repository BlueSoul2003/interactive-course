import os

def fix_url(path, old_str, new_str):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {path}")

fix_url('content/KSSR_Syllabus/Primary6/English/Revision2/index.html',
        'data-module-url="content/KSSR_Syllabus/Primary3/English/Revision1/index.html"',
        'data-module-url="content/KSSR_Syllabus/Primary6/English/Revision2/index.html"')

fix_url('content/KSSR_Syllabus/Primary6/English/Revision1/index.html',
        'data-module-id="kssr-p6-en-revision1"',
        'data-module-id="kssr-p6-en-revision1"') # sanity

