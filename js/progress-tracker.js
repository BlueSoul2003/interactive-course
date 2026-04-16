// ==============================================================
// js/progress-tracker.js  — Universal Student Progress SDK v2
// Powered by Supabase Auth (https://supabase.com)
// ==============================================================
//
// WHAT CHANGED FROM v1:
//   • Identity is now the logged-in Supabase Auth user (UUID),
//     NOT a name string stored in localStorage. Progress persists
//     across logout/re-login and across devices.
//   • Reads/writes public.student_progress via the official
//     supabase-js client (proper RLS + auth token forwarding).
//   • Adds autoSave(data, delayMs) — debounced save, safe to call
//     on every keypress for tracking typed answers.
//   • Adds init(callback) — waits for auth to be ready then fires
//     the callback with the tracker instance. Use this in modules
//     instead of window.onload + manual checks.
//   • Backward-compatible: if user is not logged in, save/load are
//     silent no-ops so the module still works as a guest.
//
// HOW TO USE IN A MODULE (copy-paste this at the bottom of <body>):
//
//   <script src="[root]/js/progress-tracker.js"
//           data-module-id="unique-canonical-id"
//           data-module-name="Human Readable Name"
//           data-module-url="content/.../index.html"></script>
//   <script>
//     ProgressTracker.init(async (tracker) => {
//       // Restore state on page load:
//       const saved = await tracker.load();
//       if (saved?.stage) goToStage(saved.stage);
//       if (saved?.answers) restoreAnswers(saved.answers);
//     });
//
//     // Call anywhere to save (e.g., on stage change):
//     ProgressTracker.save({ stage: 2, answers: {...} });
//
//     // Call on every keypress/input (debounced 2s):
//     ProgressTracker.autoSave({ stage: 2, answers: {...} });
//   </script>
//
// ==============================================================

(function () {
    'use strict';

    // ── Supabase credentials (same project as auth-access.js) ────────────────
    const SUPABASE_URL = 'https://ycsixsyssbdovpmmhefz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc2l4c3lzc2Jkb3ZwbW1oZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTcyNTEsImV4cCI6MjA5MDk3MzI1MX0.5Ofa771ewzMip8mZaXA09B9O2HPF3ZGoTk3qGkdTkmE';
    const PROGRESS_TABLE = 'student_progress';

    // ── Get or create the Supabase client ────────────────────────────────────
    // Reuse the client from auth-access.js if already loaded, otherwise
    // create our own so this file can work standalone.
    function _getClient() {
        if (window.supabaseClient) return window.supabaseClient;
        if (window.supabase && window.supabase.createClient) {
            // Self-initialize if supabase-js CDN is loaded but client wasn't created yet
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return window.supabaseClient;
        }
        return null;
    }

    // ── Read module config from the <script> tag ─────────────────────────────
    function _getModuleConfig() {
        // currentScript works during synchronous execution; fall back to data attr
        const tag = document.currentScript ||
            document.querySelector('script[data-module-id]');
        if (!tag) return null;
        return {
            id:   tag.dataset.moduleId   || null,
            name: tag.dataset.moduleName || tag.dataset.moduleId || 'Unknown Module',
            url:  tag.dataset.moduleUrl  || location.pathname
        };
    }

    // Cache the module config at parse time (currentScript only works here)
    const _moduleConfig = _getModuleConfig();

    // ── Get authenticated user ID ─────────────────────────────────────────────
    async function _getUserId() {
        const client = _getClient();
        if (!client) return null;
        try {
            const { data: { user }, error } = await client.auth.getUser();
            if (error || !user) return null;
            return user.id;
        } catch (e) {
            return null;
        }
    }

    // ── Auto-save debouncer ───────────────────────────────────────────────────
    let _autoSaveTimer = null;

    // ── Public API ────────────────────────────────────────────────────────────
    const ProgressTracker = {

        /**
         * Waits for Supabase auth to be ready, then fires callback(tracker).
         * Use this in modules instead of window.onload + manual ProgressTracker checks.
         *
         * @param {function} callback - async (tracker) => { ... }
         */
        init(callback) {
            if (typeof callback !== 'function') return;
            const client = _getClient();
            if (!client) {
                // No Supabase client available (CDN not loaded) — call callback
                // with the tracker anyway so module logic still runs without persistence.
                console.warn('[ProgressTracker] Supabase client not found. Running without persistence.');
                try { callback(this); } catch (e) { console.error('[ProgressTracker] init callback error:', e); }
                return;
            }

            // onAuthStateChange fires immediately with the current session,
            // then again on future sign-in/sign-out events.
            const { data: { subscription } } = client.auth.onAuthStateChange((_event, _session) => {
                // Only call the restore callback once (on initial load).
                // Unsubscribe so we don't re-run on subsequent sign-in/out.
                subscription.unsubscribe();
                try { callback(this); } catch (e) { console.error('[ProgressTracker] init callback error:', e); }
            });
        },

        /**
         * Saves progress for the current logged-in user in the current module.
         * Silent no-op if user is not logged in or module config is missing.
         *
         * @param {object} data - Any JSON-serialisable state to save
         * @returns {Promise<void>}
         */
        async save(data) {
            const userId = await _getUserId();
            if (!userId) return; // guest — no-op

            const cfg = _moduleConfig;
            if (!cfg || !cfg.id) {
                console.warn('[ProgressTracker] No data-module-id on <script> tag. Progress not saved.');
                return;
            }

            const client = _getClient();
            if (!client) return;

            const { error } = await client
                .from(PROGRESS_TABLE)
                .upsert({
                    user_id:       userId,
                    module_id:     cfg.id,
                    module_name:   cfg.name,
                    module_url:    cfg.url,
                    progress_data: data,
                    updated_at:    new Date().toISOString()
                }, { onConflict: 'user_id,module_id' });

            if (error) {
                console.error('[ProgressTracker] save error:', error.message);
            }
        },

        /**
         * Debounced save — safe to call on every keypress.
         * Waits `delayMs` (default 2000ms) after the last call before saving.
         *
         * @param {object} data - State to save
         * @param {number} [delayMs=2000] - Debounce delay in milliseconds
         */
        autoSave(data, delayMs = 2000) {
            if (_autoSaveTimer) clearTimeout(_autoSaveTimer);
            _autoSaveTimer = setTimeout(() => {
                this.save(data).catch(e => console.error('[ProgressTracker] autoSave error:', e));
            }, delayMs);
        },

        /**
         * Loads saved progress for the current user in the current module.
         * Returns the progress_data object, or null if none exists.
         *
         * @returns {Promise<object|null>}
         */
        async load() {
            const userId = await _getUserId();
            if (!userId) return null;

            const cfg = _moduleConfig;
            if (!cfg || !cfg.id) return null;

            const client = _getClient();
            if (!client) return null;

            const { data, error } = await client
                .from(PROGRESS_TABLE)
                .select('progress_data')
                .eq('user_id', userId)
                .eq('module_id', cfg.id)
                .maybeSingle();

            if (error) {
                console.error('[ProgressTracker] load error:', error.message);
                return null;
            }

            // Return just the inner progress_data blob (what the module cares about)
            return data?.progress_data ?? null;
        },

        /**
         * Gets all saved progress rows for the currently logged-in user.
         * Used by admin dashboards or student portfolio views.
         *
         * @returns {Promise<Array>}
         */
        async getAllProgress() {
            const userId = await _getUserId();
            if (!userId) return [];

            const client = _getClient();
            if (!client) return [];

            const { data, error } = await client
                .from(PROGRESS_TABLE)
                .select('module_id, module_name, module_url, progress_data, updated_at')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('[ProgressTracker] getAllProgress error:', error.message);
                return [];
            }

            return data || [];
        },

        // ── Legacy compatibility stubs (v1 API — no longer functional) ────────
        // These prevent errors in any code that still calls the old student-name API.

        /** @deprecated Use Supabase Auth — this is now a no-op */
        setActiveStudent(name) {
            console.warn('[ProgressTracker] setActiveStudent() is deprecated. Use Supabase Auth login instead.');
        },

        /** @deprecated Returns null — identity comes from Supabase Auth */
        getActiveStudent() {
            console.warn('[ProgressTracker] getActiveStudent() is deprecated. Identity is now from Supabase Auth.');
            return null;
        },

        /** @deprecated */
        clearActiveStudent() {
            console.warn('[ProgressTracker] clearActiveStudent() is deprecated. Use supabaseClient.auth.signOut() instead.');
        },

        /** @deprecated Use getAllProgress() */
        async getAllProgressForStudent(_name) {
            console.warn('[ProgressTracker] getAllProgressForStudent() is deprecated. Use getAllProgress() instead.');
            return this.getAllProgress();
        }
    };

    // Expose globally
    window.ProgressTracker = ProgressTracker;

})();
