import os
import re
import sys

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
content_dir = os.path.join(ROOT, "content")

results = []
for root, dirs, files in os.walk(content_dir):
    for fn in files:
        if fn != 'index.html' and fn != 'interactive_synopsis.html':
            continue
        path = os.path.join(root, fn)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        links = []
        for i, line in enumerate(lines):
            if 'index.html' in line:
                links.append((i + 1, line.strip()))
                
        if len(links) > 0:
            rel = os.path.relpath(path, ROOT).replace(os.sep, '/')
            results.append((rel, links))

print(f"Found {len(results)} files with links to index.html:")
for rel, links in results:
    print(f"\n[FILE] {rel} (Count: {len(links)})")
    for line_num, text in links:
        print(f"  Line {line_num}: {text[:120]}")
