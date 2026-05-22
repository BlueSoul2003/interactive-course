import re
import sys

files_modules = [
    ('content/KSSR_Syllabus/Primary3/English/Unit2/index.html',
     'kssr-p3-en-unit2', 'Unit 2: City Heroes',
     'content/KSSR_Syllabus/Primary3/English/Unit2/index.html'),
    ('content/KSSR_Syllabus/Primary6/English/Unit1/index.html',
     'kssr-p6-en-unit1', 'Unit 1: Scenario Practice',
     'content/KSSR_Syllabus/Primary6/English/Unit1/index.html'),
    ('content/KSSR_Syllabus/Primary6/English/Unit3/index.html',
     'kssr-p6-en-unit3', 'Unit 3: Outdoor Activities',
     'content/KSSR_Syllabus/Primary6/English/Unit3/index.html'),
]

prefix = '../../../../../'
cdn_tag   = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
auth_tag  = f'<script src="{prefix}js/auth-access.js"></script>'

for fpath, mid, mname, murl in files_modules:
    tracker_tag = (
        f'<script src="{prefix}js/progress-tracker.js"\n'
        f'        data-module-id="{mid}"\n'
        f'        data-module-name="{mname}"\n'
        f'        data-module-url="{murl}"></script>'
    )

    with open(fpath, 'r', encoding='utf-8') as fh:
        content = fh.read()

    if 'progress-tracker.js' in content:
        print(f'[SKIP] Already has tracker: {fpath}')
        continue

    insert_block = f'\n    {cdn_tag}\n    {auth_tag}\n    {tracker_tag}\n'

    # Try to inject before </body>
    new_content, n = re.subn(
        r'(</body>)', insert_block + r'\1', content, count=1, flags=re.IGNORECASE
    )
    if n == 0:
        # Fallback: append at end
        new_content = content.rstrip() + insert_block

    with open(fpath, 'w', encoding='utf-8') as fh:
        fh.write(new_content)
    print(f'[OK] Injected tracker: {fpath}')

print('Done.')
