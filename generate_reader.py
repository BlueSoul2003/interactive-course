import json
import re

md_path = r"C:\Users\hong0\Desktop\interactive-course-main\content\SPM_Syllabus\Form5\BM\KOMSAS\Novel_Silir_Daksina\Sinopsis_ikut_bab.md"

with open(md_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Splitting logic
chapters_raw = re.split(r'\n## ', '\n' + text)
chapters = []

for idx, raw in enumerate(chapters_raw):
    raw = raw.strip()
    if not raw:
        continue
    
    lines = raw.split('\n')
    title = lines[0]
    if title.startswith('# Sinopsis'):
        title = "Pengenalan"
    
    content = '\n'.join(lines[1:]).strip()
    
    # split into paragraphs
    paragraphs = content.split('\n\n')
    
    chapter_sentences = []
    for p in paragraphs:
        p = p.strip()
        if not p: continue
        if p.startswith('###'):
            # It's a subtitle, treat as a single sentence/block
            chapter_sentences.append([p.replace('### ', '').strip()])
            continue
        
        # Split paragraph into sentences. Simple regex for Malay
        # match . ? ! followed by space or end of string
        sentences = re.split(r'(?<=[.?!])\s+(?=[A-Z0-9"“])', p)
        # remove newlines within sentences
        sentences = [s.replace('\n', ' ').strip() for s in sentences if s.strip()]
        if sentences:
            chapter_sentences.append(sentences)
            
    chapters.append({
        'title': title,
        'paragraphs': chapter_sentences
    })

# Write the HTML
html_content = """<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novel Silir Daksina - Interactive Reading</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Comic+Neue:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Baloo 2', 'Comic Neue', sans-serif;
            background-color: #F8FAFC;
            color: #1E293B;
            overflow-x: hidden;
            transition: background-color 0.5s ease;
        }
        .dimmed {
            opacity: 0.25;
            transition: opacity 0.3s ease, transform 0.3s ease;
            filter: blur(1px);
        }
        .highlighted {
            opacity: 1;
            transform: scale(1.02);
            transition: opacity 0.3s ease, transform 0.3s ease, font-weight 0.3s ease;
            filter: blur(0px);
            font-weight: 600;
            color: #2563EB;
            background-color: #EFF6FF;
            padding: 2px 4px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
        }
        .sentence {
            display: inline;
            line-height: 1.8;
            cursor: pointer;
            margin-right: 4px;
        }
        
        /* Smooth transitions */
        #chapter-container {
            animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .illustration {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transition: transform 0.5s ease;
        }
        
        .illustration:hover {
            transform: scale(1.02);
        }

        /* Reading progress bar */
        #progress-bar {
            height: 6px;
            background-color: #F97316;
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 0 4px 4px 0;
        }
        
        /* Pulse for CTA */
        .pulse-btn {
            animation: pulse-orange 2s infinite;
        }
        @keyframes pulse-orange {
            0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
            100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
    </style>
</head>
<body class="antialiased min-h-screen flex flex-col" tabindex="0">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div class="fixed top-0 left-0 w-full bg-gray-200 h-1.5 z-50">
            <div id="progress-bar"></div>
        </div>
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <a href="../../../../../index.html" class="text-blue-600 hover:text-blue-800 transition flex items-center font-semibold z-50">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Kembali
                </a>
                <h1 class="text-xl font-bold tracking-tight text-gray-800 hidden md:block">Novel Silir Daksina</h1>
            </div>
            <div class="flex items-center space-x-4">
                <span id="chapter-indicator" class="text-sm font-medium bg-blue-100 text-blue-800 py-1 px-3 rounded-full"></span>
                <span id="progress-text" class="text-sm font-medium text-gray-500"></span>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow pt-24 pb-32 px-4 md:px-8 max-w-4xl mx-auto w-full flex flex-col items-center">
        <!-- Start Screen -->
        <div id="start-screen" class="w-full text-center py-20 animate-[fadeIn_0.5s_ease-out]">
            <h1 class="text-5xl md:text-6xl font-bold text-blue-600 mb-6 drop-shadow-sm">Silir Daksina</h1>
            <p class="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">Alami pengalaman membaca interaktif. Tekan mana-mana kekunci, klik skrin, atau sentuh untuk membaca ayat demi ayat.</p>
            <button id="start-btn" class="pulse-btn bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold py-4 px-10 rounded-full shadow-lg transform transition active:scale-95 focus:outline-none focus:ring-4 focus:ring-orange-300">
                Mulakan Bacaan
            </button>
        </div>

        <!-- Reader Screen -->
        <div id="reader-screen" class="w-full hidden mt-4">
            
            <div class="mb-10 w-full relative group">
                <!-- Replace src with local generated images later if available -->
                <img id="chapter-image" src="" alt="Ilustrasi Bab" class="illustration bg-gray-200">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl flex items-end p-6 pointer-events-none opacity-90 transition-opacity">
                    <h2 id="chapter-title" class="text-3xl md:text-4xl font-bold text-white drop-shadow-md"></h2>
                </div>
            </div>

            <div id="content-container" class="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100 mb-10 text-lg md:text-xl lg:text-2xl cursor-pointer">
                <!-- Content will be injected here -->
            </div>
            
            <div class="flex justify-between items-center w-full pb-8">
                <button id="prev-btn" class="text-gray-500 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition invisible disabled:opacity-50">
                    &larr; Bab Sebelumnya
                </button>
                <div class="flex flex-col items-center opacity-60 text-sm font-medium">
                    <svg class="w-6 h-6 animate-bounce mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-3 3m0 0l-3-3m3 3V9m0 12a9 9 0 110-18 9 9 0 010 18z"></path></svg>
                    Klik / Tekan kekunci untuk teruskan
                </div>
                <button id="next-btn" class="bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold px-6 py-2 rounded-full transition shadow-sm invisible disabled:opacity-50">
                    Bab Seterusnya &rarr;
                </button>
            </div>
            
            <div id="end-screen" class="hidden text-center py-10 bg-green-50 rounded-2xl border border-green-200 mt-8">
                <h3 class="text-2xl font-bold text-green-600 mb-2">Tahniah!</h3>
                <p class="text-green-800">Anda telah tamat membaca keseluruhan sinopsis Novel Silir Daksina.</p>
                <button id="restart-btn" class="mt-4 bg-white text-green-700 border border-green-300 hover:bg-green-100 font-bold py-2 px-6 rounded-full transition shadow-sm">
                    Baca Semula
                </button>
            </div>
        </div>
    </main>

    <script>
        const novelData = __DOC_DATA__;
        
        // Settings and State
        let currentChapterIndex = 0;
        let currentSentenceIndex = 0;
        let sentencesFlat = []; 
        let isStarted = false;
        
        const defaultImages = [
            "https://placehold.co/800x400/2563EB/ffffff?text=Pengenalan",
            "https://placehold.co/800x400/1E40AF/ffffff?text=Bab+1",
            "https://placehold.co/800x400/1D4ED8/ffffff?text=Bab+2",
            "https://placehold.co/800x400/2563EB/ffffff?text=Bab+3",
            "https://placehold.co/800x400/3B82F6/ffffff?text=Bab+4",
            "https://placehold.co/800x400/60A5FA/ffffff?text=Bab+5",
            "https://placehold.co/800x400/93C5FD/ffffff?text=Bab+6",
            "https://placehold.co/800x400/0369A1/ffffff?text=Bab+7",
            "https://placehold.co/800x400/0284C7/ffffff?text=Bab+8",
            "https://placehold.co/800x400/0EA5E9/ffffff?text=Bab+9",
            "https://placehold.co/800x400/38BDF8/ffffff?text=Bab+10",
            "https://placehold.co/800x400/0D9488/ffffff?text=Bab+11",
            "https://placehold.co/800x400/14B8A6/ffffff?text=Bab+12",
            "https://placehold.co/800x400/2DD4BF/ffffff?text=Bab+13",
            "https://placehold.co/800x400/5EEAD4/ffffff?text=Bab+14",
            "https://placehold.co/800x400/059669/ffffff?text=Bab+15",
            "https://placehold.co/800x400/10B981/ffffff?text=Bab+16"
        ];
        
        // This array can be populated with actual nanobanana images we generate
        const generatedImages = {
            "1": "bab1.png"
        };
        
        // DOM Elements
        const startScreen = document.getElementById('start-screen');
        const readerScreen = document.getElementById('reader-screen');
        const startBtn = document.getElementById('start-btn');
        const contentContainer = document.getElementById('content-container');
        const chapterTitle = document.getElementById('chapter-title');
        const chapterImage = document.getElementById('chapter-image');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const endScreen = document.getElementById('end-screen');
        const restartBtn = document.getElementById('restart-btn');
        const chapterIndicator = document.getElementById('chapter-indicator');
        const progressText = document.getElementById('progress-text');
        const progressBar = document.getElementById('progress-bar');
        
        function init() {
            startBtn.addEventListener('click', startReading);
            restartBtn.addEventListener('click', () => {
                currentChapterIndex = 0;
                loadChapter(0);
                endScreen.classList.add('hidden');
            });
            
            // Interaction to advance sentence
            document.body.addEventListener('keydown', handleInteraction);
            document.body.addEventListener('click', (e) => {
                // Ignore clicks on buttons or links
                if(e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) return;
                handleInteraction(e);
            });
            
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if(currentChapterIndex > 0) loadChapter(currentChapterIndex - 1);
            });
            
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if(currentChapterIndex < novelData.length - 1) loadChapter(currentChapterIndex + 1);
            });
        }
        
        function startReading(e) {
            e.stopPropagation();
            isStarted = true;
            startScreen.classList.add('hidden');
            readerScreen.classList.remove('hidden');
            loadChapter(0);
            
            // Focus body to ensure keyboard events work immediately
            document.body.focus();
        }
        
        function loadChapter(index) {
            if (index < 0 || index >= novelData.length) return;
            
            currentChapterIndex = index;
            const chapter = novelData[index];
            sentencesFlat = [];
            currentSentenceIndex = 0;
            
            // Update UI
            chapterTitle.textContent = chapter.title;
            chapterIndicator.textContent = `${index === 0 ? 'Pengenalan' : index}/${novelData.length - 1}`;
            
            // Set image
            const imgPath = generatedImages[index.toString()];
            if(imgPath) {
                chapterImage.src = imgPath; 
            } else {
                chapterImage.src = defaultImages[Math.min(index, defaultImages.length - 1)] || defaultImages[0];
            }
            
            // Build Content
            contentContainer.innerHTML = '';
            let globalSenIdx = 0;
            
            chapter.paragraphs.forEach((paragraph, pIdx) => {
                const pEl = document.createElement('p');
                pEl.className = "mb-6 text-gray-700 leading-relaxed text-left";
                
                // Subtitles
                if (paragraph.length === 1 && !paragraph[0].endsWith('.') && !paragraph[0].endsWith('?') && !paragraph[0].endsWith('!') && paragraph[0].length < 60) {
                    pEl.className = "text-xl md:text-2xl font-bold text-blue-700 mt-8 mb-4";
                }
                
                paragraph.forEach((sentence, sIdx) => {
                    const span = document.createElement('span');
                    span.className = 'sentence dimmed';
                    span.id = `sen-${globalSenIdx}`;
                    span.textContent = sentence;
                    
                    // Add spaces between sentences except for subtitle
                    if (sIdx > 0) {
                        pEl.appendChild(document.createTextNode(' '));
                    }
                    pEl.appendChild(span);
                    
                    sentencesFlat.push({ el: span, text: sentence });
                    globalSenIdx++;
                });
                
                contentContainer.appendChild(pEl);
            });
            
            // Buttons state
            if (currentChapterIndex > 0) {
                prevBtn.classList.remove('invisible');
            } else {
                prevBtn.classList.add('invisible');
            }
            
            if (currentChapterIndex < novelData.length - 1) {
                nextBtn.classList.remove('invisible');
            } else {
                nextBtn.classList.add('invisible');
            }
            endScreen.classList.add('hidden');
            
            // Auto highlight first sentence
            updateHighlight();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        function handleInteraction(e) {
            if (!isStarted || endScreen.classList.contains('hidden') === false) return;
            
            // If keyboard event, only accept space, arrow right, arrow down, enter
            if (e.type === 'keydown') {
                if (['Space', 'ArrowRight', 'ArrowDown', 'Enter'].includes(e.code)) {
                    e.preventDefault();
                } else {
                    return; // Ignore other keys
                }
            }
            
            if (currentSentenceIndex < sentencesFlat.length - 1) {
                currentSentenceIndex++;
                updateHighlight();
            } else if (currentChapterIndex < novelData.length - 1) {
                // Go to next chapter
                loadChapter(currentChapterIndex + 1);
            } else {
                // End of novel
                highlightAll();
                endScreen.classList.remove('hidden');
                nextBtn.classList.add('invisible');
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        }
        
        function updateHighlight() {
            sentencesFlat.forEach((item, idx) => {
                if (idx === currentSentenceIndex) {
                    item.el.classList.remove('dimmed');
                    item.el.classList.add('highlighted');
                    
                    // Only scroll if element is not in view
                    const rect = item.el.getBoundingClientRect();
                    const isInView = (
                        rect.top >= 100 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 50
                    );
                    
                    if (!isInView) {
                        const y = item.el.getBoundingClientRect().top + window.scrollY - (window.innerHeight / 2);
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                } else if (idx < currentSentenceIndex) {
                    // Previously read, make them normal but not highlighted
                    item.el.classList.remove('highlighted', 'dimmed');
                    item.el.style.opacity = '0.8';
                    item.el.style.fontWeight = 'normal';
                } else {
                    // Future sentences
                    item.el.classList.remove('highlighted');
                    item.el.classList.add('dimmed');
                }
            });
            
            // Update progress
            const progress = ((currentSentenceIndex + 1) / sentencesFlat.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${currentSentenceIndex + 1} / ${sentencesFlat.length}`;
        }
        
        function highlightAll() {
            sentencesFlat.forEach(item => {
                item.el.classList.remove('dimmed', 'highlighted');
                item.el.style.opacity = '1';
                item.el.style.fontWeight = 'normal';
            });
            progressText.textContent = "Selesai";
            progressBar.style.width = "100%";
        }
        
        // Boot
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>"""

html_content = html_content.replace('__DOC_DATA__', json.dumps(chapters, ensure_ascii=False))

out_path = r"C:\Users\hong0\Desktop\interactive-course-main\content\SPM_Syllabus\Form5\BM\KOMSAS\Novel_Silir_Daksina\index.html"
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Successfully generated {out_path} with {len(chapters)} chapters.")
