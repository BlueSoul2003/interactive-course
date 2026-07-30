(function () {
    "use strict";

    const SUPABASE_URL = "https://ycsixsyssbdovpmmhefz.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc2l4c3lzc2Jkb3ZwbW1oZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTcyNTEsImV4cCI6MjA5MDk3MzI1MX0.5Ofa771ewzMip8mZaXA09B9O2HPF3ZGoTk3qGkdTkmE";
    const STUDENT_STORAGE_KEY = "ic-addmaths-student-auth";
    const ATTEMPT_STORAGE_KEY = "ic-addmaths-live-attempt";

    let studentClient = null;

    function getStudentClient() {
        if (!studentClient) {
            if (!window.supabase || !window.supabase.createClient) {
                throw new Error("The quiz service could not be loaded.");
            }
            studentClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: {
                    storageKey: STUDENT_STORAGE_KEY,
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: false
                }
            });
        }
        return studentClient;
    }

    async function ensureStudentAuth() {
        const client = getStudentClient();
        const { data: sessionData } = await client.auth.getSession();
        if (sessionData && sessionData.session && sessionData.session.user) {
            return sessionData.session.user;
        }

        const { data, error } = await client.auth.signInAnonymously();
        if (error) {
            const hint = /anonymous|disabled/i.test(error.message || "")
                ? " Anonymous sign-ins must be enabled in Supabase Auth settings."
                : "";
            throw new Error((error.message || "Unable to create a student session.") + hint);
        }
        return data.user;
    }

    async function studentRpc(name, params) {
        const client = getStudentClient();
        const { data, error } = await client.rpc(name, params || {});
        if (error) {
            throw new Error(error.message || "The quiz service returned an error.");
        }
        return data;
    }

    async function getStaffAccess() {
        if (!window.AuthAccess || !window.supabaseClient) {
            return null;
        }
        const authInfo = await window.AuthAccess.getCurrentUser();
        if (!authInfo || !authInfo.user) {
            return null;
        }
        const { data, error } = await window.supabaseClient
            .from("quiz_staff")
            .select("role")
            .eq("user_id", authInfo.user.id)
            .maybeSingle();
        if (error) {
            return { authInfo: authInfo, staff: null, setupError: error.message };
        }
        return { authInfo: authInfo, staff: data };
    }

    function seededRandom(seed) {
        let value = 2166136261;
        for (let i = 0; i < seed.length; i += 1) {
            value ^= seed.charCodeAt(i);
            value = Math.imul(value, 16777619);
        }
        return function () {
            value += 0x6d2b79f5;
            let result = value;
            result = Math.imul(result ^ (result >>> 15), result | 1);
            result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
            return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
        };
    }

    function shuffled(values, seed) {
        const result = values.slice();
        const random = seededRandom(seed);
        for (let i = result.length - 1; i > 0; i -= 1) {
            const target = Math.floor(random() * (i + 1));
            const temp = result[i];
            result[i] = result[target];
            result[target] = temp;
        }
        return result;
    }

    function optionOrder(question, participantId, shouldShuffle) {
        const order = question.options.map(function (_, index) { return index; });
        return shouldShuffle ? shuffled(order, participantId + ":option:" + question.id) : order;
    }

    function generateSessionCode() {
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const bytes = new Uint8Array(6);
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes, function (value) {
            return alphabet[value % alphabet.length];
        }).join("");
    }

    function getJoinUrl(code) {
        const url = new URL("index.html", window.location.href);
        url.searchParams.set("session", String(code || "").toUpperCase());
        return url.toString();
    }

    function formatDateTime(value) {
        if (!value) return "-";
        return new Intl.DateTimeFormat("en-MY", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(value));
    }

    function formatCountdown(milliseconds) {
        if (!Number.isFinite(milliseconds)) return "--:--";
        const total = Math.max(0, Math.ceil(milliseconds / 1000));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        const parts = [minutes, seconds].map(function (value) {
            return String(value).padStart(2, "0");
        });
        return hours > 0 ? String(hours) + ":" + parts.join(":") : parts.join(":");
    }

    function escapeCsv(value) {
        const text = value === null || value === undefined ? "" : String(value);
        return '"' + text.replace(/"/g, '""') + '"';
    }

    function downloadCsv(filename, rows) {
        const csv = rows.map(function (row) {
            return row.map(escapeCsv).join(",");
        }).join("\r\n");
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
    }

    function debounce(callback, wait) {
        let timer = null;
        return function () {
            const args = arguments;
            window.clearTimeout(timer);
            timer = window.setTimeout(function () {
                callback.apply(null, args);
            }, wait);
        };
    }

    window.AddMathsQuiz = {
        SUPABASE_URL: SUPABASE_URL,
        SUPABASE_KEY: SUPABASE_KEY,
        ATTEMPT_STORAGE_KEY: ATTEMPT_STORAGE_KEY,
        getStudentClient: getStudentClient,
        ensureStudentAuth: ensureStudentAuth,
        studentRpc: studentRpc,
        getStaffAccess: getStaffAccess,
        shuffled: shuffled,
        optionOrder: optionOrder,
        generateSessionCode: generateSessionCode,
        getJoinUrl: getJoinUrl,
        formatDateTime: formatDateTime,
        formatCountdown: formatCountdown,
        downloadCsv: downloadCsv,
        debounce: debounce
    };
})();
