(function () {
    "use strict";

    const Quiz = window.AddMathsQuiz;
    const views = ["entry", "lobby", "quiz", "submitted", "results"];
    const translations = {
        en: {
            kicker: "SPM Form 4 · Additional Mathematics",
            entryTitle: "Join your live quiz",
            entrySubtitle: "Enter the session code from your teacher. No student account is required.",
            studentName: "Student name",
            studentRef: "Student ID (optional)",
            sessionCode: "Session code",
            join: "Join session",
            waitingRoom: "Waiting room",
            waitingTitle: "You are checked in",
            session: "Session",
            questions: "Questions",
            waitingTeacher: "Waiting for your teacher to begin...",
            leaveSession: "Leave session",
            progress: "Progress",
            saved: "Saved",
            saving: "Saving...",
            previous: "Previous",
            next: "Next",
            submit: "Submit",
            submitted: "Submitted",
            submittedTitle: "Your answers are locked in",
            submittedWait: "Your teacher will release the answers when the session ends.",
            submittedReleased: "Your result is ready.",
            checkResults: "Check results",
            results: "Results",
            finish: "Finish",
            confirmSubmit: "Submit your answers?",
            cancel: "Cancel",
            unanswered: "{count} question(s) are still unanswered. You cannot edit after submitting.",
            allAnswered: "You cannot edit your answers after submitting.",
            question: "Question",
            chapter: "Chapter",
            correct: "Correct",
            review: "Needs review",
            yourAnswer: "Your answer",
            correctAnswer: "Correct answer",
            notAnswered: "Not answered",
            sessionEnded: "This session has ended.",
            connectionError: "Unable to reach the live quiz. Check your connection and try again."
        },
        zh: {
            kicker: "SPM 中四 · 附加数学",
            entryTitle: "加入实时测验",
            entrySubtitle: "输入老师提供的课堂代码，无需注册学生账户。",
            studentName: "学生姓名",
            studentRef: "学生编号（选填）",
            sessionCode: "课堂代码",
            join: "加入课堂",
            waitingRoom: "等候室",
            waitingTitle: "你已成功报到",
            session: "课堂",
            questions: "题目",
            waitingTeacher: "等待老师开始测验...",
            leaveSession: "离开课堂",
            progress: "进度",
            saved: "已保存",
            saving: "保存中...",
            previous: "上一题",
            next: "下一题",
            submit: "交卷",
            submitted: "已交卷",
            submittedTitle: "答案已经锁定",
            submittedWait: "老师将在课堂结束后公布答案。",
            submittedReleased: "测验结果已经公布。",
            checkResults: "查看结果",
            results: "测验结果",
            finish: "完成",
            confirmSubmit: "确认交卷？",
            cancel: "取消",
            unanswered: "还有 {count} 题未作答，交卷后不能修改。",
            allAnswered: "交卷后不能再修改答案。",
            question: "题目",
            chapter: "章节",
            correct: "答对",
            review: "需要复习",
            yourAnswer: "你的答案",
            correctAnswer: "正确答案",
            notAnswered: "未作答",
            sessionEnded: "这个课堂已经结束。",
            connectionError: "无法连接实时测验，请检查网络后重试。"
        }
    };

    const state = {
        language: window.localStorage.getItem("ic-addmaths-language") || "en",
        participant: null,
        session: null,
        questions: [],
        answers: {},
        review: [],
        currentIndex: 0,
        pollTimer: null,
        countdownTimer: null,
        submitting: false
    };

    function element(id) {
        return document.getElementById(id);
    }

    function text(key, replacements) {
        let value = (translations[state.language] || translations.en)[key] || key;
        Object.keys(replacements || {}).forEach(function (name) {
            value = value.replace("{" + name + "}", replacements[name]);
        });
        return value;
    }

    function applyLanguage(language) {
        state.language = language;
        window.localStorage.setItem("ic-addmaths-language", language);
        document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
        document.querySelectorAll("[data-language]").forEach(function (button) {
            button.classList.toggle("active", button.dataset.language === language);
        });
        document.querySelectorAll("[data-i18n]").forEach(function (node) {
            node.textContent = text(node.dataset.i18n);
        });
        if (state.questions.length && !element("quiz-view").hidden) renderQuestion();
        if (state.review.length && !element("results-view").hidden) renderResults();
    }

    function showView(name) {
        views.forEach(function (view) {
            element(view + "-view").hidden = view !== name;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showError(target, message) {
        const node = element(target);
        node.textContent = message;
        node.hidden = !message;
    }

    function saveAttemptReference() {
        if (!state.participant || !state.session) return;
        window.localStorage.setItem(Quiz.ATTEMPT_STORAGE_KEY, JSON.stringify({
            participantId: state.participant.id,
            sessionId: state.session.id
        }));
    }

    function clearAttemptReference() {
        window.localStorage.removeItem(Quiz.ATTEMPT_STORAGE_KEY);
    }

    function stopTimers() {
        window.clearInterval(state.pollTimer);
        window.clearInterval(state.countdownTimer);
        state.pollTimer = null;
        state.countdownTimer = null;
    }

    function normalizePayload(payload) {
        state.participant = payload.participant;
        state.session = payload.session;
        state.questions = payload.questions || [];
        state.answers = state.participant.answers || {};
        state.review = payload.review || [];
        state.currentIndex = Math.min(
            Math.max(Number(state.participant.current_index || 0), 0),
            Math.max(state.questions.length - 1, 0)
        );
        saveAttemptReference();
        return payload;
    }

    async function loadState() {
        if (!state.participant) return null;
        const payload = await Quiz.studentRpc("get_addmaths_student_state", {
            p_participant_id: state.participant.id
        });
        return normalizePayload(payload);
    }

    function routePayload(payload) {
        if (payload.result_released && state.participant.status === "submitted") {
            renderResults();
            showView("results");
            stopTimers();
            return;
        }

        if (state.participant.status === "submitted") {
            renderSubmitted();
            showView("submitted");
            startPolling();
            return;
        }

        if (state.session.status === "lobby") {
            renderLobby();
            showView("lobby");
            startPolling();
            return;
        }

        if (state.session.status === "live") {
            renderQuiz();
            showView("quiz");
            startCountdown();
            return;
        }

        renderSubmitted();
        showView("submitted");
        startPolling();
    }

    function startPolling() {
        window.clearInterval(state.pollTimer);
        state.pollTimer = window.setInterval(async function () {
            try {
                const payload = await loadState();
                routePayload(payload);
            } catch (error) {
                console.warn("[AddMathsQuiz] Poll failed:", error);
            }
        }, 3000);
    }

    function renderLobby() {
        element("lobby-student").textContent = state.participant.display_name;
        element("lobby-code").textContent = state.session.code;
        element("lobby-question-count").textContent = state.session.question_count;
    }

    function answeredCount() {
        return state.questions.filter(function (question) {
            return state.answers[String(question.id)] !== undefined;
        }).length;
    }

    function renderQuiz() {
        if (!state.questions.length) return;
        element("quiz-session-label").textContent = text("session") + " " + state.session.code;
        element("quiz-student-label").textContent = state.participant.display_name;
        renderNavigation();
        renderQuestion();
        updateProgress();
    }

    function renderNavigation() {
        const nav = element("question-nav");
        nav.innerHTML = "";
        state.questions.forEach(function (question, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = index + 1;
            button.classList.toggle("current", index === state.currentIndex);
            button.classList.toggle("answered", state.answers[String(question.id)] !== undefined);
            button.setAttribute("aria-label", text("question") + " " + (index + 1));
            button.addEventListener("click", function () {
                state.currentIndex = index;
                renderQuiz();
            });
            nav.appendChild(button);
        });
    }

    function renderQuestion() {
        const question = state.questions[state.currentIndex];
        if (!question) return;
        const selected = state.answers[String(question.id)];
        const displayedOptions = Quiz.optionOrder(
            question,
            state.participant.id,
            state.session.shuffle_options
        );

        element("question-number").textContent =
            text("question") + " " + (state.currentIndex + 1) + " / " + state.questions.length;
        element("question-chapter").textContent =
            text("chapter") + " " + question.chapter + " · " + question.chapter_name;
        element("question-topic").textContent = question.topic + " · " + question.difficulty;
        element("question-prompt").textContent = question.prompt;
        element("previous-button").disabled = state.currentIndex === 0;
        element("next-button").hidden = state.currentIndex === state.questions.length - 1;
        element("submit-button").hidden = state.currentIndex !== state.questions.length - 1;

        const options = element("question-options");
        options.innerHTML = "";
        displayedOptions.forEach(function (canonicalIndex, displayIndex) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "option-button" + (selected === canonicalIndex ? " selected" : "");
            button.setAttribute("role", "radio");
            button.setAttribute("aria-checked", selected === canonicalIndex ? "true" : "false");
            button.innerHTML =
                '<span class="option-letter">' + String.fromCharCode(65 + displayIndex) + "</span>" +
                '<span class="option-text"></span>';
            button.querySelector(".option-text").textContent = question.options[canonicalIndex];
            button.addEventListener("click", function () {
                chooseAnswer(question.id, canonicalIndex);
            });
            options.appendChild(button);
        });
    }

    function updateProgress() {
        const count = answeredCount();
        const total = state.questions.length;
        element("progress-count").textContent = count + " / " + total;
        element("progress-fill").style.width = (total ? (count / total) * 100 : 0) + "%";
    }

    async function chooseAnswer(questionId, choice) {
        if (state.submitting) return;
        const previous = state.answers[String(questionId)];
        state.answers[String(questionId)] = choice;
        state.participant.answers = state.answers;
        renderQuiz();
        element("save-status").textContent = text("saving");
        element("save-status").classList.add("saving");
        showError("quiz-error", "");
        try {
            const payload = await Quiz.studentRpc("save_addmaths_answer", {
                p_participant_id: state.participant.id,
                p_question_id: questionId,
                p_choice: choice,
                p_current_index: state.currentIndex
            });
            normalizePayload(payload);
        } catch (error) {
            if (previous === undefined) delete state.answers[String(questionId)];
            else state.answers[String(questionId)] = previous;
            showError("quiz-error", error.message || text("connectionError"));
            renderQuiz();
        } finally {
            element("save-status").textContent = text("saved");
            element("save-status").classList.remove("saving");
        }
    }

    function startCountdown() {
        window.clearInterval(state.countdownTimer);
        if (!state.session.ends_at) {
            element("timer-box").hidden = true;
            return;
        }
        element("timer-box").hidden = false;
        const tick = async function () {
            const remaining = new Date(state.session.ends_at).getTime() - Date.now();
            element("timer-value").textContent = Quiz.formatCountdown(remaining);
            element("timer-box").classList.toggle("danger", remaining <= 5 * 60 * 1000);
            if (remaining <= 0 && !state.submitting) {
                window.clearInterval(state.countdownTimer);
                await submitAttempt(true);
            }
        };
        tick();
        state.countdownTimer = window.setInterval(tick, 1000);
    }

    function openSubmitDialog() {
        const missing = state.questions.length - answeredCount();
        element("confirm-message").textContent = missing
            ? text("unanswered", { count: missing })
            : text("allAnswered");
        element("confirm-dialog").hidden = false;
    }

    async function submitAttempt(automatic) {
        if (state.submitting) return;
        state.submitting = true;
        element("confirm-dialog").hidden = true;
        element("submit-button").disabled = true;
        showError("quiz-error", "");
        try {
            const payload = await Quiz.studentRpc("submit_addmaths_attempt", {
                p_participant_id: state.participant.id
            });
            normalizePayload(payload);
            routePayload(payload);
        } catch (error) {
            if (!automatic) showError("quiz-error", error.message || text("connectionError"));
        } finally {
            state.submitting = false;
            element("submit-button").disabled = false;
        }
    }

    function renderSubmitted() {
        const released = state.session.status === "ended" || state.session.result_release === "on_submit";
        element("submitted-message").textContent = released
            ? text("submittedReleased")
            : text("submittedWait");
        const score = element("submission-score");
        if (released && Number.isFinite(Number(state.participant.score))) {
            score.hidden = false;
            element("submission-score-value").textContent = state.participant.score;
            element("submission-score-total").textContent = "/ " + state.session.question_count;
        } else {
            score.hidden = true;
        }
    }

    function renderResults() {
        const reviewMap = new Map((state.review || []).map(function (item) {
            return [Number(item.id), item];
        }));
        element("results-heading").textContent = state.participant.display_name;
        element("results-subtitle").textContent =
            text("session") + " " + state.session.code + " · " + Quiz.formatDateTime(state.participant.submitted_at);
        element("results-score").textContent = state.participant.score;
        element("results-total").textContent = "/ " + state.session.question_count;

        const list = element("review-list");
        list.innerHTML = "";
        state.questions.forEach(function (question, index) {
            const review = reviewMap.get(Number(question.id));
            if (!review) return;
            const selected = state.answers[String(question.id)];
            const correct = selected === review.correct_option;
            const card = document.createElement("article");
            card.className = "review-card " + (correct ? "correct" : "incorrect");

            const number = document.createElement("div");
            number.className = "review-number";
            number.textContent = index + 1;

            const body = document.createElement("div");
            const heading = document.createElement("div");
            heading.className = "review-status";
            heading.innerHTML = "<strong></strong><span></span>";
            heading.querySelector("strong").textContent = correct ? text("correct") : text("review");
            heading.querySelector("span").textContent = text("chapter") + " " + question.chapter;

            const title = document.createElement("h2");
            title.textContent = question.prompt;
            const yourAnswer = document.createElement("p");
            yourAnswer.className = "answer-line";
            yourAnswer.textContent = text("yourAnswer") + ": " +
                (selected === undefined ? text("notAnswered") : question.options[selected]);
            const correctAnswer = document.createElement("p");
            correctAnswer.className = "answer-line";
            correctAnswer.textContent = text("correctAnswer") + ": " + question.options[review.correct_option];
            const explanation = document.createElement("p");
            explanation.className = "explanation";
            explanation.textContent = review.explanation;

            body.append(heading, title, yourAnswer, correctAnswer, explanation);
            card.append(number, body);
            list.appendChild(card);
        });
        if (window.lucide) window.lucide.createIcons();
    }

    async function joinSession(event) {
        event.preventDefault();
        showError("entry-error", "");
        const button = element("join-button");
        button.disabled = true;
        try {
            await Quiz.ensureStudentAuth();
            const payload = await Quiz.studentRpc("join_addmaths_session", {
                p_code: element("session-code").value.trim().toUpperCase(),
                p_display_name: element("student-name").value.trim(),
                p_student_ref: element("student-ref").value.trim() || null
            });
            normalizePayload(payload);
            routePayload(payload);
        } catch (error) {
            showError("entry-error", error.message || text("connectionError"));
        } finally {
            button.disabled = false;
        }
    }

    async function restoreAttempt() {
        const raw = window.localStorage.getItem(Quiz.ATTEMPT_STORAGE_KEY);
        if (!raw) return false;
        try {
            const saved = JSON.parse(raw);
            await Quiz.ensureStudentAuth();
            state.participant = { id: saved.participantId };
            const payload = await loadState();
            routePayload(payload);
            return true;
        } catch (error) {
            clearAttemptReference();
            return false;
        }
    }

    function resetStudent() {
        stopTimers();
        clearAttemptReference();
        state.participant = null;
        state.session = null;
        state.questions = [];
        state.answers = {};
        state.review = [];
        showView("entry");
    }

    function bindEvents() {
        element("join-form").addEventListener("submit", joinSession);
        element("previous-button").addEventListener("click", function () {
            state.currentIndex = Math.max(0, state.currentIndex - 1);
            renderQuiz();
        });
        element("next-button").addEventListener("click", function () {
            state.currentIndex = Math.min(state.questions.length - 1, state.currentIndex + 1);
            renderQuiz();
        });
        element("submit-button").addEventListener("click", openSubmitDialog);
        element("cancel-submit-button").addEventListener("click", function () {
            element("confirm-dialog").hidden = true;
        });
        element("confirm-submit-button").addEventListener("click", function () {
            submitAttempt(false);
        });
        element("leave-lobby-button").addEventListener("click", resetStudent);
        element("finish-button").addEventListener("click", resetStudent);
        element("check-results-button").addEventListener("click", async function () {
            try {
                const payload = await loadState();
                routePayload(payload);
            } catch (error) {
                element("submitted-message").textContent = error.message || text("connectionError");
            }
        });
        document.querySelectorAll("[data-language]").forEach(function (button) {
            button.addEventListener("click", function () {
                applyLanguage(button.dataset.language);
            });
        });
    }

    async function init() {
        bindEvents();
        applyLanguage(state.language);
        const code = new URL(window.location.href).searchParams.get("session");
        if (code) element("session-code").value = code.toUpperCase();
        if (window.lucide) window.lucide.createIcons();
        await restoreAttempt();
    }

    window.addEventListener("DOMContentLoaded", init);
})();
