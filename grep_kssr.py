import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Print lines containing KSSR
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'kssr' in line.lower():
        print(f"{i}: {line.strip()}")
