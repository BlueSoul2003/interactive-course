// js/feedback.js
// ── Universal Feedback & Subject-Request SDK ──────────────────────────────
// Powered by Supabase (https://supabase.com)
// ─────────────────────────────────────────────────────────────────────────────

(function () {
    'use strict';

    const SUPABASE_URL = 'https://ycsixsyssbdovpmmhefz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc2l4c3lzc2Jkb3ZwbW1oZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTcyNTEsImV4cCI6MjA5MDk3MzI1MX0.5Ofa771ewzMip8mZaXA09B9O2HPF3ZGoTk3qGkdTkmE';
    const FEEDBACK_TABLE = 'user_feedback';

    // ── Get or create Supabase client ────────────────────────────────────────
    function _getClient() {
        if (window.supabaseClient) return window.supabaseClient;
        if (window.supabase && window.supabase.createClient) {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return window.supabaseClient;
        }
        return null;
    }

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

    const FeedbackSystem = {
        /**
         * Submit feedback or subject request to Supabase.
         * @param {object} param0 - Feedback details
         * @param {string} param0.feedback_type - 'bug_report' | 'subject_request' | 'general'
         * @param {string} [param0.fullname] - Name of submitter
         * @param {string} [param0.email] - Email address for correspondence
         * @param {string} [param0.syllabus] - Syllabus code (e.g. 'spm', 'uec')
         * @param {string} [param0.subject] - Name of subject (e.g. 'Physics')
         * @param {string} param0.details - Description / feedback text
         * @returns {Promise<{success: boolean, error?: string}>}
         */
        async submitFeedback({ feedback_type, fullname, email, syllabus, subject, details }) {
            const client = _getClient();
            if (!client) {
                return { success: false, error: 'Supabase client is not initialized.' };
            }

            if (!feedback_type || !details) {
                return { success: false, error: 'Feedback type and description are required.' };
            }

            const userId = await _getUserId();

            const payload = {
                user_id: userId || null,
                fullname: fullname || null,
                email: email || null,
                feedback_type,
                syllabus: syllabus || null,
                subject: subject || null,
                details,
                status: 'pending'
            };

            const { data, error } = await client
                .from(FEEDBACK_TABLE)
                .insert([payload]);

            if (error) {
                console.error('[FeedbackSystem] Submit error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true };
        },

        /**
         * Fetch all feedback submissions. Only works for users with admin tier.
         * @returns {Promise<Array>}
         */
        async getAllFeedback() {
            const client = _getClient();
            if (!client) return [];

            const { data, error } = await client
                .from(FEEDBACK_TABLE)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[FeedbackSystem] Fetch error:', error.message);
                return [];
            }

            return data || [];
        },

        /**
         * Update the status of a feedback entry. Only works for admins.
         * @param {string} feedbackId - UUID of the feedback row
         * @param {string} newStatus - 'pending' | 'reviewed' | 'resolved'
         * @returns {Promise<{success: boolean, error?: string}>}
         */
        async updateFeedbackStatus(feedbackId, newStatus) {
            const client = _getClient();
            if (!client) {
                return { success: false, error: 'Supabase client not initialized.' };
            }

            const { error } = await client
                .from(FEEDBACK_TABLE)
                .update({ status: newStatus })
                .eq('id', feedbackId);

            if (error) {
                console.error('[FeedbackSystem] Update status error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true };
        },

        /**
         * Delete a feedback entry. Only works for admins.
         * @param {string} feedbackId - UUID of the feedback row
         * @returns {Promise<{success: boolean, error?: string}>}
         */
        async deleteFeedback(feedbackId) {
            const client = _getClient();
            if (!client) {
                return { success: false, error: 'Supabase client not initialized.' };
            }

            const { error } = await client
                .from(FEEDBACK_TABLE)
                .delete()
                .eq('id', feedbackId);

            if (error) {
                console.error('[FeedbackSystem] Delete error:', error.message);
                return { success: false, error: error.message };
            }

            return { success: true };
        }
    };

    window.FeedbackSystem = FeedbackSystem;

})();
