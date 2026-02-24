import json
import os
import time

try:
    from deep_translator import GoogleTranslator
except ImportError:
    print("deep_translator not installed")
    exit(1)

input_file = r"C:\Users\hong0\Desktop\interactive-course-main\content\SPM_Syllabus\Form5\BM\KOMSAS\Novel_Silir_Daksina\chapters.js"

with open(input_file, 'r', encoding='utf-8') as f:
    text = f.read()
    json_str = text.replace('const synopsisData = ', '').strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]

data = json.loads(json_str)

translator_en = GoogleTranslator(source='ms', target='en')
translator_zh = GoogleTranslator(source='ms', target='zh-CN')

def translate_with_retry(translator, text, retries=3):
    for i in range(retries):
        try:
            return translator.translate(text)
        except Exception as e:
            print(f"Error translating text '{text}': {e}. Retrying...")
            time.sleep(2)
    return text

print("Translating started...")
for idx, chap in enumerate(data):
    # Only translate if not already translated
    if 'en_sentences' in chap and 'zh_sentences' in chap and len(chap['en_sentences']) == len(chap['sentences']):
        print(f"Skipping chapter {idx+1}/{len(data)} - already translated")
        continue

    print(f"Translating chapter {idx+1}/{len(data)}: {chap['title']}")
    sentences = chap['sentences']
    
    en_out = []
    zh_out = []
    
    # Process in chunks to avoid any length limits
    try:
        en_out = translator_en.translate_batch(sentences)
        zh_out = translator_zh.translate_batch(sentences)
    except Exception as e:
        print(f"Batch failed ({e}), falling back to sequential for chapter {idx+1}")
        for s in sentences:
            en_out.append(translate_with_retry(translator_en, s))
            zh_out.append(translate_with_retry(translator_zh, s))
            
    chap['en_sentences'] = en_out
    chap['zh_sentences'] = zh_out

with open(input_file, 'w', encoding='utf-8') as f:
    f.write("const synopsisData = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")

print("Translation completed successfully!")
