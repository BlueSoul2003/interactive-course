import os

with open(r'c:\Users\hong0\Desktop\lesson5.html', 'r', encoding='utf-8') as f:
    text = f.read()

tracking_script = """
    <!-- Progress Tracking -->
    <script src="../../../../../js/progress-tracker.js"
            data-module-id="SPM_English_SpeechWriting"
            data-module-name="Speech & Talk Writing (For Form 5)"
            data-module-url="content/SPM_Syllabus/Form5/English/Speech_Writing/index.html">
    </script>
    <script>
        let currentSection = 1;
        window.addEventListener('load', async () => {
            if (typeof ProgressTracker !== 'undefined') {
                const student = ProgressTracker.getActiveStudent();
                if (student) {
                    const b = document.getElementById('activeStudentBadge');
                    if (b) b.style.display = 'block';
                    const n = document.getElementById('activeStudentName');
                    if (n) n.innerText = student;
                }
                const saved = await ProgressTracker.load();
                if (saved && saved.progress_data) {
                    const p = saved.progress_data;
                    if (p.vIndex !== undefined) { vIndex = p.vIndex; renderVocabSet(); }
                    if (p.mIndex !== undefined) { mIndex = p.mIndex; renderMagicQ(); }
                    if (p.section) { currentSection = p.section; showSection(currentSection, false); }
                }
            }
        });
        function saveProgress() {
            if (typeof ProgressTracker !== 'undefined' && ProgressTracker.save) {
                ProgressTracker.save({ section: currentSection, vIndex: vIndex, mIndex: mIndex });
            }
        }
        
        const originalShowSection = showSection;
        showSection = function(num, shouldSave = true) {
            currentSection = num;
            originalShowSection(num);
            if (shouldSave) saveProgress();
        };

        const originalChangeVocabSet = changeVocabSet;
        changeVocabSet = function(dir) {
            originalChangeVocabSet(dir);
            saveProgress();
        };

        const originalChangeMagicQ = changeMagicQ;
        changeMagicQ = function(dir) {
            originalChangeMagicQ(dir);
            saveProgress();
        };
    </script>
"""

text = text.replace('</body>', tracking_script + '\n</body>')

badge_html = """
    <!-- Active Student Badge -->
    <div id="activeStudentBadge" style="display:none; text-align:right; margin-bottom:10px; font-weight:bold; color:var(--primary);">
        👤 <span id="activeStudentName"></span>
    </div>
"""
text = text.replace('<div class="container">', '<div class="container">' + badge_html)

back_link_html = """    <a href="../../../../../index.html" style="display:inline-block; margin-bottom:20px; color:var(--primary); text-decoration:none; font-weight:bold;">&larr; Back to Home</a>"""
text = text.replace('<div class="container">', '<div class="container">\n' + back_link_html)

out_dir = r"c:\Users\hong0\Desktop\interactive-course-main\content\SPM_Syllabus\Form5\English\Speech_Writing"
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'index.html')

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Done writing ' + out_path)
