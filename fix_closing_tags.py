import os
import re

content_dir = 'content'
fixed = []
for root, dirs, files in os.walk(content_dir):
    for fn in files:
        if fn != 'index.html':
            continue
        path = os.path.join(root, fn)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        if 'progress-tracker.js' not in text:
            continue
        # Fix doubled/triple closing </script> tags created by batch replacer
        # Pattern: data-module-url="..."></script></script> (extra closing tags)
        pattern = r'(data-module-url="[^"]*"></script>)(?:</script>)+'
        fixed_text = re.sub(pattern, r'\1', text)
        if fixed_text != text:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(fixed_text)
            rel = path.replace('content' + os.sep, '').replace(os.sep, '/')
            fixed.append(rel)
            print('[FIXED]', rel)

print('Fixed ' + str(len(fixed)) + ' files with malformed closing tags')
