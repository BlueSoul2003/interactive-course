// js/auth-access.js
// ── Single Source of Truth: auth, access control, and admin PIN tools ──────────
//
// ARCHITECTURE:
//   • Every module card in index.html MUST have:  data-module-id="<canonical-id>"
//   • Canonical IDs are defined in modules_registry.sql (the Supabase `modules` table)
//   • PINs store arrays of canonical IDs → redeem_activation_pin() writes them
//     into user_profiles.unlocked_modules[] → this file reads them back
//   • The three-layer access hierarchy:
//       1. '*'          → god mode (all modules)
//       2. bundle key   → entire bundle (e.g. 'spm_form5')
//       3. module id    → single module (e.g. 'spm-bm-imbuhan-alchemy')
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_SUPABASE_URL = 'https://ycsixsyssbdovpmmhefz.supabase.co';
const AUTH_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc2l4c3lzc2Jkb3ZwbW1oZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTcyNTEsImV4cCI6MjA5MDk3MzI1MX0.5Ofa771ewzMip8mZaXA09B9O2HPF3ZGoTk3qGkdTkmE';

window.supabaseClient = window.supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY);

const AuthAccess = {

    // ── User profile ──────────────────────────────────────────────────────────
    async getCurrentUser() {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (error || !user) return null;

        const { data: profile } = await window.supabaseClient
            .from('user_profiles')
            .select('tier, tier_level, unlocked_modules')
            .eq('id', user.id)
            .single();

        return { 
            user, 
            tier:           profile?.tier            || 'free', 
            tierLevel:      profile?.tier_level      || 0,
            unlockedModules: profile?.unlocked_modules || []
        };
    },

    // ── Secure content loader (for modules stored in modules_content table) ───
    async loadModuleContent(moduleId, containerId, renderCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '<div style="text-align:center; padding:50px;">Loading secure content...</div>';

        const { data: moduleData, error } = await window.supabaseClient
            .from('modules_content')
            .select('*')
            .eq('module_id', moduleId)
            .single();

        if (error || !moduleData) {
            console.warn('[AuthAccess] loadModuleContent — access denied or not found:', error?.message);
            let depth = (window.location.pathname.match(/\//g) || []).length;
            let rootPath = '../'.repeat(Math.max(0, depth - 2)) + 'index.html';

            container.innerHTML = `
                <div style="background:#1e293b;padding:40px;border-radius:16px;text-align:center;border:1px solid rgba(255,100,100,0.3);max-width:600px;margin:40px auto;font-family:sans-serif;">
                    <div style="font-size:4rem;margin-bottom:20px;">🔒</div>
                    <h2 style="color:#f8fafc;margin-bottom:10px;font-size:1.5rem;">Premium Module Locked</h2>
                    <p style="color:#94a3b8;margin-bottom:25px;line-height:1.6;">
                        This module requires a higher access tier. Please login or upgrade your account.
                    </p>
                    <button onclick="window.location.href='${rootPath}'"
                        style="background:#3b82f6;color:white;border:none;padding:12px 24px;border-radius:30px;font-weight:bold;cursor:pointer;font-size:1rem;">
                        Back to Home / Login
                    </button>
                </div>`;
            return false;
        }

        // Do not clear the container here, as the module might have raw static HTML layouts 
        // that depend on the data returned. The callback handles the injection.
        renderCallback(moduleData.secure_data);
        return true;
    },

    // ── Auth ──────────────────────────────────────────────────────────────────
    async signIn(email, password) {
        return await window.supabaseClient.auth.signInWithPassword({ email, password });
    },

    async signUp(email, password, profileData = null) {
        const result = await window.supabaseClient.auth.signUp({ email, password });
        if (result.data?.user) {
            const profileRecord = { 
                id: result.data.user.id, 
                email,
                tier: 'member', 
                tier_level: 1 
            };
            if (profileData) {
                Object.assign(profileRecord, {
                    fullname: profileData.fullname,
                    phone:    profileData.phone,
                    syllabus: profileData.syllabus,
                    age:      profileData.age,
                    gender:   profileData.gender,
                    role:     profileData.role,
                });
                if (profileData.syllabus) {
                    profileRecord.unlocked_modules = [profileData.syllabus];
                }
            }
            await window.supabaseClient.from('user_profiles').upsert([profileRecord]);
        }
        return result;
    },

    async signOut() {
        return await window.supabaseClient.auth.signOut();
    },

    // ── PIN Redemption ────────────────────────────────────────────────────────
    // Returns: { success, newly_unlocked: string[], all_unlocked: string[] }
    async redeemPin(pinCode, targetModule = null) {
        const { data, error } = await window.supabaseClient.rpc('redeem_activation_pin', {
            p_pin_code: pinCode,
            p_target_module: targetModule
        });
        if (error) throw error;
        return data; // JSONB from the upgraded stored procedure
    },

    // ── Render lock / unlock state for every module card ─────────────────────
    async renderModuleAccessibility() {
        const authInfo = await this.getCurrentUser();
        let unlockedModules = [];
        let isGuest = true;
        let isAdmin = false;
        
        if (authInfo && authInfo.user) {
            isGuest = false;
            unlockedModules = authInfo.unlockedModules;
            isAdmin = authInfo.tier === 'admin';
        }
        
        // Only target element cards inside view-layers
        const moduleCards = document.querySelectorAll('.view-layer .card');
        const guestSyllabusTracker = new Set();
        
        moduleCards.forEach(card => {

            // ── Read canonical ID (must come from data-module-id) ─────────────
            const moduleId = card.dataset.moduleId;

            if (!moduleId) {
                // Flag missing attribute to developers — safe default: show unlocked
                console.warn(
                    '[AuthAccess] ⚠️  Card is missing data-module-id — cannot enforce PIN lock.\n' +
                    '  Fix: add data-module-id="<canonical-id>" to this card in index.html.\n', card
                );
            }

            // ── Determine syllabus & bundle ───────────────────────────────────
            const syllabusContent = card.closest('.syllabus-content');
            const syllabus = syllabusContent ? syllabusContent.id : 'unknown';
            const bundle   = card.dataset.bundle;
            
            // Mark the first module seen for this syllabus section as free
            const isFirstModule = !guestSyllabusTracker.has(syllabus);
            if (isFirstModule) {
                guestSyllabusTracker.add(syllabus);
            }

            // ── Compute access ────────────────────────────────────────────────
            let hasAccess = false;
            
            if (isAdmin) {
                hasAccess = true;

            } else if (!moduleId) {
                hasAccess = true; // can't lock what has no ID

            } else {
                hasAccess =
                    isFirstModule                         ||  // free first module
                    unlockedModules.includes('*')         ||  // god mode
                    unlockedModules.includes(moduleId)    ||  // exact canonical ID
                    unlockedModules.includes(syllabus)    ||  // whole syllabus
                    (bundle && unlockedModules.includes(bundle)); // whole bundle
            }

            // ── Apply CSS state ───────────────────────────────────────────────
            if (hasAccess) {
                card.classList.add('module-active');
                card.classList.remove('module-locked', 'card-locked');
                card.onclick = null;
            } else {
                card.classList.add('module-locked');
                card.classList.remove('module-active');
                card.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const modal = document.getElementById('pin-topup-modal');
                    if (modal) {
                        modal.setAttribute('data-target-module', moduleId || '');
                        modal.style.display = 'flex';
                    } else {
                        alert('🔒 This module is locked. Enter your activation PIN to unlock!');
                    }
                };
            }
        });

        // ── Show / hide admin panel ───────────────────────────────────────────
        const adminPanel = document.getElementById('admin-pin-generator');
        const adminBtn   = document.getElementById('admin-pin-toggle-btn');

        if (isAdmin) {
            this.renderAdminUI();
            if (adminBtn) adminBtn.style.display = 'flex';
        } else {
            if (adminPanel) adminPanel.style.display = 'none';
            if (adminBtn)   adminBtn.style.display   = 'none';
        }
    },

    // ── Admin PIN generator checklist (grouped by syllabus → bundle → module) ─
    renderAdminUI() {
        const listContainer = document.getElementById('admin-pin-modules-list');
        if (!listContainer) return;

        let html = `
            <div style="margin-bottom:10px;">
                <strong><label style="cursor:pointer;">
                    <input type="checkbox" value="*" class="admin-cb-module">
                    ✨ ALL MODULES (God Mode)
                </label></strong>
            </div>
            <hr style="border-color:#334155; margin:10px 0;">`;

        const syllabusSections = document.querySelectorAll('.syllabus-content');

        syllabusSections.forEach(section => {
            const cards = section.querySelectorAll('.view-layer .card');
            if (cards.length === 0) return;

            const titleEl = section.querySelector('.section-title');
            const sectionTitle = titleEl ? titleEl.innerText.trim() : section.id;

            // Group by bundle
            const bundleMap = {};  // bundleKey → [{moduleId, label}]
            const unbundled = [];

            cards.forEach(card => {
                const moduleId = card.dataset.moduleId;
                const bundle   = card.dataset.bundle;
                const h3       = card.querySelector('h3');
                const label    = h3 ? h3.innerText.trim() : (moduleId || '?');
                if (!moduleId) return;

                if (bundle) {
                    if (!bundleMap[bundle]) bundleMap[bundle] = [];
                    bundleMap[bundle].push({ moduleId, label });
                } else {
                    unbundled.push({ moduleId, label });
                }
            });

            html += `<div style="margin-bottom:18px;">
                <div style="color:#3b82f6;font-weight:700;font-size:0.9em;margin-bottom:6px;">
                    📂 ${sectionTitle} <span style="color:#475569;font-weight:400;">(${section.id})</span>
                </div>`;

            // Bundle-level toggle
            Object.entries(bundleMap).forEach(([bundle, modules]) => {
                const bundleLabel = bundle.replace(/_/g, ' ').toUpperCase();
                html += `
                <div style="margin:6px 0 4px 14px;">
                    <label style="cursor:pointer;color:#a5b4fc;font-size:0.83em;font-weight:700;">
                        <input type="checkbox" value="${bundle}"
                               class="admin-cb-module admin-cb-bundle-${bundle}"
                               onchange="window.AdminTools.toggleBundle('${bundle}', this.checked)">
                        🗂 Bundle: ${bundleLabel}
                    </label>
                    <div id="admin-bundle-${bundle}" style="margin-left:18px;margin-top:3px;">`;

                modules.forEach(({ moduleId, label }) => {
                    html += `
                        <div style="margin-bottom:2px;">
                            <label style="cursor:pointer;font-size:0.8em;">
                                <input type="checkbox" value="${moduleId}"
                                       class="admin-cb-module admin-cb-${bundle}">
                                <span style="color:#e2e8f0;">${label}</span>
                                <code style="color:#64748b;font-size:0.73em;margin-left:5px;">${moduleId}</code>
                            </label>
                        </div>`;
                });
                html += `</div></div>`;
            });

            // Unbundled modules
            unbundled.forEach(({ moduleId, label }) => {
                html += `
                <div style="margin:3px 0 0 14px;">
                    <label style="cursor:pointer;font-size:0.8em;">
                        <input type="checkbox" value="${moduleId}" class="admin-cb-module">
                        <span style="color:#e2e8f0;">${label}</span>
                        <code style="color:#64748b;font-size:0.73em;margin-left:5px;">${moduleId}</code>
                    </label>
                </div>`;
            });

            html += `</div>`;
        });

        listContainer.innerHTML = html;
    }
};

// ── Admin Tools (global) ──────────────────────────────────────────────────────
window.AdminTools = {

    toggleBundle(bundleId, isChecked) {
        document.querySelectorAll(`.admin-cb-${bundleId}`).forEach(cb => cb.checked = isChecked);
    },

    async createPin() {
        const authInfo = await AuthAccess.getCurrentUser();
        if (!authInfo || authInfo.tier !== 'admin') {
            alert('Unauthorized: Admin privileges required.');
            return;
        }

        const pinInput = document.getElementById('admin-pin-code');
        const pinCode  = pinInput ? pinInput.value.trim() : '';
        if (!pinCode) {
            alert('Please enter a PIN code first.');
            return;
        }

        const checked      = document.querySelectorAll('.admin-cb-module:checked');
        const modulesArray = Array.from(checked).map(cb => cb.value);

        if (modulesArray.length === 0) {
            alert('Please select at least one module or bundle to unlock.');
            return;
        }

        const { error } = await window.supabaseClient
            .from('activation_pins')
            .insert([{ pin_code: pinCode, modules_to_unlock: modulesArray, is_used: false }]);

        if (error) {
            console.error('[AdminTools] PIN creation error:', error);
            alert('❌ Failed to create PIN:\n' + error.message);
        } else {
            const lines = modulesArray.map(id => `  • ${id}`).join('\n');
            alert(`✅ PIN "${pinCode}" created successfully!\n\nThis PIN will unlock:\n${lines}`);
            if (pinInput) pinInput.value = '';
            document.querySelectorAll('.admin-cb-module').forEach(cb => cb.checked = false);
        }
    }
};

window.AuthAccess = AuthAccess;
