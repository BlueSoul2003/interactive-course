(function () {
    "use strict";

    const Quiz = window.AddMathsQuiz;
    const translations = {
        en: {
            teacherAccess: "Teacher access",
            loginTitle: "Open your session console",
            loginSubtitle: "Use your existing Interactive Course Teacher or Admin account.",
            email: "Email",
            password: "Password",
            signIn: "Sign in",
            backPortal: "Back to course portal",
            accessRequired: "Staff activation required",
            deniedTitle: "This account cannot manage sessions yet",
            deniedMessage: "Ask an Admin to add this account to the quiz staff registry.",
            useAnother: "Use another account",
            newSession: "New session",
            sessions: "Sessions",
            emptyTitle: "Choose a session or create a new one",
            emptySubtitle: "Your live classes, student progress and results will appear here.",
            sessionBuilder: "Session builder",
            createTitle: "Prepare a live quiz",
            cancel: "Cancel",
            sessionTitle: "Session title",
            classLabel: "Class label (optional)",
            chooseChapters: "Choose chapters",
            questionCount: "Question count",
            duration: "Time limit",
            resultRelease: "Release answers",
            shuffleQuestions: "Shuffle question order",
            shuffleOptions: "Shuffle answer options",
            allowLate: "Allow students to join after start",
            createWaitingRoom: "Create waiting room",
            questionPreview: "Question preview",
            studentJoinCode: "Student join code",
            joined: "Joined",
            inProgress: "In progress",
            submittedCount: "Submitted",
            classAverage: "Class average",
            timeRemaining: "Time remaining",
            studentMonitor: "Student monitor",
            questionAnalysis: "Question analysis",
            projectorMode: "Hide answers",
            student: "Student",
            status: "Status",
            progress: "Progress",
            liveScore: "Live score",
            lastActive: "Last active",
            waitingStudents: "Waiting for students",
            shareCodeHint: "Share the code or QR to begin.",
            answerSheet: "Live answer sheet",
            reopenAttempt: "Reopen attempt",
            scanToJoin: "Scan to join",
            waiting: "Waiting",
            live: "Live",
            ended: "Ended",
            start: "Start",
            end: "End",
            reopen: "Reopen class",
            extend: "+5 min",
            delete: "Delete",
            lateJoinOn: "Late join on",
            lateJoinOff: "Late join off",
            submitted: "Submitted",
            working: "Working",
            notStarted: "Waiting",
            notAnswered: "Not answered",
            correct: "Correct",
            correctAnswer: "Correct answer",
            noLimit: "No limit",
            copySuccess: "Student link copied.",
            deleteConfirm: "Delete this session and all student responses? This cannot be undone.",
            reopenConfirm: "Reopen this student's submitted attempt?",
            setupMissing: "The live quiz database has not been installed yet.",
            noSessions: "No sessions yet",
            noData: "No answers yet",
            chapter: "Chapter",
            accuracy: "accuracy",
            mostCommonWrong: "Most common wrong answer",
            questionsAnswered: "answered",
            sessionCreated: "Waiting room created."
        },
        zh: {
            teacherAccess: "教师入口",
            loginTitle: "打开课堂控制台",
            loginSubtitle: "使用现有的 Interactive Course 教师或管理员账户。",
            email: "电子邮箱",
            password: "密码",
            signIn: "登录",
            backPortal: "返回课程主页",
            accessRequired: "需要开通教师权限",
            deniedTitle: "这个账户暂时不能管理课堂",
            deniedMessage: "请管理员把此账户加入测验教师名单。",
            useAnother: "使用其他账户",
            newSession: "新建课堂",
            sessions: "课堂记录",
            emptyTitle: "选择已有课堂或建立新课堂",
            emptySubtitle: "实时进度、学生答案和成绩会显示在这里。",
            sessionBuilder: "课堂设置",
            createTitle: "准备实时测验",
            cancel: "取消",
            sessionTitle: "课堂名称",
            classLabel: "班级标签（选填）",
            chooseChapters: "选择章节",
            questionCount: "题目数量",
            duration: "作答时间",
            resultRelease: "公布答案",
            shuffleQuestions: "随机题目顺序",
            shuffleOptions: "随机选项顺序",
            allowLate: "开始后允许迟到学生加入",
            createWaitingRoom: "建立等候室",
            questionPreview: "题目预览",
            studentJoinCode: "学生课堂代码",
            joined: "已加入",
            inProgress: "作答中",
            submittedCount: "已交卷",
            classAverage: "全班平均",
            timeRemaining: "剩余时间",
            studentMonitor: "学生监控",
            questionAnalysis: "题目分析",
            projectorMode: "隐藏答案",
            student: "学生",
            status: "状态",
            progress: "进度",
            liveScore: "即时分数",
            lastActive: "最后活动",
            waitingStudents: "等待学生加入",
            shareCodeHint: "分享课堂代码或 QR Code。",
            answerSheet: "实时答题卡",
            reopenAttempt: "重新开放作答",
            scanToJoin: "扫码加入",
            waiting: "等候中",
            live: "进行中",
            ended: "已结束",
            start: "开始",
            end: "结束",
            reopen: "重新开放课堂",
            extend: "延长 5 分钟",
            delete: "删除",
            lateJoinOn: "允许迟到加入",
            lateJoinOff: "禁止迟到加入",
            submitted: "已交卷",
            working: "作答中",
            notStarted: "等候中",
            notAnswered: "未作答",
            correct: "正确",
            correctAnswer: "正确答案",
            noLimit: "不限时",
            copySuccess: "学生链接已复制。",
            deleteConfirm: "确定删除这个课堂及全部学生答案？删除后无法恢复。",
            reopenConfirm: "确定重新开放这位学生的作答？",
            setupMissing: "实时测验数据库尚未安装。",
            noSessions: "暂时没有课堂",
            noData: "暂时没有作答数据",
            chapter: "章节",
            accuracy: "正确率",
            mostCommonWrong: "最常见错误答案",
            questionsAnswered: "已作答",
            sessionCreated: "等候室已建立。"
        }
    };

    const state = {
        language: window.localStorage.getItem("ic-addmaths-teacher-language") || "en",
        authInfo: null,
        staff: null,
        questions: [],
        sessions: [],
        selectedQuestionIds: [],
        activeSession: null,
        participants: [],
        selectedParticipantId: null,
        monitorTab: "students",
        channel: null,
        pollTimer: null,
        clockTimer: null,
        autoEndInFlight: false,
        hideAnswers: false
    };

    function element(id) {
        return document.getElementById(id);
    }

    function text(key) {
        return (translations[state.language] || translations.en)[key] || key;
    }

    function showGate(name) {
        ["loading", "login", "denied"].forEach(function (view) {
            element("teacher-" + view + "-view").hidden = view !== name;
        });
        element("teacher-app").hidden = true;
    }

    function showTeacherApp() {
        ["loading", "login", "denied"].forEach(function (view) {
            element("teacher-" + view + "-view").hidden = true;
        });
        element("teacher-app").hidden = false;
    }

    function showContent(name) {
        const views = {
            empty: "teacher-empty-view",
            "create-session": "create-session-view",
            "session-dashboard": "session-dashboard-view"
        };
        Object.keys(views).forEach(function (view) {
            element(views[view]).hidden = view !== name;
        });
    }

    function showError(id, message) {
        const node = element(id);
        node.textContent = message || "";
        node.hidden = !message;
    }

    function applyLanguage(language) {
        state.language = language;
        window.localStorage.setItem("ic-addmaths-teacher-language", language);
        document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
        document.querySelectorAll("[data-language]").forEach(function (button) {
            button.classList.toggle("active", button.dataset.language === language);
        });
        document.querySelectorAll("[data-i18n]").forEach(function (node) {
            node.textContent = text(node.dataset.i18n);
        });
        if (state.sessions.length) renderSessionList();
        if (!element("create-session-view").hidden) {
            renderChapterSelector();
            renderQuestionPreview();
        }
        if (state.activeSession) {
            renderSessionDashboard();
            renderParticipants();
            renderQuestionAnalysis();
        }
    }

    function staffCanManage(session) {
        return state.staff && (
            state.staff.role === "admin" ||
            (state.authInfo && session.teacher_id === state.authInfo.user.id)
        );
    }

    async function checkAccess() {
        showGate("loading");
        const access = await Quiz.getStaffAccess();
        if (!access) {
            showGate("login");
            return;
        }
        state.authInfo = access.authInfo;
        state.staff = access.staff;
        element("teacher-account-label").textContent = state.authInfo.user.email;
        element("teacher-account-label").hidden = false;
        element("sign-out-button").hidden = false;

        if (!state.staff) {
            element("teacher-denied-message").textContent = access.setupError
                ? text("setupMissing") + " " + access.setupError
                : text("deniedMessage");
            showGate("denied");
            return;
        }

        showTeacherApp();
        await Promise.all([loadQuestionBank(), loadSessions()]);
        showContent("empty");
    }

    async function login(event) {
        event.preventDefault();
        showError("teacher-login-error", "");
        const button = event.currentTarget.querySelector('button[type="submit"]');
        button.disabled = true;
        const result = await window.AuthAccess.signIn(
            element("teacher-email").value.trim(),
            element("teacher-password").value
        );
        button.disabled = false;
        if (result.error) {
            showError("teacher-login-error", result.error.message);
            return;
        }
        await checkAccess();
    }

    async function signOut() {
        stopSubscriptions();
        await window.AuthAccess.signOut();
        state.authInfo = null;
        state.staff = null;
        state.activeSession = null;
        state.participants = [];
        element("teacher-account-label").hidden = true;
        element("sign-out-button").hidden = true;
        showGate("login");
    }

    async function loadQuestionBank() {
        const { data, error } = await window.supabaseClient
            .from("quiz_questions")
            .select("id, chapter, chapter_name, topic, difficulty, prompt, options, correct_option, explanation")
            .eq("active", true)
            .order("id");
        if (error) throw new Error(error.message);
        state.questions = data || [];
        if (!state.questions.length) throw new Error(text("setupMissing"));
    }

    async function loadSessions() {
        const { data, error } = await window.supabaseClient
            .from("quiz_sessions")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        state.sessions = data || [];
        renderSessionList();
        if (state.activeSession) {
            state.activeSession = state.sessions.find(function (session) {
                return session.id === state.activeSession.id;
            }) || null;
        }
    }

    function statusLabel(status) {
        return text(status === "lobby" ? "waiting" : status);
    }

    function renderSessionList() {
        const list = element("session-list");
        list.innerHTML = "";
        if (!state.sessions.length) {
            const empty = document.createElement("p");
            empty.className = "session-list-empty";
            empty.textContent = text("noSessions");
            list.appendChild(empty);
            return;
        }
        state.sessions.forEach(function (session) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "session-list-button" +
                (state.activeSession && state.activeSession.id === session.id ? " active" : "");

            const title = document.createElement("strong");
            title.textContent = session.title;
            const status = document.createElement("span");
            status.className = "mini-status " + session.status;
            status.textContent = statusLabel(session.status);
            const meta = document.createElement("small");
            meta.textContent = session.code + " · " + Quiz.formatDateTime(session.created_at);

            button.append(title, status, meta);
            button.addEventListener("click", function () {
                openSession(session.id);
            });
            list.appendChild(button);
        });
    }

    function selectedChapters() {
        return Array.from(element("chapter-selector").querySelectorAll('input[type="checkbox"]:checked'))
            .map(function (input) { return Number(input.value); });
    }

    function renderChapterSelector() {
        const chapters = new Map();
        state.questions.forEach(function (question) {
            if (!chapters.has(question.chapter)) {
                chapters.set(question.chapter, question.chapter_name);
            }
        });
        const selected = new Set(selectedChapters().length ? selectedChapters() : Array.from(chapters.keys()));
        const container = element("chapter-selector");
        container.innerHTML = "";
        chapters.forEach(function (name, chapter) {
            const label = document.createElement("label");
            label.className = "chapter-check";
            const input = document.createElement("input");
            input.type = "checkbox";
            input.value = chapter;
            input.checked = selected.has(chapter);
            const title = document.createElement("span");
            title.textContent = text("chapter") + " " + chapter + " · " + name;
            input.addEventListener("change", updateQuestionSelection);
            label.append(input, title);
            container.appendChild(label);
        });
    }

    function questionPool(chapters) {
        const allowed = new Set(chapters);
        return state.questions.filter(function (question) {
            return allowed.has(Number(question.chapter));
        });
    }

    function buildBalancedSelection(chapters, requested) {
        const groups = new Map();
        questionPool(chapters).forEach(function (question) {
            if (!groups.has(question.chapter)) groups.set(question.chapter, []);
            groups.get(question.chapter).push(question);
        });
        groups.forEach(function (questions, chapter) {
            groups.set(chapter, Quiz.shuffled(questions, String(Date.now()) + ":" + chapter));
        });

        const selected = [];
        const chapterOrder = Array.from(groups.keys()).sort(function (a, b) { return a - b; });
        let cursor = 0;
        while (selected.length < requested && chapterOrder.length) {
            const chapter = chapterOrder[cursor % chapterOrder.length];
            const group = groups.get(chapter);
            if (group.length) selected.push(group.shift().id);
            if (!group.length) chapterOrder.splice(cursor % chapterOrder.length, 1);
            else cursor += 1;
        }
        return selected;
    }

    function updateQuestionSelection() {
        const chapters = selectedChapters();
        const pool = questionPool(chapters);
        const countInput = element("create-question-count");
        countInput.max = Math.max(pool.length, 1);
        countInput.value = Math.min(Math.max(Number(countInput.value) || 1, 1), Math.max(pool.length, 1));
        state.selectedQuestionIds = buildBalancedSelection(chapters, Number(countInput.value));
        renderQuestionPreview();
    }

    function renderQuestionPreview() {
        const list = element("question-preview-list");
        list.innerHTML = "";
        const questions = state.selectedQuestionIds.map(function (id) {
            return state.questions.find(function (question) { return question.id === id; });
        }).filter(Boolean);
        element("preview-count").textContent =
            questions.length + " / " + questionPool(selectedChapters()).length;

        questions.forEach(function (question, index) {
            const row = document.createElement("div");
            row.className = "preview-question";
            const number = document.createElement("span");
            number.textContent = index + 1;
            const copy = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = question.prompt;
            const meta = document.createElement("small");
            meta.textContent = text("chapter") + " " + question.chapter + " · " + question.topic;
            copy.append(title, meta);
            const replace = document.createElement("button");
            replace.type = "button";
            replace.className = "replace-question-button";
            replace.setAttribute("aria-label", "Replace question " + question.id);
            replace.innerHTML = '<i data-lucide="repeat-2"></i>';
            replace.addEventListener("click", function () {
                replaceQuestion(question.id);
            });
            row.append(number, copy, replace);
            list.appendChild(row);
        });
        if (window.lucide) window.lucide.createIcons();
    }

    function replaceQuestion(questionId) {
        const current = state.questions.find(function (question) { return question.id === questionId; });
        if (!current) return;
        const selected = new Set(state.selectedQuestionIds);
        const candidates = state.questions.filter(function (question) {
            return question.chapter === current.chapter && !selected.has(question.id);
        });
        if (!candidates.length) return;
        const replacement = candidates[Math.floor(Math.random() * candidates.length)];
        state.selectedQuestionIds = state.selectedQuestionIds.map(function (id) {
            return id === questionId ? replacement.id : id;
        });
        renderQuestionPreview();
    }

    function showCreateSession() {
        stopSubscriptions();
        state.activeSession = null;
        renderSessionList();
        showContent("create-session");
        renderChapterSelector();
        element("create-question-count").value = state.questions.length;
        state.selectedQuestionIds = state.questions.map(function (question) { return question.id; });
        renderQuestionPreview();
        showError("create-session-error", "");
    }

    async function createSession(event) {
        event.preventDefault();
        showError("create-session-error", "");
        const button = element("create-session-submit");
        button.disabled = true;
        const chapters = selectedChapters();
        if (!chapters.length || !state.selectedQuestionIds.length) {
            showError("create-session-error", "Choose at least one chapter.");
            button.disabled = false;
            return;
        }

        const payload = {
            teacher_id: state.authInfo.user.id,
            title: element("create-title").value.trim(),
            class_label: element("create-class-label").value.trim() || null,
            status: "lobby",
            selected_chapters: chapters,
            question_ids: state.selectedQuestionIds,
            duration_minutes: Number(element("create-duration").value),
            shuffle_questions: element("create-shuffle-questions").checked,
            shuffle_options: element("create-shuffle-options").checked,
            allow_late_join: element("create-allow-late").checked,
            result_release: element("create-result-release").value
        };

        let created = null;
        let lastError = null;
        for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
            payload.code = Quiz.generateSessionCode();
            const result = await window.supabaseClient
                .from("quiz_sessions")
                .insert(payload)
                .select()
                .single();
            if (!result.error) created = result.data;
            else lastError = result.error;
        }
        button.disabled = false;
        if (!created) {
            showError("create-session-error", lastError ? lastError.message : "Unable to create session.");
            return;
        }
        await loadSessions();
        await openSession(created.id);
    }

    function stopSubscriptions() {
        if (state.channel && window.supabaseClient) {
            window.supabaseClient.removeChannel(state.channel);
        }
        state.channel = null;
        window.clearInterval(state.pollTimer);
        window.clearInterval(state.clockTimer);
        state.pollTimer = null;
        state.clockTimer = null;
    }

    async function openSession(sessionId) {
        stopSubscriptions();
        const session = state.sessions.find(function (item) { return item.id === sessionId; });
        if (!session) return;
        state.activeSession = session;
        state.selectedParticipantId = null;
        showContent("session-dashboard");
        renderSessionList();
        renderSessionDashboard();
        await loadParticipants();
        subscribeToParticipants();
        state.pollTimer = window.setInterval(loadParticipants, 5000);
        state.clockTimer = window.setInterval(updateSessionClock, 1000);
    }

    function button(labelKey, icon, className, handler) {
        const node = document.createElement("button");
        node.type = "button";
        node.className = className || "secondary-button";
        node.innerHTML = '<i data-lucide="' + icon + '"></i><span></span>';
        node.querySelector("span").textContent = text(labelKey);
        node.addEventListener("click", handler);
        return node;
    }

    function renderSessionDashboard() {
        const session = state.activeSession;
        if (!session) return;
        const status = element("session-status-pill");
        status.className = "status-pill " + session.status;
        status.textContent = statusLabel(session.status);
        element("session-class-label").textContent = session.class_label || "SPM Form 4";
        element("session-dashboard-title").textContent = session.title;
        element("session-dashboard-meta").textContent =
            session.question_ids.length + " questions · " +
            (session.duration_minutes ? session.duration_minutes + " minutes" : text("noLimit")) +
            " · " + Quiz.formatDateTime(session.created_at);
        element("dashboard-session-code").textContent = session.code;
        element("dashboard-join-link").value = Quiz.getJoinUrl(session.code);

        const actions = element("session-action-bar");
        actions.innerHTML = "";
        if (staffCanManage(session)) {
            if (session.status === "lobby") {
                actions.appendChild(button("start", "play", "primary-button compact", startSession));
            } else if (session.status === "live") {
                if (session.ends_at) actions.appendChild(button("extend", "clock-plus", "secondary-button", extendSession));
                actions.appendChild(button("end", "square", "primary-button compact", endSession));
            } else {
                actions.appendChild(button("reopen", "rotate-ccw", "primary-button compact", reopenSession));
            }
            actions.appendChild(button(
                session.allow_late_join ? "lateJoinOn" : "lateJoinOff",
                session.allow_late_join ? "door-open" : "door-closed",
                "secondary-button",
                toggleLateJoin
            ));
            actions.appendChild(button("delete", "trash-2", "secondary-button danger-button", deleteSession));
        }
        if (window.lucide) window.lucide.createIcons();
        updateSessionClock();
    }

    async function patchActiveSession(patch) {
        const { data, error } = await window.supabaseClient
            .from("quiz_sessions")
            .update(patch)
            .eq("id", state.activeSession.id)
            .select()
            .single();
        if (error) throw new Error(error.message);
        state.activeSession = data;
        await loadSessions();
        renderSessionDashboard();
    }

    async function startSession() {
        const now = new Date();
        const ends = state.activeSession.duration_minutes
            ? new Date(now.getTime() + state.activeSession.duration_minutes * 60000).toISOString()
            : null;
        await patchActiveSession({
            status: "live",
            starts_at: now.toISOString(),
            ended_at: null,
            ends_at: ends
        });
    }

    async function endSession() {
        await patchActiveSession({
            status: "ended",
            ended_at: new Date().toISOString(),
            ends_at: new Date().toISOString()
        });
        await loadParticipants();
    }

    async function reopenSession() {
        const now = new Date();
        const ends = state.activeSession.duration_minutes
            ? new Date(now.getTime() + state.activeSession.duration_minutes * 60000).toISOString()
            : null;
        await patchActiveSession({
            status: "live",
            starts_at: now.toISOString(),
            ended_at: null,
            ends_at: ends
        });
    }

    async function extendSession() {
        const baseline = state.activeSession.ends_at
            ? Math.max(Date.now(), new Date(state.activeSession.ends_at).getTime())
            : Date.now();
        await patchActiveSession({
            ends_at: new Date(baseline + 5 * 60000).toISOString()
        });
    }

    async function toggleLateJoin() {
        await patchActiveSession({ allow_late_join: !state.activeSession.allow_late_join });
    }

    async function deleteSession() {
        if (!window.confirm(text("deleteConfirm"))) return;
        const { error } = await window.supabaseClient
            .from("quiz_sessions")
            .delete()
            .eq("id", state.activeSession.id);
        if (error) {
            window.alert(error.message);
            return;
        }
        stopSubscriptions();
        state.activeSession = null;
        state.participants = [];
        await loadSessions();
        showContent("empty");
    }

    async function loadParticipants() {
        if (!state.activeSession) return;
        const { data, error } = await window.supabaseClient
            .from("quiz_participants")
            .select("*")
            .eq("session_id", state.activeSession.id)
            .order("joined_at");
        if (error) {
            console.warn("[AddMathsTeacher] Unable to load participants:", error.message);
            return;
        }
        state.participants = data || [];
        renderParticipants();
        renderQuestionAnalysis();
        if (state.selectedParticipantId) renderParticipantDialog();
    }

    function subscribeToParticipants() {
        if (!state.activeSession) return;
        state.channel = window.supabaseClient
            .channel("addmaths-session-" + state.activeSession.id)
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "quiz_participants",
                filter: "session_id=eq." + state.activeSession.id
            }, function () {
                loadParticipants();
            })
            .subscribe();
    }

    function selectedQuestions() {
        if (!state.activeSession) return [];
        return state.activeSession.question_ids.map(function (id) {
            return state.questions.find(function (question) { return question.id === Number(id); });
        }).filter(Boolean);
    }

    function participantScore(participant) {
        return selectedQuestions().reduce(function (score, question) {
            return score + (
                Number(participant.answers[String(question.id)]) === Number(question.correct_option) ? 1 : 0
            );
        }, 0);
    }

    function participantAnswered(participant) {
        return selectedQuestions().filter(function (question) {
            return participant.answers[String(question.id)] !== undefined;
        }).length;
    }

    function renderParticipants() {
        if (!state.activeSession) return;
        const total = selectedQuestions().length;
        const submitted = state.participants.filter(function (item) { return item.status === "submitted"; });
        const working = state.participants.filter(function (item) { return item.status === "active"; });
        const average = submitted.length
            ? submitted.reduce(function (sum, item) { return sum + Number(item.score || 0); }, 0) / submitted.length
            : null;
        element("stat-joined").textContent = state.participants.length;
        element("stat-progress").textContent = working.length;
        element("stat-submitted").textContent = submitted.length;
        element("stat-average").textContent = average === null ? "-" : average.toFixed(1) + "/" + total;

        const body = element("participant-table-body");
        body.innerHTML = "";
        element("participant-empty-state").hidden = state.participants.length > 0;
        state.participants.forEach(function (participant) {
            const answered = participantAnswered(participant);
            const score = participant.status === "submitted"
                ? Number(participant.score || 0)
                : participantScore(participant);
            const row = document.createElement("tr");

            const student = document.createElement("td");
            student.className = "student-cell";
            const name = document.createElement("strong");
            name.textContent = participant.display_name;
            const reference = document.createElement("small");
            reference.textContent = participant.student_ref || "#" + participant.join_order;
            student.append(name, reference);

            const status = document.createElement("td");
            const statusBadge = document.createElement("span");
            statusBadge.className = "status-pill " + participant.status;
            statusBadge.textContent = participant.status === "submitted"
                ? text("submitted")
                : participant.status === "active" ? text("working") : text("notStarted");
            status.appendChild(statusBadge);

            const progress = document.createElement("td");
            progress.innerHTML =
                '<div class="mini-progress-track"><span style="width:' +
                (total ? answered / total * 100 : 0) + '%"></span></div><small></small>';
            progress.querySelector("small").textContent = answered + "/" + total;

            const scoreCell = document.createElement("td");
            scoreCell.setAttribute("data-sensitive", "");
            scoreCell.innerHTML = '<strong class="sensitive-content"></strong>';
            scoreCell.querySelector("strong").textContent = score + "/" + total;

            const activity = document.createElement("td");
            activity.textContent = Quiz.formatDateTime(participant.last_active_at);

            row.append(student, status, progress, scoreCell, activity);
            row.addEventListener("click", function () {
                state.selectedParticipantId = participant.id;
                renderParticipantDialog();
                element("participant-dialog").hidden = false;
            });
            body.appendChild(row);
        });
        document.body.classList.toggle("answers-hidden", state.hideAnswers);
    }

    function renderParticipantDialog() {
        const participant = state.participants.find(function (item) {
            return item.id === state.selectedParticipantId;
        });
        if (!participant) return;
        const questions = selectedQuestions();
        element("participant-dialog-title").textContent = participant.display_name;
        element("participant-dialog-meta").textContent =
            participantAnswered(participant) + "/" + questions.length + " " + text("questionsAnswered") +
            " · " + participantScore(participant) + "/" + questions.length;
        const list = element("participant-answer-list");
        list.innerHTML = "";
        questions.forEach(function (question, index) {
            const selected = participant.answers[String(question.id)];
            const answered = selected !== undefined;
            const correct = answered && Number(selected) === Number(question.correct_option);
            const row = document.createElement("article");
            row.className = "participant-answer " + (!answered ? "unanswered" : correct ? "right" : "wrong");
            const number = document.createElement("strong");
            number.textContent = "Q" + (index + 1);
            const details = document.createElement("div");
            const answer = document.createElement("p");
            answer.className = "sensitive-content";
            answer.textContent = answered
                ? String.fromCharCode(65 + Number(selected)) + ". " + question.options[selected]
                : text("notAnswered");
            const meta = document.createElement("small");
            meta.className = "sensitive-content";
            meta.textContent = answered
                ? (correct ? text("correct") : text("correctAnswer") + ": " + question.options[question.correct_option])
                : text("chapter") + " " + question.chapter;
            details.append(answer, meta);
            row.append(number, details);
            list.appendChild(row);
        });
        element("reopen-participant-button").hidden = !(
            participant.status === "submitted" &&
            state.activeSession.status === "live" &&
            staffCanManage(state.activeSession)
        );
        document.body.classList.toggle("answers-hidden", state.hideAnswers);
    }

    async function reopenParticipant() {
        const participant = state.participants.find(function (item) {
            return item.id === state.selectedParticipantId;
        });
        if (!participant || !window.confirm(text("reopenConfirm"))) return;
        const { error } = await window.supabaseClient.rpc("reopen_addmaths_attempt", {
            p_participant_id: participant.id
        });
        if (error) {
            window.alert(error.message);
            return;
        }
        element("participant-dialog").hidden = true;
        state.selectedParticipantId = null;
        await loadParticipants();
    }

    function renderQuestionAnalysis() {
        if (!state.activeSession) return;
        const questions = selectedQuestions();
        const chapterGroups = new Map();
        questions.forEach(function (question) {
            if (!chapterGroups.has(question.chapter)) {
                chapterGroups.set(question.chapter, { name: question.chapter_name, correct: 0, answered: 0 });
            }
            const group = chapterGroups.get(question.chapter);
            state.participants.forEach(function (participant) {
                const answer = participant.answers[String(question.id)];
                if (answer !== undefined) {
                    group.answered += 1;
                    if (Number(answer) === Number(question.correct_option)) group.correct += 1;
                }
            });
        });

        const chapterContainer = element("chapter-analysis");
        chapterContainer.innerHTML = "";
        chapterGroups.forEach(function (group, chapter) {
            const article = document.createElement("article");
            const label = document.createElement("small");
            label.textContent = text("chapter") + " " + chapter;
            const name = document.createElement("strong");
            name.textContent = group.name;
            const score = document.createElement("span");
            score.className = "sensitive-content";
            score.textContent = group.answered
                ? Math.round(group.correct / group.answered * 100) + "%"
                : "-";
            article.append(label, name, score);
            chapterContainer.appendChild(article);
        });

        const list = element("question-analysis-list");
        list.innerHTML = "";
        questions.forEach(function (question, index) {
            const counts = [0, 0, 0, 0];
            let answered = 0;
            let correct = 0;
            state.participants.forEach(function (participant) {
                const answer = participant.answers[String(question.id)];
                if (answer !== undefined) {
                    answered += 1;
                    counts[Number(answer)] += 1;
                    if (Number(answer) === Number(question.correct_option)) correct += 1;
                }
            });
            let commonWrong = -1;
            counts.forEach(function (count, option) {
                if (
                    option !== Number(question.correct_option) &&
                    (commonWrong === -1 || count > counts[commonWrong])
                ) commonWrong = option;
            });

            const row = document.createElement("article");
            row.className = "analysis-row";
            const number = document.createElement("strong");
            number.textContent = "Q" + (index + 1);
            const copy = document.createElement("div");
            const title = document.createElement("h3");
            title.textContent = question.prompt;
            const meta = document.createElement("small");
            meta.className = "sensitive-content";
            meta.textContent = answered && commonWrong >= 0 && counts[commonWrong]
                ? text("mostCommonWrong") + ": " + question.options[commonWrong]
                : text("noData");
            copy.append(title, meta);
            const meter = document.createElement("div");
            meter.className = "accuracy-meter sensitive-content";
            const percent = document.createElement("strong");
            percent.textContent = answered ? Math.round(correct / answered * 100) + "%" : "-";
            const label = document.createElement("span");
            label.textContent = text("accuracy") + " · " + answered + " " + text("questionsAnswered");
            meter.append(percent, label);
            row.append(number, copy, meter);
            list.appendChild(row);
        });
        document.body.classList.toggle("answers-hidden", state.hideAnswers);
    }

    function updateSessionClock() {
        if (!state.activeSession) return;
        if (!state.activeSession.ends_at || state.activeSession.status !== "live") {
            element("stat-time").textContent = state.activeSession.status === "live"
                ? text("noLimit")
                : "--:--";
            return;
        }
        const remaining = new Date(state.activeSession.ends_at).getTime() - Date.now();
        element("stat-time").textContent = Quiz.formatCountdown(remaining);
        if (
            remaining <= 0 &&
            !state.autoEndInFlight &&
            staffCanManage(state.activeSession)
        ) {
            state.autoEndInFlight = true;
            endSession()
                .catch(function (error) {
                    console.error("[AddMathsTeacher] Unable to end timed session:", error);
                })
                .finally(function () {
                    state.autoEndInFlight = false;
                });
        }
    }

    function exportCsv() {
        if (!state.activeSession) return;
        const questions = selectedQuestions();
        const rows = [[
            "Student",
            "Student ID",
            "Status",
            "Answered",
            "Score",
            "Joined at",
            "Submitted at"
        ].concat(questions.map(function (_, index) { return "Q" + (index + 1); }))];
        state.participants.forEach(function (participant) {
            rows.push([
                participant.display_name,
                participant.student_ref || "",
                participant.status,
                participantAnswered(participant),
                participant.status === "submitted" ? participant.score : participantScore(participant),
                participant.joined_at,
                participant.submitted_at || ""
            ].concat(questions.map(function (question) {
                const answer = participant.answers[String(question.id)];
                return answer === undefined ? "" : question.options[answer];
            })));
        });
        Quiz.downloadCsv(
            "addmaths-" + state.activeSession.code.toLowerCase() + "-results.csv",
            rows
        );
    }

    function setMonitorTab(tab) {
        state.monitorTab = tab;
        document.querySelectorAll("[data-monitor-tab]").forEach(function (button) {
            button.classList.toggle("active", button.dataset.monitorTab === tab);
        });
        element("students-monitor-panel").hidden = tab !== "students";
        element("questions-monitor-panel").hidden = tab !== "questions";
    }

    async function copyJoinLink() {
        const value = element("dashboard-join-link").value;
        try {
            await navigator.clipboard.writeText(value);
            const button = element("copy-link-button");
            button.dataset.tooltip = text("copySuccess");
            window.setTimeout(function () { button.dataset.tooltip = "Copy link"; }, 1600);
        } catch {
            element("dashboard-join-link").select();
            document.execCommand("copy");
        }
    }

    function showQrCode() {
        if (!state.activeSession) return;
        const url = Quiz.getJoinUrl(state.activeSession.code);
        element("qr-dialog-title").textContent = state.activeSession.code;
        element("qr-link-label").textContent = url;
        const container = element("qr-code");
        container.innerHTML = "";
        new window.QRCode(container, {
            text: url,
            width: 220,
            height: 220,
            colorDark: "#16201c",
            colorLight: "#ffffff",
            correctLevel: window.QRCode.CorrectLevel.M
        });
        element("qr-dialog").hidden = false;
    }

    function bindEvents() {
        element("teacher-login-form").addEventListener("submit", login);
        element("sign-out-button").addEventListener("click", signOut);
        element("denied-sign-out-button").addEventListener("click", signOut);
        element("new-session-button").addEventListener("click", showCreateSession);
        element("cancel-create-button").addEventListener("click", function () {
            showContent(state.activeSession ? "session-dashboard" : "empty");
        });
        element("refresh-sessions-button").addEventListener("click", loadSessions);
        element("create-session-form").addEventListener("submit", createSession);
        element("create-question-count").addEventListener("input", updateQuestionSelection);
        element("reshuffle-preview-button").addEventListener("click", updateQuestionSelection);
        element("copy-link-button").addEventListener("click", copyJoinLink);
        element("show-qr-button").addEventListener("click", showQrCode);
        element("close-qr-dialog").addEventListener("click", function () {
            element("qr-dialog").hidden = true;
        });
        element("close-participant-dialog").addEventListener("click", function () {
            element("participant-dialog").hidden = true;
            state.selectedParticipantId = null;
        });
        element("reopen-participant-button").addEventListener("click", reopenParticipant);
        element("download-csv-button").addEventListener("click", exportCsv);
        element("hide-answers-toggle").addEventListener("change", function (event) {
            state.hideAnswers = event.currentTarget.checked;
            document.body.classList.toggle("answers-hidden", state.hideAnswers);
        });
        document.querySelectorAll("[data-monitor-tab]").forEach(function (button) {
            button.addEventListener("click", function () {
                setMonitorTab(button.dataset.monitorTab);
            });
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
        if (window.lucide) window.lucide.createIcons();
        try {
            await checkAccess();
        } catch (error) {
            element("teacher-denied-message").textContent = error.message;
            showGate("denied");
        }
    }

    window.addEventListener("DOMContentLoaded", init);
})();
