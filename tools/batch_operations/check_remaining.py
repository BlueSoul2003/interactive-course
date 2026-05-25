"""Quick check and fix for remaining WARN/MISSING modules"""
import re
import os

def check_file(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    has_tracker_script = 'progress-tracker.js' in text
    has_init = 'ProgressTracker.init' in text
    has_autosave = 'autoSave' in text
    has_load = 'ProgressTracker.load()' in text or 'tracker.load()' in text
    
    # Find the init block if any
    m = re.search(r'window\.addEventListener.*?ProgressTracker.*?\}\)', text, re.DOTALL)
    block = m.group(0)[:300] if m else 'NOT FOUND'
    
    return {
        'has_tracker': has_tracker_script,
        'has_init': has_init, 
        'has_autosave': has_autosave,
        'has_load': has_load,
        'block': block
    }

files = [
    ('content/IGCSE_Syllabus/Year8/Science/Chapter1_Respiration/index.html', 'Chapter1'),
    ('content/IGCSE_Syllabus/Year8/Science/Chapter2_Properties_of_Materials/index.html', 'Chapter2'),
    ('content/SPM_Syllabus/Form5/BM/Karangan/index.html', 'Karangan'),
    ('content/KSSR_Syllabus/Primary3/English/Unit4/index.html', 'KSSR_P3_Unit4'),
    ('content/KSSR_Syllabus/Primary6/English/Unit4/index.html', 'KSSR_P6_Unit4'),
    ('content/Singapore_Syllabus/Year4/Math/Chapter3_Pokemon_Gym/index.html', 'Pokemon_Gym'),
]

for path, label in files:
    if not os.path.exists(path):
        print(f'[NOT FOUND] {label}')
        continue
    info = check_file(path)
    print(f'[{label}]')
    print(f'  has_init={info["has_init"]}, has_autosave={info["has_autosave"]}, has_load={info["has_load"]}')
    print(f'  block: {repr(info["block"][:200])}')
    print()
