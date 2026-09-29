/* Bual is a separate application, not a protected HTML module. All signed-in
 * portal students may enter; its backend verifies identity and owns its data. */
(function () {
    'use strict';
    const BUAL = 'https://bual-spm.vercel.app';
    const params = new URLSearchParams(location.search);
    if (params.get('bual') !== 'login') return;
    const state = params.get('bual_state');
    const challenge = params.get('bual_challenge');
    const valid = value => /^[A-Za-z0-9_-]{43}$/.test(value || '');
    // Remove temporary parameters before ordinary portal navigation or sharing.
    const clean = new URL(location.href);
    ['bual', 'bual_state', 'bual_challenge'].forEach(key => clean.searchParams.delete(key));
    history.replaceState({}, '', clean.href);

    window.addEventListener('DOMContentLoaded', () => {
        const panel = document.createElement('section');
        panel.setAttribute('aria-label', 'Sambungan Bual');
        panel.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:900;max-width:520px;margin:auto;padding:20px;border:1px solid #e6b8c6;border-radius:20px;background:#fff8f2;color:#382e32;box-shadow:0 8px 32px #0003;font:15px/1.5 system-ui;';
        const title = document.createElement('h2');
        title.textContent = 'Bual · Bertutur & Mendengar';
        title.style.cssText = 'font-size:20px;margin:0 0 8px;';
        const status = document.createElement('p');
        status.setAttribute('role', 'status');
        const action = document.createElement('button');
        action.type = 'button'; action.textContent = 'Log masuk / Daftar';
        action.style.cssText = 'background:#b84c70;color:white;border:0;border-radius:12px;padding:10px 16px;margin:12px 8px 0 0;cursor:pointer;';
        const cancel = document.createElement('button');
        cancel.type = 'button'; cancel.textContent = 'Batal';
        cancel.style.cssText = 'background:none;border:0;text-decoration:underline;cursor:pointer;color:#382e32;';
        panel.append(title, status, action, cancel);
        document.body.append(panel);
        let pending = false, cancelled = false, signedIn = false;
        const unsubscribe = window.supabaseClient?.auth.onAuthStateChange(event => {
            // Supabase callbacks must return synchronously; do not await auth here.
            if (event === 'SIGNED_IN') setTimeout(() => void continueToBual(), 0);
        }).data.subscription;
        cancel.onclick = () => { cancelled = true; unsubscribe?.unsubscribe(); panel.remove(); };
        action.onclick = async () => {
            if (!valid(state) || !valid(challenge)) { location.assign(`${BUAL}/?course=1`); return; }
            if (signedIn) { void continueToBual(); return; }
            if (typeof window.openStudentModal === 'function') {
                window.toggleAuthMode('login'); await window.openStudentModal();
            }
        };
        async function continueToBual() {
            if (pending || cancelled) return;
            if (!valid(state) || !valid(challenge)) {
                status.textContent = 'Pautan tidak sah. Mulakan log masuk semula dari Bual.';
                action.textContent = 'Buka Bual'; return;
            }
            pending = true; action.disabled = true;
            status.textContent = 'Menyemak akaun untuk Bual…';
            try {
                if (!window.supabaseClient) throw new Error('Sambungan akaun tidak tersedia. Muat semula halaman.');
                const { data, error } = await window.supabaseClient.auth.getSession();
                if (error) throw new Error('Sesi tidak tersedia. Sila log masuk semula.');
                signedIn = !!data.session?.access_token;
                if (!signedIn) {
                    status.textContent = 'Log masuk atau daftar di interactive-course untuk meneruskan ke Bual. Percuma untuk semua pelajar.';
                    action.textContent = 'Log masuk / Daftar'; return;
                }
                const response = await fetch(`${BUAL}/api/course/authorize`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
                    body: JSON.stringify({ challenge }), signal: AbortSignal.timeout(15000), credentials: 'omit',
                });
                const result = await response.json();
                if (!response.ok) {
                    if (response.status === 401) signedIn = false;
                    throw new Error(result.error || 'Bual belum dapat disambungkan. Cuba lagi.');
                }
                if (!valid(result.code)) throw new Error('Jawapan sambungan tidak sah.');
                if (cancelled) return;
                // Fixed destination, no open redirect and no long-lived token in URL.
                location.replace(`${BUAL}/#${new URLSearchParams({ bual_code: result.code, bual_state: state })}`);
            } catch (error) {
                status.textContent = error.message || 'Sambungan gagal. Cuba lagi.';
                action.textContent = signedIn ? 'Cuba sambung semula' : 'Log masuk semula';
            } finally { pending = false; action.disabled = false; }
        }
        void continueToBual();
    });
})();
