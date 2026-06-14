import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the hero blobs from the header
html = re.sub(r'<div class="hero-blob hero-blob-\d+"></div>', '', html)

# Change the title and description in the header
html = re.sub(r'<h1>.*?</h1>', '<h1>Department of Physics</h1>', html, count=1, flags=re.DOTALL)
html = re.sub(r'<p>Interactive learning modules for.*?</p>', '<p>University-level Physics Modules and Simulators.</p>', html, count=1, flags=re.DOTALL)

# Add back button to University portal at the top of the header
header_btn_old = '<div class="role-badge">K-12 Syllabus</div>'
header_btn_new = '<a href="university.html" class="level-badge" style="text-decoration:none;">⬅️ Back to Faculties</a><br><div class="role-badge" style="margin-top:10px;">Physics Department</div>'
html = html.replace(header_btn_old, header_btn_new)

# Replace the entire <main> block
main_block_new = '''<main>
    <div class="syllabus-content active">
        <h2 class="section-title">
            <div class="section-icon" style="border-color: var(--border-physics); color: var(--border-physics);">⚛️</div>
            Core Physics Modules
        </h2>
        <div class="grid">
            <a href="content/University_Syllabus/Physics/Kinematics_Simulator/index.html" class="card sub-physics" data-module-id="uni-phys-kinematics">
                <div class="card-tag">University Core</div>
                <h3>Kinematics & Dynamics Lab</h3>
                <p>Interactive 2D physics simulator featuring real-time vector analysis, trajectory prediction, and collision mechanics.</p>
                
                <div class="progress-bar-container" style="display: none;">
                    <div class="progress-bar-fill"></div>
                </div>
            </a>
            
            <!-- Future Modules Stub -->
            <a href="#" class="card" style="opacity: 0.5; cursor: not-allowed;" onclick="event.preventDefault(); alert('Coming Soon!');">
                <div class="card-tag">Upcoming</div>
                <h3>Quantum Mechanics Lab</h3>
                <p>Wavefunction collapse and Schrodinger equation visualizations.</p>
            </a>
            
            <a href="#" class="card" style="opacity: 0.5; cursor: not-allowed;" onclick="event.preventDefault(); alert('Coming Soon!');">
                <div class="card-tag">Upcoming</div>
                <h3>Electromagnetism Simulator</h3>
                <p>Maxwell\\'s equations and 3D magnetic field simulations.</p>
            </a>
        </div>
    </div>
</main>'''

html = re.sub(r'<main>.*?</main>', main_block_new, html, flags=re.DOTALL)

with open('uni-hub-physics.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("uni-hub-physics.html generated successfully.")
