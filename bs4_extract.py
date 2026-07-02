from bs4 import BeautifulSoup
import re

def extract_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    pairs = []
    
    # Common pattern 1: A div/button with English text and a span.zh inside it
    for el in soup.find_all(['div', 'button', 'li', 'span', 'p', 'td']):
        zh_span = el.find('span', class_='zh')
        if zh_span:
            zh_text = zh_span.get_text(strip=True)
            zh_span.extract() # Remove zh span from element
            en_text = el.get_text(strip=True)
            # clean up
            en_text = re.sub(r'[^a-zA-Z0-9\s\'\-\?\!\.\,]', '', en_text).strip()
            if en_text and zh_text and len(en_text) < 50:
                pairs.append({'en': en_text, 'zh': zh_text})

    return pairs

words1 = extract_from_html('content/KSSR_Syllabus/Primary6/English/Unit1/index.html')
words2 = extract_from_html('content/KSSR_Syllabus/Primary6/English/Unit2/index.html')

print("Unit 1 Words:")
for w in words1[:20]: print(f"{w['en']} : {w['zh']}")

print("\nUnit 2 Words:")
for w in words2[:20]: print(f"{w['en']} : {w['zh']}")
