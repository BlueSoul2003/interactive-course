import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the "Coming Soon" card with the real module card.
placeholder = '''<div class="card" style="opacity: 0.6; cursor: not-allowed;">
                        <div class="card-tag" style="background-color: #f3f4f6; color: #6b7280;">Year 6 (KSSR)</div>
                        <h3 style="color: #6b7280;">Coming Soon</h3>
                        <p>Interactive revision mini-games for Year 6 are currently under development. Stay tuned!</p>
                        <div class="card-footer">
                            <div class="start-link" style="color: #9ca3af;">Coming Soon</div>
                        </div>
                    </div>'''

new_card = '''<a href="content/KSSR_Syllabus/Primary6/English/Revision1/index.html" class="card sub-english" data-module-id="kssr-p6-en-revision1" data-bundle="kssr_p6_english">
                        <div class="card-tag">Year 6 (KSSR)</div>
                        <h3>Revision 1 (Unit 1 & 2)</h3>
                        <p>Interactive vocabulary revision for Units 1 and 2! Test your spelling and memory with 4 levels of fun mini-games like Flash Match and Whack-a-Mole.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Revision <span>&rarr;</span></div>
                        </div>
                    </a>'''

if placeholder in content:
    content = content.replace(placeholder, new_card)
    print("Replaced placeholder successfully!")
else:
    print("Could not find placeholder!")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

