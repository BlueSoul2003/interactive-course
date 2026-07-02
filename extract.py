import json
import re

def extract_vocab(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try to find common vocab formats in the file
    matches = re.findall(r'\{[\s\n]*en:\s*["\']([^"\']+)["\'],[\s\n]*zh:\s*["\']([^"\']+)["\'][\s\n]*\}', content)
    return matches

words1 = extract_vocab('content/KSSR_Syllabus/Primary6/English/Unit1/index.html')
words2 = extract_vocab('content/KSSR_Syllabus/Primary6/English/Unit2/index.html')

print("Unit 1 Vocab Count:", len(words1))
for w in words1[:5]: print(w)
print("\nUnit 2 Vocab Count:", len(words2))
for w in words2[:5]: print(w)
