import re

with open('university.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change title
html = re.sub(r'<title>.*?</title>', '<title>Mastery Academy | University Portal</title>', html)

# Change header text
html = re.sub(r'<div class="level-badge">Global Syllabus Portal</div>', '<a href="index.html" class="level-badge" style="text-decoration:none;">?? Back to Main Academy</a><br><div class="level-badge" style="margin-top:10px;">University Portal</div>', html)
html = re.sub(r'<h1>Your Path to Academic Excellence</h1>', '<h1>Higher Education & Beyond</h1>', html)
html = re.sub(r'<p>Select your syllabus pathway and master your subjects through First Principles learning.</p>', '<p>Advanced modules, interactive simulators, and deep-dive notes for university students.</p>', html)

# Replace <main>...</main> content
new_main = '''
    <main>
        <!-- Syllabus Selection Tabs - University -->
        <div class="tabs-container" id="uni-tabs" style="margin-bottom: 25px;">
            <button class="tab-btn active">?? Faculty of Science</button>
            <button class="tab-btn" style="opacity: 0.5; cursor: not-allowed;">?? Computer Science (Soon)</button>
            <button class="tab-btn" style="opacity: 0.5; cursor: not-allowed;">?? Business (Soon)</button>
        </div>

        <div class="syllabus-content active">
            <div class="view-layer active">
                <h2 class="section-title">
                    <div class="section-icon">??</div>
                    Department of Physics
                </h2>
                <div class="grid">
                    <!-- Physics Simulator Module -->
                    <div class="card sub-physics" style="cursor: pointer;" onclick="window.location.href='content/University_Syllabus/Physics/Kinematics_Simulator/index.html'">
                        <div class="card-tag">Interactive Lab</div>
                        <h3>Kinematics & Dynamics Simulator</h3>
                        <p>Interactive 2D physics sandbox. Experiment with projectile motion, vectors, forces, and friction in real-time.</p>
                        <div class="card-footer">
                            <div class="start-link">Enter Lab <span>&rarr;</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
'''

# Use regex to replace everything between <main> and </main>
html = re.sub(r'<main>.*?</main>', new_main, html, flags=re.DOTALL)

with open('university.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("university.html successfully updated!")
