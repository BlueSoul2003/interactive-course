import os
import re

filepath = 'content/University/Japanese/Family/index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Decode GBK mojibake back to UTF-8
fixed = content.encode('gbk', 'ignore').decode('utf-8', 'ignore')

# 2. Fix the syntax error: multiline strings inside en: "..." and zh: "..."
# Replace newlines inside double-quote strings with a space
# We'll run this a few times just in case a string has multiple newlines
for _ in range(3):
    fixed = re.sub(r'(en: "[^"]*)\n([^"]*")', r'\1 \2', fixed)
    fixed = re.sub(r'(zh: "[^"]*)\n([^"]*")', r'\1 \2', fixed)

# 3. Write it back safely
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(fixed)

print("Fixed syntax and encoding successfully!")
