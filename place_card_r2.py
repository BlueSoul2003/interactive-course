import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new card
new_card = '''
                    <a href="content/KSSR_Syllabus/Primary6/English/Revision2/index.html" class="card sub-english" data-module-id="kssr-p6-en-revision2" data-bundle="kssr_p6_english">
                        <div class="card-tag">Year 6 (KSSR)</div>
                        <h3>Revision 2 (Unit 1 & 2 Grammar)</h3>
                        <p>Focus strictly on grammar from Units 1 and 2! Practice Past Continuous, "used to", and sentence structuring through fast-paced typing and matching games.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Revision <span>&rarr;</span></div>
                        </div>
                    </a>'''

# Find Revision 1 card block and append the new card
match_str = r'(<a href="content/KSSR_Syllabus/Primary6/English/Revision1/index\.html".*?</a>)'
if re.search(match_str, content, re.DOTALL):
    content = re.sub(match_str, r'\1' + new_card, content, flags=re.DOTALL)
    print("Appended Revision 2 card to index.html")
else:
    print("Could not find Revision 1 card.")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
