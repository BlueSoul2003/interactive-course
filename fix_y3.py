import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the correct Year 3 block
correct_y3 = '''            <!-- LAYER 4: KSSR English Year 3 Modules -->
            <div id="kssr-english-y3" class="view-layer">
                <button class="back-btn" onclick="showLessons('kssr', 'kssr-english')">&larr; Back to English Years</button>
                
                <h2 class="section-title" style="margin-top: 10px;">
                    <div class="section-icon" style="color: var(--sub-english); border-color: var(--sub-english);">📚</div>
                    Year 3 English Modules
                </h2>
                <div class="grid">
                    <a href="content/KSSR_Syllabus/Primary3/English/Unit1/index.html" class="card sub-english" data-module-id="kssr-p3-en-unit1" data-bundle="kssr_p3_english">
                        <div class="card-tag">Year 3 (KSSR)</div>
                        <h3>Unit 1: Getting Smart</h3>
                        <p>Master appearance, nouns, and common verbs with 3 interactive pre-reading games and reading exercises.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Lesson <span>&rarr;</span></div>
                        </div>
                    </a>
                    <a href="content/KSSR_Syllabus/Primary3/English/Unit2/index.html" class="card sub-english" data-module-id="kssr-p3-en-unit2" data-bundle="kssr_p3_english">
                        <div class="card-tag">Year 3 (KSSR)</div>
                        <h3>Unit 2: City Heroes</h3>
                        <p>Explore occupations &amp; daily routines. Master frequency adverbs and Present Simple through 7 interactive stages: Match, Spell, Train, Read, Quiz, Essay &amp; Copy.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Lesson <span>&rarr;</span></div>
                        </div>
                    </a>
                    <a href="content/KSSR_Syllabus/Primary3/English/Unit3/index.html" class="card sub-english" data-module-id="kssr-p3-en-unit3" data-bundle="kssr_p3_english">
                        <div class="card-tag">Year 3 (KSSR)</div>
                        <h3>Unit 3: Housework</h3>
                        <p>Master contractions (She's, They're, Isn't), classify housework by room, jumble sentences, match sports vocabulary, and complete an email through 10 interactive tabs.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Lesson <span>&rarr;</span></div>
                        </div>
                    </a>
                    <a href="content/KSSR_Syllabus/Primary3/English/Unit4/index.html" class="card sub-english" data-module-id="kssr-p3-en-unit4" data-bundle="kssr_p3_english">
                        <div class="card-tag">Year 3 (KSSR)</div>
                        <h3>Unit 4: The Four Seasons</h3>
                        <p>Master seasons, months, weather vocabulary, and sentence construction through reading and interactive matching games.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Lesson <span>&rarr;</span></div>
                        </div>
                    </a>
                    <a href="content/KSSR_Syllabus/Primary3/English/Unit5/index.html" class="card sub-english" data-module-id="kssr-p3-en-unit5" data-bundle="kssr_p3_english">
                        <div class="card-tag">Year 3 (KSSR)</div>
                        <h3>Unit 5: My House Adventure</h3>
                        <p>Master rooms of a house, furniture vocabulary, possessive forms, and descriptive adjectives.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Lesson <span>&rarr;</span></div>
                        </div>
                    </a>
                </div>

                <h2 class="section-title" style="margin-top: 40px;">
                    <div class="section-icon" style="color: #f59e0b; border-color: #f59e0b;">🎮</div>
                    Revision Mini-Games
                </h2>
                <div class="grid">
                    <a href="content/KSSR_Syllabus/Primary3/English/Revision1/index.html" class="card sub-english" data-module-id="kssr-p3-en-revision1" data-bundle="kssr_p3_english">
                        <div class="card-tag">Year 3 (KSSR)</div>
                        <h3>Revision 1 (Unit 1 & 2)</h3>
                        <p>Interactive vocabulary revision for Units 1 and 2! Test your spelling and memory with 4 levels of fun mini-games like Whack-a-Mole and Bubble Pop.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Revision <span>&rarr;</span></div>
                        </div>
                    </a>
                    <a href="content/KSSR_Syllabus/Primary3/English/Revision2/index.html" class="card sub-english" data-module-id="kssr-p3-en-revision2" data-bundle="kssr_p3_english">
                        <div class="card-tag">Year 3 (KSSR)</div>
                        <h3>Revision 2 (Unit 3 & 4)</h3>
                        <p>Interactive vocabulary revision for Units 3 and 4! Test your spelling and memory with 4 levels of fun mini-games like Whack-a-Mole and Bubble Pop.</p>
                        <div class="card-footer">
                            <div class="start-link">Start Revision <span>&rarr;</span></div>
                        </div>
                    </a>
                </div>
            </div>'''

# Replace the broken block
# The broken block starts at '<!-- LAYER 4: KSSR English Year 3 Modules -->' 
# and goes all the way up to just before '<!-- LAYER 4: KSSR English Year 6 Modules -->'

new_content = re.sub(
    r'<!-- LAYER 4: KSSR English Year 3 Modules -->.*?<!-- LAYER 4: KSSR English Year 6 Modules -->', 
    correct_y3 + '\n\n            <!-- LAYER 4: KSSR English Year 6 Modules -->', 
    content, 
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Updated index.html correctly.")
