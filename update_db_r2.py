with open('db/schema.sql', 'r', encoding='utf-8') as f:
    content = f.read()

new_sql = "    ('kssr-p6-en-revision2', 'Revision 2 (Unit 1 & 2 Grammar)', 'kssr', 'english', 'kssr_p6_english', 'Primary6'),\n    "
content = content.replace("('kssr-p6-en-revision1', 'Revision 1 (Unit 1 & 2)', 'kssr', 'english', 'kssr_p6_english', 'Primary6')", "('kssr-p6-en-revision1', 'Revision 1 (Unit 1 & 2)', 'kssr', 'english', 'kssr_p6_english', 'Primary6'),\n" + new_sql.rstrip(",\n    "))

with open('db/schema.sql', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated db/schema.sql for Revision 2")
