import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# For Year 3
content = content.replace("Year 3 English Modules", "Chapters")
content = content.replace("Year 6 English Modules", "Chapters")
content = content.replace("Revision Mini-Games", "Revision")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated titles")
