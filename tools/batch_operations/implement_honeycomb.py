import re

with open('university.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Define the new styles and main content
new_content = '''
    <style>
        /* Honeycomb Window Styles */
        .honeycomb-window {
            width: 100%;
            height: 60vh;
            min-height: 500px;
            background: rgba(17, 24, 39, 0.2);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            cursor: grab;
            box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
            margin-bottom: 40px;
        }
        .honeycomb-window:active {
            cursor: grabbing;
        }
        
        .honeycomb-canvas {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 3000px;
            height: 3000px;
            /* Center the 3000x3000 canvas around the 0,0 origin using margins */
            margin-left: -1500px;
            margin-top: -1500px;
            transform: translate(0px, 0px);
            /* Enable hardware acceleration */
            will-change: transform;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .hex-row {
            display: flex;
            justify-content: center;
            /* Negative margin to overlap the flat top/bottom of hexagons */
            margin-bottom: -35px;
        }
        
        /* Offset even rows to create the honeycomb interlock */
        .hex-row:nth-child(even) {
            transform: translateX(70px);
        }

        .hex-cell {
            width: 130px;
            height: 150px;
            margin: 0 5px;
            background: var(--glass-bg);
            /* Flat-topped hexagon */
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: var(--text-primary);
            font-family: var(--font-main);
            transition: all 0.3s ease;
            text-decoration: none;
            position: relative;
            /* Fake border effect using an inner div */
        }
        
        /* The inner part to simulate a border */
        .hex-inner {
            width: 126px;
            height: 146px;
            background: rgba(17, 24, 39, 0.7);
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
            backdrop-filter: blur(10px);
        }

        .hex-cell:hover {
            transform: scale(1.05);
            z-index: 10;
        }
        .hex-cell:hover .hex-inner {
            background: rgba(99, 102, 241, 0.3); /* Indigo tint on hover */
        }

        .hex-icon {
            font-size: 2rem;
            margin-bottom: 5px;
        }
        .hex-title {
            font-size: 0.85rem;
            font-weight: 600;
            line-height: 1.2;
        }

        /* Specific subject colors (subtle glow on hover) */
        .hex-physics:hover { filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.8)); }
        .hex-cs:hover { filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.8)); }
        .hex-math:hover { filter: drop-shadow(0 0 15px rgba(236, 72, 153, 0.8)); }
        .hex-business:hover { filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.8)); }
        .hex-arts:hover { filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.8)); }
        .hex-med:hover { filter: drop-shadow(0 0 15px rgba(6, 182, 212, 0.8)); }

    </style>

    <main>
        <div class="honeycomb-window" id="honeycomb-window">
            <div class="honeycomb-canvas" id="honeycomb-canvas">
                
                <!-- Row 1 -->
                <div class="hex-row">
                    <a href="#" class="hex-cell hex-arts">
                        <div class="hex-inner">
                            <div class="hex-icon">??</div>
                            <div class="hex-title">Fine Arts</div>
                        </div>
                    </a>
                    <a href="#" class="hex-cell hex-med">
                        <div class="hex-inner">
                            <div class="hex-icon">??</div>
                            <div class="hex-title">Medicine</div>
                        </div>
                    </a>
                </div>

                <!-- Row 2 -->
                <div class="hex-row">
                    <a href="#" class="hex-cell hex-math">
                        <div class="hex-inner">
                            <div class="hex-icon">??</div>
                            <div class="hex-title">Mathematics</div>
                        </div>
                    </a>
                    <a href="content/University_Syllabus/Physics/Kinematics_Simulator/index.html" class="hex-cell hex-physics" style="background: rgba(99,102,241,0.5);">
                        <div class="hex-inner">
                            <div class="hex-icon">??</div>
                            <div class="hex-title">Physics Lab</div>
                        </div>
                    </a>
                    <a href="#" class="hex-cell hex-business">
                        <div class="hex-inner">
                            <div class="hex-icon">??</div>
                            <div class="hex-title">Business</div>
                        </div>
                    </a>
                </div>

                <!-- Row 3 -->
                <div class="hex-row">
                    <a href="#" class="hex-cell hex-cs">
                        <div class="hex-inner">
                            <div class="hex-icon">??</div>
                            <div class="hex-title">Computer Science</div>
                        </div>
                    </a>
                    <a href="#" class="hex-cell hex-arts">
                        <div class="hex-inner">
                            <div class="hex-icon">??</div>
                            <div class="hex-title">Literature</div>
                        </div>
                    </a>
                </div>

                <!-- Row 4 -->
                <div class="hex-row">
                    <a href="#" class="hex-cell">
                        <div class="hex-inner">
                            <div class="hex-icon">?</div>
                            <div class="hex-title">Add Module</div>
                        </div>
                    </a>
                </div>

            </div>
        </div>
    </main>

    <!-- Honeycomb Panning Script -->
    <script>
        const windowEl = document.getElementById('honeycomb-window');
        const canvasEl = document.getElementById('honeycomb-canvas');
        
        let isDragging = false;
        let startX, startY;
        let currentX = 0, currentY = 0;
        let initialX, initialY;

        // Prevent default drag behaviors on links
        document.querySelectorAll('.hex-cell').forEach(cell => {
            cell.addEventListener('dragstart', e => e.preventDefault());
        });

        function onPointerDown(e) {
            isDragging = true;
            windowEl.style.cursor = 'grabbing';
            
            // Handle both mouse and touch
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            initialX = clientX - currentX;
            initialY = clientY - currentY;
            
            // Small threshold to distinguish click from drag
            startX = clientX;
            startY = clientY;
        }

        function onPointerMove(e) {
            if (!isDragging) return;
            e.preventDefault(); // Prevent scrolling on mobile
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            currentX = clientX - initialX;
            currentY = clientY - initialY;
            
            canvasEl.style.transform = 	ranslate(px, px);
        }

        function onPointerUp(e) {
            isDragging = false;
            windowEl.style.cursor = 'grab';
        }

        // Mouse events
        windowEl.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        // Touch events
        windowEl.addEventListener('touchstart', onPointerDown, {passive: false});
        window.addEventListener('touchmove', onPointerMove, {passive: false});
        window.addEventListener('touchend', onPointerUp);

        // Click interceptor: if moved more than 5px, don't trigger click on links
        windowEl.addEventListener('click', function(e) {
            if (e.target.closest('a')) {
                const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
                if (dist > 5) {
                    e.preventDefault();
                }
            }
        });
    </script>
'''

# Use regex to replace everything between <main> and </main>
html = re.sub(r'<main>.*?</main>', new_content, html, flags=re.DOTALL)

with open('university.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("university.html honeycomb layout implemented!")
