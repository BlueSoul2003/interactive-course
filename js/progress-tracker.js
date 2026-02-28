// ==============================================================
// progress-tracker.js  — Universal Student Progress SDK
// Powered by Supabase (https://supabase.com)
// ==============================================================
//
// HOW TO CONFIGURE:
//   1. Create a free project at supabase.com
//   2. Go to Project Settings → API
//   3. Replace the two values below with your project's values
//
// HOW TO USE IN ANY MODULE (3 lines):
//   <script src="[path-to-root]/js/progress-tracker.js"
//           data-module-id="UNIQUE_ID"
//           data-module-name="Human Readable Name"
//           data-module-url="[path-to-root]/content/.../index.html"></script>
//   <script>
//     window.addEventListener('load', async () => {
//       const saved = await ProgressTracker.load();
//       if (saved) { /* restore from saved.progress_data */ }
//     });
//     // Call ProgressTracker.save({...}) whenever student makes progress
//   </script>
//
// ==============================================================

const SUPABASE_URL = 'https://qfcpgqhrvegfdgvhqptw.supabase.co';   // e.g. https://xyzabc.supabase.co
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmY3BncWhydmVnZmRndmhxcHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzY5NDQsImV4cCI6MjA4Nzg1Mjk0NH0.GJF3EUqqCNKkSXyWOcqlaX23KG2S_NxHA30_MsoSBrg';       // starts with "eyJ..."

// ── Internal helpers ─────────────────────────────────────────────────────────

const _headers = () => ({
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Prefer': 'return=representation'
});

async function _query(path, method = 'GET', body = null) {
    const opts = { method, headers: _headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
    if (!res.ok) {
        const err = await res.text();
        console.error('[ProgressTracker] API error:', err);
        return null;
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

// ── Active student session ────────────────────────────────────────────────────

const _SESSION_KEY = 'mastery_active_student';

function _getActiveStudent() {
    return sessionStorage.getItem(_SESSION_KEY) || localStorage.getItem(_SESSION_KEY);
}

// ── Read module config from the script tag ────────────────────────────────────

function _getModuleConfig() {
    const tag = document.currentScript ||
        document.querySelector('script[data-module-id]');
    if (!tag) return null;
    return {
        id: tag.dataset.moduleId,
        name: tag.dataset.moduleName || tag.dataset.moduleId,
        url: tag.dataset.moduleUrl || location.pathname
    };
}

// ── Public API ────────────────────────────────────────────────────────────────

const ProgressTracker = {

    // ── Student management ────────────────────────────────────────────────────

    /** Returns array of all student name strings */
    async getStudents() {
        const rows = await _query('students?select=name&order=name');
        return rows ? rows.map(r => r.name) : [];
    },

    /** Creates a student; silently ignores if already exists */
    async createStudent(name) {
        await _query('students', 'POST', { name });
    },

    /** Sets the active student for this browser session */
    setActiveStudent(name) {
        localStorage.setItem(_SESSION_KEY, name);
        sessionStorage.setItem(_SESSION_KEY, name);
        document.dispatchEvent(new CustomEvent('activeStudentChanged', { detail: { name } }));
    },

    getActiveStudent() {
        return _getActiveStudent();
    },

    clearActiveStudent() {
        localStorage.removeItem(_SESSION_KEY);
        sessionStorage.removeItem(_SESSION_KEY);
        document.dispatchEvent(new CustomEvent('activeStudentChanged', { detail: { name: null } }));
    },

    // ── Progress management ───────────────────────────────────────────────────

    /**
     * Saves progress for active student in current module.
     * @param {object} data - Any JSON-serialisable state to save
     */
    async save(data) {
        const student = _getActiveStudent();
        if (!student) return;

        const cfg = _getModuleConfig();
        if (!cfg || !cfg.id) {
            console.warn('[ProgressTracker] No data-module-id found on <script> tag. Progress not saved.');
            return;
        }

        const payload = {
            student_name: student,
            module_id: cfg.id,
            module_name: cfg.name,
            module_url: cfg.url,
            progress_data: data,
            last_updated: new Date().toISOString()
        };

        // Upsert (insert or update) — relies on UNIQUE(student_name, module_id)
        await _query(
            'progress?on_conflict=student_name,module_id',
            'POST',
            payload
        );
    },

    /**
     * Loads saved progress for the active student in the current module.
     * @returns {object|null} The saved row, or null if none exists
     */
    async load() {
        const student = _getActiveStudent();
        if (!student) return null;

        const cfg = _getModuleConfig();
        if (!cfg || !cfg.id) return null;

        const rows = await _query(
            `progress?student_name=eq.${encodeURIComponent(student)}&module_id=eq.${encodeURIComponent(cfg.id)}&select=*`
        );
        return rows && rows.length > 0 ? rows[0] : null;
    },

    /**
     * Gets all saved progress rows for a named student.
     * Used by the Student Dashboard.
     */
    async getAllProgressForStudent(student) {
        if (!student) return [];
        const rows = await _query(
            `progress?student_name=eq.${encodeURIComponent(student)}&select=*&order=last_updated.desc`
        );
        return rows || [];
    }
};

// Expose globally
window.ProgressTracker = ProgressTracker;
