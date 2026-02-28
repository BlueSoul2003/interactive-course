# Progress Tracking — Developer Guide

## Overview

All modules in this project use a **single universal SDK** (`js/progress-tracker.js`) powered by **Supabase** (cloud database). Progress is stored in the cloud — it works from any device, any browser, including Incognito.

---

## How to Add Progress Tracking to Any New Module

### Step 1 — Add the script tag (before `</body>`)

```html
<script src="[relative path to root]/js/progress-tracker.js"
        data-module-id="YOUR_MODULE_ID"
        data-module-name="Human Readable Name"
        data-module-url="content/your/path/index.html">
</script>
```

- **`data-module-id`**: Unique key, no spaces, e.g. `SPM_Peribahasa`, `IGCSE_Math_S7C1`. Never reuse an ID.
- **`data-module-name`**: What appears in the Student Dashboard, e.g. `SPM Peribahasa (BM)`.
- **`data-module-url`**: The URL the Resume button in the Dashboard links to (relative to site root).

### Step 2 — Load saved progress on page start

```html
<script>
    window.addEventListener('load', async () => {
        const saved = await ProgressTracker.load();
        if (saved && saved.progress_data) {
            const p = saved.progress_data;
            // Restore your module state from p, e.g.:
            // currentStep = p.step ?? 1;
            // goToStep(currentStep);
        }
    });
</script>
```

### Step 3 — Save progress whenever the student navigates

```javascript
// Call this anywhere the student makes progress:
ProgressTracker.save({
    step: currentStep,
    score: myScore,
    // ... any other state you need to restore
});
```

That's it. **No module ID needed** in `save()` or `load()` — the SDK reads it from the `data-module-id` attribute automatically.

---

## Active Student Badge (optional but recommended)

Show the student's name inside the module so the teacher can confirm who is active:

```html
<!-- In your module <header> -->
<div id="activeStudentBadge" style="display:none; ...">
    👤 <span id="activeStudentName"></span>
</div>
```

```javascript
// Inside your load block:
const student = ProgressTracker.getActiveStudent();
if (student) {
    document.getElementById('activeStudentBadge').style.display = 'block';
    document.getElementById('activeStudentName').innerText = student;
}
```

---

## Supabase Setup (one-time, done by admin)

### 1. Create a free account
Go to [supabase.com](https://supabase.com) → New Project → pick a name and region.

### 2. Run this SQL (Supabase dashboard → SQL Editor → New Query)

```sql
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    student_name TEXT NOT NULL REFERENCES students(name) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    module_url TEXT NOT NULL,
    progress_data JSONB NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_name, module_id)
);

-- Allow anonymous read/write (needed for a static GitHub Pages site)
ALTER TABLE students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_students"  ON students  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_progress"  ON progress  FOR ALL USING (true) WITH CHECK (true);
```

### 3. Get your API keys
Supabase dashboard → Project Settings → API:
- Copy **Project URL** (looks like `https://xyzabc.supabase.co`)
- Copy **anon public** key (starts with `eyJ...`)

### 4. Paste into `js/progress-tracker.js`

```javascript
const SUPABASE_URL  = 'https://your-project.supabase.co';  // ← paste here
const SUPABASE_KEY  = 'eyJ...';                              // ← paste here
```

### 5. Commit and push to GitHub
The site deployed on GitHub Pages will immediately use Supabase for all progress data.

---

## Architecture Summary

```
Any Module (static HTML)
   └── <script data-module-id="..." src=".../js/progress-tracker.js">
            └── calls Supabase REST API (fetch)
                    └── PostgreSQL in the cloud

index.html Student Dashboard
   └── reads ProgressTracker.getStudents() + .getAllProgressForStudent()
            └── also via Supabase REST API
```
