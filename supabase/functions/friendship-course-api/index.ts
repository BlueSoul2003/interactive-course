import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const ROOM_CODE = "FRIEND-F2FC";
const QUESTION_COUNT = 30;
const encoder = new TextEncoder();
const allowedOrigin = /^https:\/\/bluesoul2003\.github\.io$/i;

function cors(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigin.test(origin) ? origin : "*",
    "Access-Control-Allow-Headers": "content-type,x-teacher-key",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(request: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors(request),
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function cleanName(value: unknown): string {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function cleanTitle(value: unknown): string {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomClassCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !serviceKey) return json(request, { error: "Server configuration is incomplete." }, 503);

  const db = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "course";
    const { data: quiz, error: quizError } = await db
      .from("friendship_quiz_sessions")
      .select("id,title,teacher_token_hash")
      .eq("room_code", ROOM_CODE)
      .single();
    if (quizError || !quiz) return json(request, { error: "The course is not available." }, 503);

    async function requireTeacher(): Promise<boolean> {
      const key = request.headers.get("x-teacher-key") || "";
      if (!key || key.length > 256) return false;
      return await sha256(key) === quiz.teacher_token_hash;
    }

    async function loadQuestions(includeAnswers: boolean) {
      const fields = includeAnswers
        ? "question_no,category,prompt,options,correct_index,explanation"
        : "question_no,category,prompt,options";
      const { data, error } = await db
        .from("friendship_quiz_questions")
        .select(fields)
        .eq("session_id", quiz.id)
        .order("question_no");
      if (error || !data || data.length !== QUESTION_COUNT) throw new Error("Question bank is incomplete");
      return data;
    }

    async function studentAttempt(attemptId: string) {
      const { data: attempt, error } = await db
        .from("friendship_quiz_attempts")
        .select("id,student_name,status,score,answered_count,class_session_id,created_at,updated_at,submitted_at")
        .eq("id", attemptId)
        .eq("quiz_session_id", quiz.id)
        .maybeSingle();
      if (error) throw error;
      if (!attempt) return null;
      const { data: answers, error: answerError } = await db
        .from("friendship_quiz_attempt_answers")
        .select("question_no,selected_index,updated_at")
        .eq("attempt_id", attemptId)
        .order("question_no");
      if (answerError) throw answerError;
      return { ...attempt, answers: answers || [] };
    }

    async function submittedResult(attempt: Record<string, unknown>) {
      if (attempt.status !== "submitted") return null;
      const questions = await loadQuestions(true);
      const selected = new Map((attempt.answers as Array<Record<string, unknown>>).map((answer) => [answer.question_no, answer.selected_index]));
      return questions.map((question) => ({
        question_no: question.question_no,
        selected_index: selected.get(question.question_no),
        correct_index: question.correct_index,
        correct: selected.get(question.question_no) === question.correct_index,
        explanation: question.explanation,
      }));
    }

    if (request.method === "GET" && action === "course") {
      const questions = await loadQuestions(false);
      const attemptId = url.searchParams.get("attempt_id") || "";
      const attempt = isUuid(attemptId) ? await studentAttempt(attemptId) : null;
      return json(request, {
        title: quiz.title,
        question_count: QUESTION_COUNT,
        questions,
        attempt,
        result: attempt ? await submittedResult(attempt as Record<string, unknown>) : null,
      });
    }

    if (request.method === "GET" && action === "teacher") {
      if (!await requireTeacher()) return json(request, { error: "Teacher access denied." }, 403);
      const [{ data: classes, error: classError }, { data: attempts, error: attemptError }, questions] = await Promise.all([
        db.from("friendship_class_sessions").select("id,class_code,title,status,created_at,ended_at").eq("quiz_session_id", quiz.id).order("created_at", { ascending: false }),
        db.from("friendship_quiz_attempts").select("id,class_session_id,student_name,status,score,answered_count,created_at,updated_at,submitted_at,friendship_quiz_attempt_answers(question_no,selected_index,updated_at)").eq("quiz_session_id", quiz.id).order("updated_at", { ascending: false }),
        loadQuestions(true),
      ]);
      if (classError) throw classError;
      if (attemptError) throw attemptError;
      return json(request, { classes: classes || [], attempts: attempts || [], questions });
    }

    if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return json(request, { error: "Invalid request." }, 400);

    if (action === "teacher-check") {
      if (!await requireTeacher()) return json(request, { error: "Teacher access denied." }, 403);
      return json(request, { ok: true });
    }

    if (action === "create-class") {
      if (!await requireTeacher()) return json(request, { error: "Teacher access denied." }, 403);
      const title = cleanTitle(body.title);
      if (title.length < 2) return json(request, { error: "Please enter a class title." }, 400);
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const classCode = randomClassCode();
        const { data, error } = await db.from("friendship_class_sessions").insert({
          quiz_session_id: quiz.id,
          class_code: classCode,
          title,
        }).select("id,class_code,title,status,created_at,ended_at").single();
        if (!error) return json(request, { class_session: data }, 201);
        if (error.code !== "23505") throw error;
      }
      throw new Error("Could not generate a unique class code");
    }

    if (action === "end-class") {
      if (!await requireTeacher()) return json(request, { error: "Teacher access denied." }, 403);
      const classId = String(body.class_id || "");
      if (!isUuid(classId)) return json(request, { error: "Invalid class session." }, 400);
      const now = new Date().toISOString();
      const { data, error } = await db.from("friendship_class_sessions")
        .update({ status: "ended", ended_at: now, updated_at: now })
        .eq("id", classId).eq("quiz_session_id", quiz.id)
        .select("id,class_code,title,status,created_at,ended_at").maybeSingle();
      if (error) throw error;
      if (!data) return json(request, { error: "Class session not found." }, 404);
      return json(request, { class_session: data });
    }

    if (action === "start") {
      const attemptId = String(body.attempt_id || "");
      const studentName = cleanName(body.student_name);
      const classCode = String(body.class_code || "").trim().toUpperCase();
      if (!isUuid(attemptId)) return json(request, { error: "Invalid attempt." }, 400);
      if (!studentName) return json(request, { error: "Please enter your name." }, 400);

      const existing = await studentAttempt(attemptId);
      if (existing) {
        if (existing.student_name !== studentName) return json(request, { error: "This attempt belongs to a different student name." }, 409);
        return json(request, { attempt: existing, result: await submittedResult(existing as Record<string, unknown>) });
      }

      let classSessionId: string | null = null;
      if (classCode) {
        const { data: classSession, error } = await db.from("friendship_class_sessions")
          .select("id,status").eq("quiz_session_id", quiz.id).eq("class_code", classCode).maybeSingle();
        if (error) throw error;
        if (!classSession) return json(request, { error: "Class session not found." }, 404);
        if (classSession.status !== "live") return json(request, { error: "This class session has ended." }, 409);
        classSessionId = classSession.id;
      }

      const { error } = await db.from("friendship_quiz_attempts").insert({
        id: attemptId,
        quiz_session_id: quiz.id,
        class_session_id: classSessionId,
        student_name: studentName,
      });
      if (error) throw error;
      return json(request, { attempt: await studentAttempt(attemptId) }, 201);
    }

    if (action === "answer") {
      const attemptId = String(body.attempt_id || "");
      const questionNo = Number(body.question_no);
      const selectedIndex = Number(body.selected_index);
      if (!isUuid(attemptId) || !Number.isInteger(questionNo) || questionNo < 1 || questionNo > QUESTION_COUNT || !Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
        return json(request, { error: "Invalid answer." }, 400);
      }
      const attempt = await studentAttempt(attemptId);
      if (!attempt) return json(request, { error: "Attempt not found." }, 404);
      if (attempt.status === "submitted") return json(request, { error: "This attempt has already been submitted." }, 409);
      const now = new Date().toISOString();
      const { error: answerError } = await db.from("friendship_quiz_attempt_answers").upsert({
        attempt_id: attemptId,
        question_no: questionNo,
        selected_index: selectedIndex,
        updated_at: now,
      }, { onConflict: "attempt_id,question_no" });
      if (answerError) throw answerError;
      const { count, error: countError } = await db.from("friendship_quiz_attempt_answers")
        .select("question_no", { count: "exact", head: true }).eq("attempt_id", attemptId);
      if (countError) throw countError;
      await db.from("friendship_quiz_attempts").update({ answered_count: count || 0, updated_at: now }).eq("id", attemptId);
      return json(request, { ok: true, answered_count: count || 0 });
    }

    if (action === "submit") {
      const attemptId = String(body.attempt_id || "");
      if (!isUuid(attemptId)) return json(request, { error: "Invalid attempt." }, 400);
      const attempt = await studentAttempt(attemptId);
      if (!attempt) return json(request, { error: "Attempt not found." }, 404);
      if (attempt.status === "submitted") return json(request, { attempt, result: await submittedResult(attempt as Record<string, unknown>) });
      if (attempt.answers.length !== QUESTION_COUNT) return json(request, { error: "Please answer all 30 questions before submitting." }, 409);
      const questions = await loadQuestions(true);
      const correct = new Map(questions.map((question) => [question.question_no, question.correct_index]));
      const score = attempt.answers.reduce((total: number, answer: Record<string, number>) => total + (correct.get(answer.question_no) === answer.selected_index ? 1 : 0), 0);
      const now = new Date().toISOString();
      const { error } = await db.from("friendship_quiz_attempts").update({
        status: "submitted", score, answered_count: QUESTION_COUNT, submitted_at: now, updated_at: now,
      }).eq("id", attemptId).eq("status", "in_progress");
      if (error) throw error;
      const submitted = await studentAttempt(attemptId);
      return json(request, { attempt: submitted, result: await submittedResult(submitted as Record<string, unknown>) });
    }

    return json(request, { error: "Unknown action." }, 404);
  } catch (error) {
    console.error("friendship-course-api", error);
    return json(request, { error: "The course service is temporarily unavailable." }, 500);
  }
});
