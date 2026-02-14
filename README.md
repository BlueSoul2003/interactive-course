# 🚀 Interactive Learning Portal (interactive-course)

A collection of interactive courses and modules designed to accelerate learning through **First Principles thinking**, logical deduction, and interactive scenarios. 

**🌍 Live Site:** [https://bluesoul2003.github.io/interactive-course/](https://bluesoul2003.github.io/interactive-course/)

---

## 📚 Features
* **Global Syllabus Support:** Segmented learning paths for SPM, UEC, IGCSE, and Singapore (O/A-Level) syllabuses.
* **Bilingual Semantic Bridging:** Dual-language support (English/Chinese) in quizzes to build mental models efficiently.
* **Layered Architecture:** Clean, distraction-free UI utilizing a 3-layer folder structure (Syllabus > Subject > Module).
* **Zero-Dependency Core:** Built purely with HTML, Vanilla JavaScript, and Tailwind CSS (via CDN) for maximum speed and easy hosting via GitHub Pages.

---

## 🛠️ Portal Expansion Guide (For Developers/Instructors)

This guide explains how to scale the landing page (`grand_landing_page.html`) using the existing HTML/JS architecture. The system uses a "Folder-like" nested structure managed by simple `onclick` JavaScript functions.

### Scenario 1: Adding a Completely New Syllabus (e.g., "A-Level")

To add a new syllabus, you need to add a Tab Button (Layer 1) and its corresponding Content Wrapper (Layer 2).

**Step 1: Add the Tab Button**
Find the `<div class="tabs-container">` in your HTML. Add a new button. Assign a unique ID for the syllabus (e.g., `alevel`).

<pre><code>&lt;button class="tab-btn" onclick="switchSyllabus(event, 'alevel')"&gt;🇬🇧 A-Level&lt;/button&gt;</code></pre>

**Step 2: Create the Syllabus Container**
Scroll down past the existing syllabuses. Before the closing `</main>` tag, add this exact block structure. Replace `alevel` with your chosen ID.

<pre><code>&lt;!-- ==========================================
     A-LEVEL SYLLABUS CONTENT
=========================================== --&gt;
&lt;div id="alevel" class="syllabus-content"&gt;
    
    &lt;!-- LAYER 2: A-Level Subjects --&gt;
    &lt;div id="alevel-subjects" class="view-layer active"&gt;
        &lt;h2 class="section-title"&gt;
            &lt;div class="section-icon"&gt;🇬🇧&lt;/div&gt;
            A-Level Subjects
        &lt;/h2&gt;
        
        &lt;div class="grid"&gt;
            &lt;!-- Paste Subject Cards Here (See Scenario 2) --&gt;
        &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;!-- LAYER 3: Module Folders will go here (See Scenario 3) --&gt;

&lt;/div&gt;</code></pre>

### Scenario 2: Adding a New Subject to an Existing Syllabus

Let's say you want to add "Computer Science" to the SPM syllabus. You must decide: will this link directly to a single page, or will it act as a "Folder" holding multiple modules?

**Option A: Direct Link (No Folder)**
Find the `<div id="spm-subjects">` block. Inside its `<div class="grid">`, paste this standard anchor tag (`<a>`):

<pre><code>&lt;a href="spm_computerscience.html" class="card sub-science"&gt;
    &lt;div class="card-tag"&gt;SPM Elective&lt;/div&gt;
    &lt;h3&gt;Computer Science&lt;/h3&gt;
    &lt;p&gt;Master algorithms, Python programming, and database logic.&lt;/p&gt;
    &lt;div class="card-footer"&gt;&lt;div class="start-link"&gt;Explore Module &lt;span&gt;&amp;rarr;&lt;/span&gt;&lt;/div&gt;&lt;/div&gt;
&lt;/a&gt;</code></pre>

**Option B: Make it a Folder (Requires Scenario 3)**
If Computer Science will hold multiple lessons, use a `<div>` instead of an `<a>`, and add the `onclick` trigger.

<pre><code>&lt;div class="card sub-science" style="cursor: pointer;" onclick="showLessons('spm', 'spm-cs')"&gt;
    &lt;div class="card-tag"&gt;SPM Elective&lt;/div&gt;
    &lt;h3&gt;Computer Science&lt;/h3&gt;
    &lt;p&gt;Master algorithms, Python programming, and database logic.&lt;/p&gt;
    &lt;div class="card-footer"&gt;&lt;div class="start-link"&gt;View Modules &lt;span&gt;&amp;rarr;&lt;/span&gt;&lt;/div&gt;&lt;/div&gt;
&lt;/div&gt;</code></pre>
*(Note: If you use Option B, you MUST complete Scenario 3 below to create the actual folder).*

### Scenario 3: Adding New Modules / Creating Folders

**Case A: Adding a new module to an EXISTING folder**
If you just want to add `lesson5.html` to **SPM English**, simply find `<div id="spm-english">` and paste the new card inside its grid:

<pre><code>&lt;a href="lesson5.html" class="card sub-english"&gt;
    &lt;div class="card-tag"&gt;Module 5 • Formal Letter&lt;/div&gt;
    &lt;h3&gt;Professional Writing&lt;/h3&gt;
    &lt;p&gt;Master the format and tone of formal communication.&lt;/p&gt;
    &lt;div class="card-footer"&gt;&lt;div class="start-link"&gt;Start Lesson &lt;span&gt;&amp;rarr;&lt;/span&gt;&lt;/div&gt;&lt;/div&gt;
&lt;/a&gt;</code></pre>

**Case B: Creating a BRAND NEW folder for a subject**
Let's say you chose "Option B" in Scenario 2 to make **SPM Computer Science** a folder (`onclick="showLessons('spm', 'spm-cs')"`).

You must create the Layer 3 container for it. Paste this directly below the `spm-subjects` `</div>` closure, but still inside the main `<div id="spm">` container.

<pre><code>&lt;!-- LAYER 3: SPM Computer Science Lessons --&gt;
&lt;div id="spm-cs" class="view-layer"&gt;
    &lt;!-- Back Button: Make sure parameter matches the Syllabus ID --&gt;
    &lt;button class="back-btn" onclick="showSubjects('spm')"&gt;&amp;larr; Back to SPM Subjects&lt;/button&gt;
    
    &lt;h2 class="section-title" style="margin-top: 10px;"&gt;
        &lt;div class="section-icon" style="color: var(--sub-science); border-color: var(--sub-science);"&gt;💻&lt;/div&gt;
        SPM Computer Science Modules
    &lt;/h2&gt;
    
    &lt;div class="grid"&gt;
        &lt;!-- Paste individual module cards here --&gt;
        &lt;a href="cs_module1.html" class="card sub-science"&gt;
            &lt;div class="card-tag"&gt;Module 1&lt;/div&gt;
            &lt;h3&gt;Logic Gates&lt;/h3&gt;
            &lt;p&gt;Understand AND, OR, NOT logic from first principles.&lt;/p&gt;
            &lt;div class="card-footer"&gt;&lt;div class="start-link"&gt;Start Lesson &lt;span&gt;&amp;rarr;&lt;/span&gt;&lt;/div&gt;&lt;/div&gt;
        &lt;/a&gt;
    &lt;/div&gt;
&lt;/div&gt;</code></pre>

### 🎨 Quick Reference: Color Classes
When creating new cards, change the `sub-xxxxx` class to auto-theme the card's accent colors:

* `sub-english` (Blue)
* `sub-bm` (Purple)
* `sub-math` (Pink)
* `sub-science` (Emerald Green)
* `sub-chinese` (Red)
* `sub-sejarah` (Amber/Orange)
* `sub-chemistry` (Cyan)
* `sub-physics` (Indigo)
* `sub-biology` (Lime Green)

**Pro-Tip:** If a module is locked or under construction, add `card-locked` to the classes and `style="opacity:0.6; filter:grayscale(1);"` to gray it out visually.
