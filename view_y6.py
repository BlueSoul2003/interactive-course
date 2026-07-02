import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find Year 6 layer
match = re.search(r'(<!-- LAYER 5: KSSR English Year 6 Modules -->\s*<div id="kssr-english-y6" class="view-layer">.*?</div>\s*</div>)', content, flags=re.DOTALL)
if match:
    print(match.group(1))
else:
    print("Year 6 not found")
