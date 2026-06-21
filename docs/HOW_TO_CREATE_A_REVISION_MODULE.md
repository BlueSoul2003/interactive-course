# How to Create a Revision Module

This guide outlines the standard process and pillars to check when creating a new Revision Module for any subject or unit (e.g., KSSR English). Revision modules are gamified check-points combining 4 different mini-games to reinforce vocabulary and grammar from previous units.

## 🏛️ Pillars to Check Before Starting
Before writing any code, ensure you have gathered the following:

1. **Target Units:** Identify the 2 (or more) units the revision will cover.
2. **Vocabulary Selection:** Extract a total of **40 words/phrases** from the target units.
3. **Translation Support:** Ensure every word has a paired translation (e.g., `en` and `zh` keys) to support bilingual tooltip requirements.
4. **Data Distribution:** Divide the 40 words into 4 groups of 10 for the 4 mini-game stages:
   - **Stage 1 (Flash Match ⚡):** Word matching
   - **Stage 2 (Bubble Pop 🫧):** Word typing/spelling
   - **Stage 3 (Whack-a-Mole 🐹):** Rapid translation selection
   - **Stage 4 (Jump! Jump! 🏃):** Endless runner spelling

## 🛠️ Step-by-Step Implementation Process

### 1. Create the Module Directory & File
Instead of building from scratch, duplicate the `index.html` file from an existing revision module (e.g., `Primary3/English/Revision1/index.html`) to your new destination folder (e.g., `Revision3/`).

### 2. Update File Metadata & Theming
Inside the new `index.html`, do a find-and-replace for the following:
- **Module ID:** Change `data-module-id="kssr-p3-en-revision1"` to the new canonical ID (e.g., `kssr-p3-en-revision3`).
- **Text & Titles:** Change the visible headers (e.g., "Revision 1 (Unit 1 & 2)") to reflect the new units.
- **Color Theme:** To visually separate revisions, find and replace the primary Tailwind color classes. For example, replace all instances of `teal` and `rose` with `violet` and `amber` (or `blue` and `orange`). Check attributes like `bg-`, `text-`, `border-`, `ring-`, `from-`, and `to-`.

### 3. Replace the Vocabulary Data
Locate the `const vocabData = [...]` array in the JavaScript section of the `index.html`. Replace the arrays inside with your 4 groups of 10 vocabulary words prepared in the first step.

```javascript
const vocabData = [
    // Stage 1 (10 words)
    [ { en: "Word1", zh: "翻译1" }, ... ],
    // Stage 2 (10 words)
    [ { en: "Word11", zh: "翻译11" }, ... ],
    // Stage 3 (10 words)
    [ { en: "Word21", zh: "翻译21" }, ... ],
    // Stage 4 (10 words)
    [ { en: "Word31", zh: "翻译31" }, ... ]
];
```

### 4. Register in Supabase Database
Every module must be registered in the central database to work with the PIN authorization system.
1. Open `db/schema.sql`.
2. Locate the `INSERT INTO public.modules` section.
3. Add your new module ID to the values:
   ```sql
   ('kssr-p3-en-revision3', 'Revision 3 (Unit 5 & 6)', 'kssr', 'english', 'kssr_p3_english', 'Primary3')
   ```
4. **Crucial Step:** Run the updated `INSERT INTO public.modules ... ON CONFLICT (id) DO NOTHING;` command in the Supabase SQL Editor.

### 5. Update the Main Landing Page (`index.html`)
The new module must be accessible from the main curriculum grid. You must strictly adhere to the UI layout to prevent breaking the DOM structure.

**Important UI Structure Rules:**
When a user clicks a subject (e.g., KSSR English), they are presented with "Year" selector cards (e.g., Year 3, Year 6). Clicking a Year must open a clean `view-layer` containing exactly **two distinct sections**:
1. **Chapters**: The regular class modules.
2. **Revision**: The revision mini-games.

To add your new revision module:
1. Open the root `index.html` file.
2. Locate the specific Year's view-layer (e.g., `<div id="kssr-english-y3" class="view-layer">`).
3. Scroll down past the `Chapters` section and locate the `<h2>` section titled **Revision**.
4. Inside the `<div class="grid">` that immediately follows the Revision `<h2>`, add your new `<a class="card">` block.
5. **CRITICAL WARNING:** Always ensure that your new `<a class="card">` is placed **inside** the `<div class="grid">` container, and that you do not accidentally remove or misplace the closing `</div>` tags. Misplacing `</div>` tags will cause cards to leak outside the `view-layer` and break the UI layout for other sections.

## ✅ Verification Checklist
- [ ] Does the new `index.html` load without console errors?
- [ ] Is the module appearing under the "Revision Mini-Games" section on the main page?
- [ ] Are all 4 game stages correctly iterating through 10 words each?
- [ ] Are time punishments triggering correctly on wrong answers?
- [ ] Has the module been registered in the Supabase SQL editor?
