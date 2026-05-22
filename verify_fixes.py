files_to_check = [
    ('content/IGCSE_Syllabus/Year4/Science/Topic2_Living_Things/index.html', 'igcse-y4-sci-topic2'),
    ('content/SPM_Syllabus/Form5/English/Social_Media_Masterclass/index.html', 'spm-en-social-media'),
    ('content/UEC_Syllabus/Senior/English/Teen_CEO_Simulator/index.html', 'uec-en-teen-ceo'),
    ('content/Singapore_Syllabus/Year4/Math/Chapter3_Pokemon_Gym/index.html', 'sg-y4-math-pokemon-gym'),
    ('content/KSSR_Syllabus/Primary3/English/Unit2/index.html', 'kssr-p3-en-unit2'),
]
for fpath, expected_id in files_to_check:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    has_cdn = 'cdn.jsdelivr.net/npm/@supabase/supabase-js@2' in content
    has_auth = 'js/auth-access.js' in content
    has_tracker = 'js/progress-tracker.js' in content
    has_correct_id = f'data-module-id="{expected_id}"' in content
    no_bad_guard = 'ProgressTracker.getActiveStudent()' not in content
    status = 'PASS' if (has_cdn and has_auth and has_tracker and has_correct_id) else 'FAIL'
    print(f'[{status}] {fpath}')
    print(f'       CDN={has_cdn} auth-access={has_auth} tracker={has_tracker} id={has_correct_id} guard-fixed={no_bad_guard}')
