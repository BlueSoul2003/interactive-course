import re

with open('university.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace CSS
old_css_hex_row = '''        .hex-row {
            display: flex;
            justify-content: center;
            /* Negative margin to overlap the flat top/bottom of hexagons */
            margin-bottom: -35px;
        }
        
        /* Offset even rows to create the honeycomb interlock */
        .hex-row:nth-child(even) {
            transform: translateX(70px);
        }'''

new_css_hex_row = '''        .hex-row {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
            transition: transform 0.1s ease-out; /* For parallax smooth scroll */
        }
        
        .hex-row:nth-child(even) {
            transform: translateX(110px);
        }
        .hex-row:nth-child(odd) {
            transform: translateX(0px);
        }'''
html = html.replace(old_css_hex_row, new_css_hex_row)

old_css_cell = '''        .hex-cell {
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
        }'''

new_css_cell = '''        .hex-cell {
            width: 220px;
            height: 70px;
            margin: 0 10px;
            background: var(--glass-bg);
            border-radius: 50px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            text-align: left;
            color: var(--text-primary);
            font-family: var(--font-main);
            transition: all 0.3s ease;
            text-decoration: none;
            position: relative;
            padding: 2px;
            animation: fluid-float 5s ease-in-out infinite;
        }

        .hex-row:nth-child(1) .hex-cell { animation-delay: 0s; }
        .hex-row:nth-child(2) .hex-cell { animation-delay: 0.8s; }
        .hex-row:nth-child(3) .hex-cell { animation-delay: 1.6s; }
        .hex-row:nth-child(4) .hex-cell { animation-delay: 2.4s; }

        @keyframes fluid-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .hex-inner {
            width: 100%;
            height: 100%;
            background: rgba(17, 24, 39, 0.85);
            border-radius: 50px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            padding: 0 20px;
            box-sizing: border-box;
            backdrop-filter: blur(10px);
        }'''
html = html.replace(old_css_cell, new_css_cell)

old_css_icon = '''        .hex-icon {
            font-size: 2rem;
            margin-bottom: 5px;
        }'''
new_css_icon = '''        .hex-icon {
            font-size: 1.5rem;
            margin-right: 12px;
            margin-bottom: 0;
        }'''
html = html.replace(old_css_icon, new_css_icon)

# Add parallax scroll JS at the very end
parallax_js = '''
        // Parallax Scroll Effect for the flowing feel
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const rows = document.querySelectorAll('.hex-row');
            rows.forEach((row, index) => {
                const baseTranslateX = (index % 2 === 1) ? 110 : 0;
                // Move rows slightly at different speeds based on index
                const parallaxY = scrollY * (0.1 + (index * 0.02));
                row.style.transform = 	ranslate(px, px);
            });
        });
    </script>'''
html = html.replace('    </script>', parallax_js)

with open('university.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("university.html pill shape and flow applied!")
