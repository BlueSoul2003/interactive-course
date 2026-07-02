import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# find all view-layer divs and their IDs to understand the structure
matches = re.findall(r'<div\s+id="([^"]+)"\s+class="view-layer(?:[^"]*)">', content)
for m in matches:
    print(f"Layer ID: {m}")
