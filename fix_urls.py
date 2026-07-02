import os

def fix_urls(path, p3_path, p6_path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if p3_path in content:
        content = content.replace(p3_path, p6_path)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {path}")

fix_urls('content/KSSR_Syllabus/Primary6/English/Revision1/index.html', 
         'content/KSSR_Syllabus/Primary3/English/Revision1/index.html', 
         'content/KSSR_Syllabus/Primary6/English/Revision1/index.html')

fix_urls('content/KSSR_Syllabus/Primary6/English/Revision2/index.html', 
         'content/KSSR_Syllabus/Primary3/English/Revision2/index.html', 
         'content/KSSR_Syllabus/Primary6/English/Revision2/index.html')
