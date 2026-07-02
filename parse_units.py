import re
import json

def extract_meaningful_content(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern for <div ...>Text<span class="zh">Chinese</span></div>
    matches1 = re.finditer(r'<([^>]+)>([^<]+)<span[^>]*class="[^"]*\bzh\b[^"]*"[^>]*>([^<]+)</span>', content)
    
    # Also find standalone vocab from arrays if any
    
    results = []
    for m in matches1:
        en_text = m.group(2).strip()
        zh_text = m.group(3).strip()
        
        en_text = ' '.join(en_text.split())
        zh_text = ' '.join(zh_text.split())
        
        # Remove emojis for printing
        en_text = en_text.encode('ascii', 'ignore').decode('ascii').strip()
        
        if en_text and zh_text and len(en_text) < 100:
            results.append({"en": en_text, "zh": zh_text})
            
    return results

r1 = extract_meaningful_content('content/KSSR_Syllabus/Primary6/English/Unit1/index.html')
r2 = extract_meaningful_content('content/KSSR_Syllabus/Primary6/English/Unit2/index.html')

with open('unit_extract.json', 'w', encoding='utf-8') as f:
    json.dump({'unit1': r1, 'unit2': r2}, f, ensure_ascii=False, indent=2)

print("Extraction saved to unit_extract.json")
