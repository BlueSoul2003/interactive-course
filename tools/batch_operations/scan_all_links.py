import os
import sys
import re

# Force UTF-8 stdout
sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
content_dir = os.path.join(ROOT, "content")

with open("index_links_report.txt", "w", encoding="utf-8") as out:
    for root, dirs, files in sorted(os.walk(content_dir)):
        for fn in sorted(files):
            if fn != 'index.html' and fn != 'interactive_synopsis.html':
                continue
            path = os.path.join(root, fn)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Find all matches of index.html links
            # We want to check how many <a> tags contain index.html
            matches = re.findall(r'<a\s+[^>]*href="[^"]*index\.html"[^>]*>.*?</a>', content, re.IGNORECASE | re.DOTALL)
            
            if len(matches) > 0:
                rel = os.path.relpath(path, ROOT).replace(os.sep, '/')
                out.write(f"\n[FILE] {rel}\n")
                for m in matches:
                    # Clean up whitespace
                    clean_m = " ".join(m.split())
                    out.write(f"  Link: {clean_m}\n")
