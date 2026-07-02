with open('db/schema.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert Year 6 Revision 1
new_sql = "    ('kssr-p6-en-revision1', 'Revision 1 (Unit 1 & 2)', 'kssr', 'english', 'kssr_p6_english', 'Primary6'),\n    "
content = content.replace("('kssr-p6-en-unit6', 'Interactive English Adventure', 'kssr', 'english', 'kssr_p6_english', 'Primary6')", "('kssr-p6-en-unit6', 'Interactive English Adventure', 'kssr', 'english', 'kssr_p6_english', 'Primary6'),\n" + new_sql.rstrip(",\n    "))

with open('db/schema.sql', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated db/schema.sql")
