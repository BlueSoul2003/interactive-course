// js/auth-access.js

// Ensure Supabase JS SDK is loaded before this script.
// e.g., <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const AUTH_SUPABASE_URL = 'https://ycsixsyssbdovpmmhefz.supabase.co';
const AUTH_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc2l4c3lzc2Jkb3ZwbW1oZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTcyNTEsImV4cCI6MjA5MDk3MzI1MX0.5Ofa771ewzMip8mZaXA09B9O2HPF3ZGoTk3qGkdTkmE';

window.supabaseClient = window.supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY);

const AuthAccess = {
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
            tier: profile?.tier || 'free', 
            tierLevel: profile?.tier_level || 0,
            unlockedModules: profile?.unlocked_modules || []
        };
    },

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
            console.warn('Access Denied or module not found:', error?.message);
            // Fallback for local development or direct file access
            let depth = (window.location.pathname.match(/\//g) || []).length;
            let rootPath = '../'.repeat(Math.max(0, depth - 2)) + 'index.html'; 

            container.innerHTML = `
                <div style="background:#1e293b; padding:40px; border-radius:16px; text-align:center; border: 1px solid rgba(255,100,100,0.3); max-width: 600px; margin: 40px auto; font-family: sans-serif;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
                    <h2 style="color: #f8fafc; margin-bottom: 10px; font-size: 1.5rem;">Premium Module Locked</h2>
                    <p style="color: #94a3b8; margin-bottom: 25px; line-height: 1.6;">This module requires a higher access tier. Please login or upgrade your account to view this secure content.</p>
                    <button onclick="window.location.href='${rootPath}'" style="background:#3b82f6; color:white; border:none; padding:12px 24px; border-radius:30px; font-weight:bold; cursor:pointer; font-size: 1rem;">
                        Back to Home / Login
                    </button>
                </div>
            `;
            return false;
        }

        // Render the secured data mapping
        container.innerHTML = '';
        renderCallback(moduleData.secure_data);
        return true;
    },

    async signIn(email, password) {
        const result = await window.supabaseClient.auth.signInWithPassword({ email, password });
        return result;
    },

    async signUp(email, password) {
        const result = await window.supabaseClient.auth.signUp({ email, password });
        // Create initial profile profile row on signup
        if (result.data?.user) {
             await window.supabaseClient.from('user_profiles').upsert([{ 
                  id: result.data.user.id, 
                  email: email, 
                  tier: 'free', 
                  tier_level: 0 
             }]);
        }
        return result;
    },

    async signOut() {
        return await window.supabaseClient.auth.signOut();
    },

    async redeemPin(pinCode) {
        const { data: newModules, error } = await window.supabaseClient.rpc('redeem_activation_pin', {
            p_pin_code: pinCode
        });
        if (error) throw error;
        return newModules;
    },

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
        
        // Target specifically the lesson modules (which are <a> tags within view-layers)
        const moduleCards = document.querySelectorAll('.view-layer a.card');
        const guestSyllabusTracker = new Set();
        
        moduleCards.forEach(card => {
            let syllabus = 'unknown';
            const syllabusContent = card.closest('.syllabus-content');
            if (syllabusContent) {
                syllabus = syllabusContent.id;
            }
            
            // e.g. from "content/.../Social_Media_Masterclass/index.html", extract "Social_Media_Masterclass"
            let moduleId = card.dataset.moduleId;
            if(!moduleId) {
                const parts = card.getAttribute('href').split('/');
                moduleId = parts[parts.length - 2]; 
            }
            
            let hasAccess = false;
            
            if (isAdmin) {
                hasAccess = true;
            } else if (isGuest) {
                // Guests only have access to the first module of each syllabus
                if (!guestSyllabusTracker.has(syllabus)) {
                    guestSyllabusTracker.add(syllabus);
                    hasAccess = true;
                }
            } else {
                // Logged in users check their DB array
                hasAccess = unlockedModules.includes(moduleId) || unlockedModules.includes('*') || unlockedModules.includes(syllabus);
            }
            
            if (hasAccess) {
                card.classList.add('module-active');
                card.classList.remove('module-locked');
                card.classList.remove('card-locked'); // Handle hardcoded classes
                card.onclick = null; // restore normal navigation
            } else {
                card.classList.add('module-locked');
                card.classList.remove('module-active');
                card.onclick = (e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    const modal = document.getElementById('pin-topup-modal');
                    if(modal) {
                        modal.style.display = 'flex';
                    } else {
                        alert("🔒 This module is locked. Enter a new PIN to unlock!");
                    }
                };
            }
        });
    }
};

window.AuthAccess = AuthAccess;
