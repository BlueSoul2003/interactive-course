-- SPM Form 4 Additional Mathematics live quiz
-- Safe to run repeatedly. Creates the staff registry, question bank, live
-- sessions, anonymous student attempts, RLS policies, and RPC boundaries.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Anonymous quiz users must not enter the normal member profile workflow.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_syllabus TEXT;
    v_unlocked_modules TEXT[];
BEGIN
    IF COALESCE(NEW.is_anonymous, FALSE) THEN
        RETURN NEW;
    END IF;

    v_syllabus := NEW.raw_user_meta_data->>'syllabus';
    IF v_syllabus IS NOT NULL AND v_syllabus <> '' THEN
        v_unlocked_modules := ARRAY[v_syllabus];
    ELSE
        v_unlocked_modules := ARRAY[]::TEXT[];
    END IF;

    INSERT INTO public.user_profiles (
        id, email, tier, tier_level, fullname, phone, syllabus,
        age, gender, role, unlocked_modules
    )
    VALUES (
        NEW.id,
        NEW.email,
        'member',
        1,
        NEW.raw_user_meta_data->>'fullname',
        NEW.raw_user_meta_data->>'phone',
        v_syllabus,
        NULLIF(NEW.raw_user_meta_data->>'age', '')::INTEGER,
        NEW.raw_user_meta_data->>'gender',
        NEW.raw_user_meta_data->>'role',
        v_unlocked_modules
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        fullname = COALESCE(public.user_profiles.fullname, EXCLUDED.fullname),
        phone = COALESCE(public.user_profiles.phone, EXCLUDED.phone),
        syllabus = COALESCE(public.user_profiles.syllabus, EXCLUDED.syllabus),
        age = COALESCE(public.user_profiles.age, EXCLUDED.age),
        gender = COALESCE(public.user_profiles.gender, EXCLUDED.gender),
        role = COALESCE(public.user_profiles.role, EXCLUDED.role),
        unlocked_modules = COALESCE(public.user_profiles.unlocked_modules, EXCLUDED.unlocked_modules);
    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.quiz_staff (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'admin')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.quiz_staff (user_id, role, created_by)
SELECT id, 'admin', id
FROM public.user_profiles
WHERE tier = 'admin'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id INTEGER PRIMARY KEY,
    version INTEGER NOT NULL DEFAULT 1,
    chapter SMALLINT NOT NULL CHECK (chapter BETWEEN 1 AND 10),
    chapter_name TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    prompt TEXT NOT NULL,
    options JSONB NOT NULL CHECK (
        jsonb_typeof(options) = 'array' AND jsonb_array_length(options) = 4
    ),
    correct_option SMALLINT NOT NULL CHECK (correct_option BETWEEN 0 AND 3),
    explanation TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.quiz_questions (
    id, chapter, chapter_name, topic, difficulty, prompt,
    options, correct_option, explanation
) VALUES
(1, 1, 'Functions', 'Composite functions', 'Foundation',
 'Given f(x) = 2x - 3 and g(x) = x² + 1, find (g o f)(2).',
 '["1","2","5","10"]'::jsonb, 1,
 'First find f(2) = 2(2) - 3 = 1. Then g(1) = 1² + 1 = 2.'),
(2, 1, 'Functions', 'Inverse functions', 'SPM Practice',
 'The function f is defined by f(x) = (3x - 5)/2. Which of the following is f⁻¹(x)?',
 '["(2x - 5)/3","(2x + 5)/3","(3x + 5)/2","(5 - 2x)/3"]'::jsonb, 1,
 'Let y = (3x - 5)/2. Rearranging gives 2y = 3x - 5 and x = (2y + 5)/3, so f⁻¹(x) = (2x + 5)/3.'),
(3, 1, 'Functions', 'Domain', 'SPM Practice',
 'A function h is defined by h(x) = √(7 - 2x). What is the domain of h?',
 '["x >= 7/2","x <= 7/2","x > -7/2","-7/2 <= x <= 7/2"]'::jsonb, 1,
 'The expression inside a square root must be non-negative: 7 - 2x >= 0. Hence x <= 7/2.'),
(4, 1, 'Functions', 'Composite functions', 'Challenge',
 'Given f(x) = ax + 1 and f(f(x)) = 4x + 3 for all x, find a.',
 '["-2","-1","1","2"]'::jsonb, 3,
 'f(f(x)) = a(ax + 1) + 1 = a²x + a + 1. Comparing with 4x + 3 gives a² = 4 and a + 1 = 3, so a = 2.'),
(5, 2, 'Quadratic Functions', 'Roots of quadratic equations', 'Foundation',
 'The roots of 2x² - 5x - 3 = 0 are alpha and beta. Find alpha + beta and alpha beta.',
 '["alpha + beta = -5/2, alpha beta = -3/2","alpha + beta = 5/2, alpha beta = -3/2","alpha + beta = 5/2, alpha beta = 3/2","alpha + beta = -5, alpha beta = -3"]'::jsonb, 1,
 'For ax² + bx + c = 0, the sum of roots is -b/a and the product is c/a. Therefore alpha + beta = 5/2 and alpha beta = -3/2.'),
(6, 2, 'Quadratic Functions', 'Discriminant', 'SPM Practice',
 'The equation x² + kx + 9 = 0 has two equal roots. Find the possible values of k.',
 '["k = 3 only","k = -3 only","k = 6 or k = -6","k = 9 or k = -9"]'::jsonb, 2,
 'Equal roots require discriminant b² - 4ac = 0. Thus k² - 36 = 0, giving k = 6 or k = -6.'),
(7, 2, 'Quadratic Functions', 'Maximum and minimum values', 'SPM Practice',
 'Find the maximum value of y = -2x² + 8x - 3.',
 '["3","5","8","11"]'::jsonb, 1,
 'The vertex occurs at x = -b/(2a) = -8/(2 x -2) = 2. Substitution gives y = -2(2²) + 8(2) - 3 = 5.'),
(8, 2, 'Quadratic Functions', 'Optimisation', 'Challenge',
 'A rectangle has a perimeter of 28 cm. What is its maximum possible area?',
 '["42 cm²","48 cm²","49 cm²","56 cm²"]'::jsonb, 2,
 'For a fixed perimeter, a rectangle has maximum area when it is a square. Each side is 28/4 = 7 cm, so the area is 49 cm².'),
(9, 3, 'Systems of Equations', 'Three linear equations', 'Foundation',
 'Solve the system x + y + z = 6, x - y + z = 2 and x + y - z = 0.',
 '["x = 1, y = 2, z = 3","x = 2, y = 1, z = 3","x = 3, y = 2, z = 1","x = 1, y = 3, z = 2"]'::jsonb, 0,
 'Subtracting the second equation from the first gives 2y = 4, so y = 2. Subtracting the third from the first gives 2z = 6, so z = 3, and then x = 1.'),
(10, 3, 'Systems of Equations', 'Linear and non-linear equations', 'SPM Practice',
 'Find the points of intersection of y = x + 1 and x² + y² = 25.',
 '["(3, 4) and (-4, -3)","(4, 3) and (-3, -4)","(3, -4) and (-4, 3)","(5, 0) and (0, 5)"]'::jsonb, 0,
 'Substitute y = x + 1: x² + (x + 1)² = 25, so x² + x - 12 = 0. Hence x = 3 or -4, giving (3, 4) and (-4, -3).'),
(11, 3, 'Systems of Equations', 'Problem solving', 'SPM Practice',
 'At an event, adult, student and child tickets cost RM12, RM8 and RM5 respectively. A total of 20 tickets brings in RM185, and the number of adult tickets is twice the number of child tickets. How many adult tickets are sold?',
 '["5","8","10","12"]'::jsonb, 2,
 'Let child tickets be c, so adult tickets are 2c and student tickets are 20 - 3c. Revenue gives 24c + 8(20 - 3c) + 5c = 185, so c = 5 and adult tickets = 10.'),
(12, 3, 'Systems of Equations', 'Intersections', 'Challenge',
 'The graphs y = 2x + 3 and y = x² - 1 intersect at two points. Find the sum of the x-coordinates of the points.',
 '["-4","-2","2","4"]'::jsonb, 2,
 'At intersection, x² - 1 = 2x + 3, so x² - 2x - 4 = 0. The sum of the roots is -b/a = 2.'),
(13, 4, 'Indices, Surds & Logarithms', 'Laws of indices', 'Foundation',
 'Evaluate 8^(2/3) x 16^(-1/2).',
 '["1/4","1/2","1","4"]'::jsonb, 2,
 '8^(2/3) = (cube root of 8)² = 4, while 16^(-1/2) = 1/sqrt(16) = 1/4. Their product is 1.'),
(14, 4, 'Indices, Surds & Logarithms', 'Rationalising denominators', 'SPM Practice',
 'Express 3/(2 + √5) in the form a + b√5, where a and b are integers.',
 '["6 - 3√5","3√5 - 6","6 + 3√5","-6 - 3√5"]'::jsonb, 1,
 'Multiply by the conjugate (2 - √5). The denominator is 4 - 5 = -1, so the result is -3(2 - √5) = 3√5 - 6.'),
(15, 4, 'Indices, Surds & Logarithms', 'Logarithmic equations', 'SPM Practice',
 'Solve log₂(x - 1) + log₂(x + 1) = 3.',
 '["x = -3","x = 2","x = 3","x = 9"]'::jsonb, 2,
 'Combine the logarithms: log₂[(x - 1)(x + 1)] = 3, so x² - 1 = 8 and x = ±3. The domain requires x > 1, hence x = 3.'),
(16, 4, 'Indices, Surds & Logarithms', 'Exponential growth', 'Challenge',
 'A culture initially contains 500 bacteria and grows by 8% every hour. Approximately how many bacteria are present after 5 hours?',
 '["680","720","735","800"]'::jsonb, 2,
 'Use compound growth: 500(1.08)^5 = 734.66, which is approximately 735 bacteria.'),
(17, 5, 'Progressions', 'Arithmetic progressions', 'Foundation',
 'The first term of an arithmetic progression is 7 and its common difference is 3. Which term is equal to 52?',
 '["The 15th term","The 16th term","The 17th term","The 18th term"]'::jsonb, 1,
 'The nth term is 7 + 3(n - 1). Solving 7 + 3(n - 1) = 52 gives n = 16.'),
(18, 5, 'Progressions', 'Sum of arithmetic progression', 'SPM Practice',
 'Find the sum of the first 20 terms of the arithmetic progression 5, 9, 13, ...',
 '["780","820","860","900"]'::jsonb, 2,
 'S20 = 20/2 [2(5) + 19(4)] = 10(86) = 860.'),
(19, 5, 'Progressions', 'Infinite geometric progression', 'SPM Practice',
 'Find the sum to infinity of the geometric progression 81, 27, 9, ...',
 '["108","117","121.5","243"]'::jsonb, 2,
 'The first term is 81 and common ratio is 1/3. Therefore S infinity = 81/(1 - 1/3) = 121.5.'),
(20, 5, 'Progressions', 'Application of progressions', 'Challenge',
 'A student saves RM100 in the first month and increases the amount saved by RM20 each month. How much is saved altogether during the first 12 months?',
 '["RM1,320","RM2,200","RM2,520","RM2,640"]'::jsonb, 2,
 'This is an arithmetic progression with a = 100, d = 20 and n = 12. S12 = 12/2 [2(100) + 11(20)] = RM2,520.'),
(21, 6, 'Linear Law', 'Power relations', 'Foundation',
 'The variables x and y satisfy y = ax^n. Which straight-line graph has gradient n and vertical intercept log₁₀ a?',
 '["y against x","log₁₀ y against x","log₁₀ y against log₁₀ x","1/y against 1/x"]'::jsonb, 2,
 'Taking logarithms gives log₁₀ y = log₁₀ a + n log₁₀ x. Thus a plot of log₁₀ y against log₁₀ x has gradient n and intercept log₁₀ a.'),
(22, 6, 'Linear Law', 'Algebraic linearisation', 'SPM Practice',
 'Given y = p/x + q, which graph is a straight line with gradient q and vertical intercept p?',
 '["y against x","xy against x","y/x against x","xy against x²"]'::jsonb, 1,
 'Multiply by x to obtain xy = p + qx. Therefore plotting xy against x gives gradient q and vertical intercept p.'),
(23, 6, 'Linear Law', 'Gradient and intercept', 'SPM Practice',
 'The variables x and y satisfy y = a/(x + b). A graph of 1/y against x has gradient 0.25 and vertical intercept 1.5. Find a and b.',
 '["a = 4, b = 6","a = 4, b = 1.5","a = 0.25, b = 6","a = 6, b = 4"]'::jsonb, 0,
 'Rearrange to 1/y = (1/a)x + b/a. Since 1/a = 0.25, a = 4. Also b/a = 1.5, so b = 6.'),
(24, 6, 'Linear Law', 'Exponential relations', 'Challenge',
 'For y = ab^x, a graph of log₁₀ y against x has gradient 0.3010 and vertical intercept 0.6990. Find a and b.',
 '["a = 2, b = 5","a = 5, b = 2","a = 0.6990, b = 0.3010","a = 10, b = 2"]'::jsonb, 1,
 'log₁₀ y = log₁₀ a + x log₁₀ b. Hence a = 10^0.6990 = 5 and b = 10^0.3010 = 2.'),
(25, 7, 'Coordinate Geometry', 'Division of a line segment', 'Foundation',
 'Point P divides the line joining A(-2, 3) and B(8, 13) internally in the ratio AP : PB = 2 : 3. Find P.',
 '["(2, 7)","(4, 8)","(5, 9)","(6, 11)"]'::jsonb, 0,
 'Using the section formula, P = [3A + 2B]/5. This gives x = (-6 + 16)/5 = 2 and y = (9 + 26)/5 = 7.'),
(26, 7, 'Coordinate Geometry', 'Equation of a straight line', 'SPM Practice',
 'Find the equation of the line passing through (3, 1) and perpendicular to 3x - 2y = 6.',
 '["2x + 3y = 9","3x + 2y = 11","2x - 3y = 3","3x - 2y = 7"]'::jsonb, 0,
 'The given line has gradient 3/2, so a perpendicular line has gradient -2/3. Through (3, 1), y - 1 = (-2/3)(x - 3), which simplifies to 2x + 3y = 9.'),
(27, 7, 'Coordinate Geometry', 'Area of a polygon', 'SPM Practice',
 'Find the area of the triangle with vertices (0, 0), (6, 0) and (2, 5).',
 '["10 square units","12 square units","15 square units","30 square units"]'::jsonb, 2,
 'Take the horizontal base from (0, 0) to (6, 0), which has length 6. The perpendicular height is 5, so area = 1/2 x 6 x 5 = 15.'),
(28, 7, 'Coordinate Geometry', 'Locus', 'Challenge',
 'A moving point P(x, y) is equidistant from A(2, -1) and B(8, 3). Find the equation of its locus.',
 '["3x + 2y - 17 = 0","2x + 3y - 17 = 0","3x - 2y - 17 = 0","x + y - 6 = 0"]'::jsonb, 0,
 'Set PA² = PB² and expand: (x - 2)² + (y + 1)² = (x - 8)² + (y - 3)². Simplifying gives 3x + 2y - 17 = 0.'),
(29, 8, 'Vectors', 'Magnitude of a vector', 'Foundation',
 'Find the magnitude of the vector 6i - 8j.',
 '["2","7","10","14"]'::jsonb, 2,
 'Magnitude = sqrt(6² + (-8)²) = sqrt(36 + 64) = 10.'),
(30, 8, 'Vectors', 'Unit vectors', 'SPM Practice',
 'Find the unit vector in the direction of 3i + 4j.',
 '["3i + 4j","(3/4)i + j","(3/5)i + (4/5)j","(4/5)i + (3/5)j"]'::jsonb, 2,
 'The magnitude of 3i + 4j is 5. Dividing the vector by 5 gives (3/5)i + (4/5)j.'),
(31, 8, 'Vectors', 'Vector operations', 'SPM Practice',
 'Given a = 2i - j and b = i + 3j, find 2a - b.',
 '["3i - 5j","3i + j","5i - j","i - 7j"]'::jsonb, 0,
 '2a - b = 2(2i - j) - (i + 3j) = 4i - 2j - i - 3j = 3i - 5j.'),
(32, 8, 'Vectors', 'Position vectors', 'Challenge',
 'The position vectors of A and B are a and b respectively. Point P divides AB internally such that AP : PB = 2 : 1. Which expression represents OP?',
 '["(2a + b)/3","(a + 2b)/3","2a - b","(a + b)/2"]'::jsonb, 1,
 'For AP : PB = 2 : 1, the section formula gives OP = [1(a) + 2(b)]/3 = (a + 2b)/3.'),
(33, 9, 'Solution of Triangles', 'Sine rule', 'Foundation',
 'In triangle ABC, A = 30°, B = 45° and side a = 8 cm. Find side b.',
 '["4√2 cm","8 cm","8√2 cm","16 cm"]'::jsonb, 2,
 'By the sine rule, b/sin45° = 8/sin30°. Therefore b = 8(sin45°/sin30°) = 8√2 cm.'),
(34, 9, 'Solution of Triangles', 'Cosine rule', 'SPM Practice',
 'Two sides of a triangle are 5 cm and 7 cm, and their included angle is 60°. Find the length of the third side.',
 '["√39 cm","√49 cm","√59 cm","6 cm"]'::jsonb, 0,
 'By the cosine rule, c² = 5² + 7² - 2(5)(7)cos60° = 25 + 49 - 35 = 39. Hence c = √39 cm.'),
(35, 9, 'Solution of Triangles', 'Area of a triangle', 'SPM Practice',
 'Find the area of a triangle with two sides 10 cm and 12 cm and included angle 30°.',
 '["24 cm²","30 cm²","60 cm²","120 cm²"]'::jsonb, 1,
 'Area = 1/2 ab sin C = 1/2(10)(12)sin30° = 30 cm².'),
(36, 9, 'Solution of Triangles', 'Ambiguous case', 'Challenge',
 'In triangle ABC, A = 30°, a = 6 cm and b = 10 cm. How many different triangles satisfy these measurements?',
 '["No triangle","One triangle","Two triangles","Infinitely many triangles"]'::jsonb, 2,
 'The sine rule gives sin B = 10 sin30° / 6 = 5/6. Both B and 180° - B leave a positive third angle with A = 30°, so two triangles are possible.'),
(37, 10, 'Index Numbers', 'Price index', 'Foundation',
 'The price of an item rises from RM80 in the base year to RM92 in the current year. Find its price index.',
 '["112","115","120","125"]'::jsonb, 1,
 'Price index = (current price/base price) x 100 = (92/80) x 100 = 115.'),
(38, 10, 'Index Numbers', 'Interpreting an index', 'SPM Practice',
 'The price index of a product is 125, based on a price of RM48. Find its current price.',
 '["RM50","RM58","RM60","RM72"]'::jsonb, 2,
 'Current price = 125/100 x RM48 = RM60.'),
(39, 10, 'Index Numbers', 'Composite index', 'SPM Practice',
 'Three items have index numbers 110, 95 and 120 with respective weights 3, 2 and 5. Find the composite index.',
 '["108","110","112","115"]'::jsonb, 2,
 'Composite index = [3(110) + 2(95) + 5(120)]/(3 + 2 + 5) = 112.'),
(40, 10, 'Index Numbers', 'Application of composite index', 'Challenge',
 'A family''s composite cost-of-living index is 108. If its total monthly expenditure in the base year was RM2,500, estimate the corresponding current monthly expenditure.',
 '["RM2,580","RM2,650","RM2,700","RM2,750"]'::jsonb, 2,
 'Current expenditure = 108/100 x RM2,500 = RM2,700.')
ON CONFLICT (id) DO UPDATE SET
    chapter = EXCLUDED.chapter,
    chapter_name = EXCLUDED.chapter_name,
    topic = EXCLUDED.topic,
    difficulty = EXCLUDED.difficulty,
    prompt = EXCLUDED.prompt,
    options = EXCLUDED.options,
    correct_option = EXCLUDED.correct_option,
    explanation = EXCLUDED.explanation,
    active = TRUE,
    reviewed_at = NOW();

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (code ~ '^[A-Z2-9]{6,12}$'),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 80),
    class_label TEXT,
    status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'live', 'ended')),
    selected_chapters SMALLINT[] NOT NULL,
    question_ids INTEGER[] NOT NULL CHECK (cardinality(question_ids) BETWEEN 1 AND 40),
    duration_minutes INTEGER NOT NULL DEFAULT 0 CHECK (duration_minutes BETWEEN 0 AND 240),
    shuffle_questions BOOLEAN NOT NULL DEFAULT TRUE,
    shuffle_options BOOLEAN NOT NULL DEFAULT TRUE,
    allow_late_join BOOLEAN NOT NULL DEFAULT TRUE,
    result_release TEXT NOT NULL DEFAULT 'on_end' CHECK (result_release IN ('on_submit', 'on_end')),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 50),
    student_ref TEXT,
    join_order INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'submitted')),
    question_order INTEGER[] NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (jsonb_typeof(answers) = 'object'),
    current_index INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    UNIQUE (session_id, auth_user_id)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempt_events (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES public.quiz_participants(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('submitted', 'reopened')),
    actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quiz_sessions_teacher_created_idx
    ON public.quiz_sessions (teacher_id, created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_participants_session_idx
    ON public.quiz_participants (session_id, joined_at);
CREATE INDEX IF NOT EXISTS quiz_attempt_events_participant_idx
    ON public.quiz_attempt_events (participant_id, created_at DESC);

ALTER TABLE public.quiz_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempt_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quiz staff can read own grant" ON public.quiz_staff;
CREATE POLICY "Quiz staff can read own grant"
ON public.quiz_staff FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.is_quiz_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.quiz_staff
        WHERE user_id = (SELECT auth.uid())
    );
$$;

CREATE OR REPLACE FUNCTION public.is_quiz_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.quiz_staff
        WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION public.is_quiz_staff() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_quiz_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_quiz_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_quiz_admin() TO authenticated;

DROP POLICY IF EXISTS "Quiz staff can read questions" ON public.quiz_questions;
CREATE POLICY "Quiz staff can read questions"
ON public.quiz_questions FOR SELECT TO authenticated
USING ((SELECT public.is_quiz_staff()));

DROP POLICY IF EXISTS "Quiz staff can read sessions" ON public.quiz_sessions;
CREATE POLICY "Quiz staff can read sessions"
ON public.quiz_sessions FOR SELECT TO authenticated
USING (
    teacher_id = (SELECT auth.uid())
    OR (SELECT public.is_quiz_admin())
);

DROP POLICY IF EXISTS "Quiz staff can create sessions" ON public.quiz_sessions;
CREATE POLICY "Quiz staff can create sessions"
ON public.quiz_sessions FOR INSERT TO authenticated
WITH CHECK (
    teacher_id = (SELECT auth.uid())
    AND (SELECT public.is_quiz_staff())
);

DROP POLICY IF EXISTS "Quiz staff can update sessions" ON public.quiz_sessions;
CREATE POLICY "Quiz staff can update sessions"
ON public.quiz_sessions FOR UPDATE TO authenticated
USING (
    teacher_id = (SELECT auth.uid())
    OR (SELECT public.is_quiz_admin())
)
WITH CHECK (
    teacher_id = (SELECT auth.uid())
    OR (SELECT public.is_quiz_admin())
);

DROP POLICY IF EXISTS "Quiz staff can delete sessions" ON public.quiz_sessions;
CREATE POLICY "Quiz staff can delete sessions"
ON public.quiz_sessions FOR DELETE TO authenticated
USING (
    teacher_id = (SELECT auth.uid())
    OR (SELECT public.is_quiz_admin())
);

DROP POLICY IF EXISTS "Quiz staff can read participants" ON public.quiz_participants;
CREATE POLICY "Quiz staff can read participants"
ON public.quiz_participants FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.quiz_sessions session
        WHERE session.id = quiz_participants.session_id
          AND (
              session.teacher_id = (SELECT auth.uid())
              OR (SELECT public.is_quiz_admin())
          )
    )
);

DROP POLICY IF EXISTS "Quiz staff can read attempt events" ON public.quiz_attempt_events;
CREATE POLICY "Quiz staff can read attempt events"
ON public.quiz_attempt_events FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.quiz_participants participant
        JOIN public.quiz_sessions session ON session.id = participant.session_id
        WHERE participant.id = quiz_attempt_events.participant_id
          AND (
              session.teacher_id = (SELECT auth.uid())
              OR (SELECT public.is_quiz_admin())
          )
    )
);

REVOKE ALL ON public.quiz_staff FROM anon, authenticated;
REVOKE ALL ON public.quiz_questions FROM anon, authenticated;
REVOKE ALL ON public.quiz_sessions FROM anon, authenticated;
REVOKE ALL ON public.quiz_participants FROM anon, authenticated;
REVOKE ALL ON public.quiz_attempt_events FROM anon, authenticated;

GRANT SELECT ON public.quiz_staff TO authenticated;
GRANT SELECT ON public.quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_sessions TO authenticated;
GRANT SELECT ON public.quiz_participants TO authenticated;
GRANT SELECT ON public.quiz_attempt_events TO authenticated;

CREATE OR REPLACE FUNCTION public.get_addmaths_student_state(p_participant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_participant public.quiz_participants%ROWTYPE;
    v_session public.quiz_sessions%ROWTYPE;
    v_questions JSONB := '[]'::JSONB;
    v_review JSONB := '[]'::JSONB;
    v_release BOOLEAN := FALSE;
    v_score INTEGER := 0;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Student authentication is required.';
    END IF;

    SELECT * INTO v_participant
    FROM public.quiz_participants
    WHERE id = p_participant_id
      AND auth_user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'This quiz attempt was not found on this device.';
    END IF;

    SELECT * INTO v_session
    FROM public.quiz_sessions
    WHERE id = v_participant.session_id;

    IF v_session.status = 'live' AND v_participant.status = 'waiting' THEN
        UPDATE public.quiz_participants
        SET status = 'active', last_active_at = NOW()
        WHERE id = v_participant.id
        RETURNING * INTO v_participant;
    END IF;

    IF v_participant.status <> 'submitted'
       AND (
           v_session.status = 'ended'
           OR (
               v_session.status = 'live'
               AND v_session.ends_at IS NOT NULL
               AND v_session.ends_at <= NOW()
           )
       ) THEN
        SELECT COUNT(*)::INTEGER INTO v_score
        FROM public.quiz_questions question
        WHERE question.id = ANY(v_participant.question_order)
          AND (v_participant.answers->>question.id::TEXT)::INTEGER = question.correct_option;

        UPDATE public.quiz_participants
        SET status = 'submitted',
            score = v_score,
            submitted_at = COALESCE(submitted_at, NOW()),
            last_active_at = NOW()
        WHERE id = v_participant.id
        RETURNING * INTO v_participant;

        INSERT INTO public.quiz_attempt_events (
            participant_id, event_type, actor_user_id, snapshot
        ) VALUES (
            v_participant.id,
            'submitted',
            v_user_id,
            jsonb_build_object('automatic', TRUE, 'answers', v_participant.answers, 'score', v_score)
        );
    END IF;

    IF v_session.status <> 'lobby' OR v_participant.status = 'submitted' THEN
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', question.id,
                    'chapter', question.chapter,
                    'chapter_name', question.chapter_name,
                    'topic', question.topic,
                    'difficulty', question.difficulty,
                    'prompt', question.prompt,
                    'options', question.options
                )
                ORDER BY array_position(v_participant.question_order, question.id)
            ),
            '[]'::JSONB
        ) INTO v_questions
        FROM public.quiz_questions question
        WHERE question.id = ANY(v_participant.question_order);
    END IF;

    v_release := (
        v_participant.status = 'submitted'
        AND (
            v_session.result_release = 'on_submit'
            OR v_session.status = 'ended'
        )
    );

    IF v_release THEN
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', question.id,
                    'correct_option', question.correct_option,
                    'explanation', question.explanation
                )
                ORDER BY array_position(v_participant.question_order, question.id)
            ),
            '[]'::JSONB
        ) INTO v_review
        FROM public.quiz_questions question
        WHERE question.id = ANY(v_participant.question_order);
    END IF;

    RETURN jsonb_build_object(
        'participant', jsonb_build_object(
            'id', v_participant.id,
            'display_name', v_participant.display_name,
            'student_ref', v_participant.student_ref,
            'status', v_participant.status,
            'answers', v_participant.answers,
            'current_index', v_participant.current_index,
            'score', v_participant.score,
            'joined_at', v_participant.joined_at,
            'last_active_at', v_participant.last_active_at,
            'submitted_at', v_participant.submitted_at
        ),
        'session', jsonb_build_object(
            'id', v_session.id,
            'code', v_session.code,
            'title', v_session.title,
            'status', v_session.status,
            'question_count', cardinality(v_session.question_ids),
            'duration_minutes', v_session.duration_minutes,
            'shuffle_options', v_session.shuffle_options,
            'allow_late_join', v_session.allow_late_join,
            'result_release', v_session.result_release,
            'starts_at', v_session.starts_at,
            'ends_at', v_session.ends_at,
            'ended_at', v_session.ended_at
        ),
        'questions', v_questions,
        'result_released', v_release,
        'review', v_review
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.join_addmaths_session(
    p_code TEXT,
    p_display_name TEXT,
    p_student_ref TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_session public.quiz_sessions%ROWTYPE;
    v_participant public.quiz_participants%ROWTYPE;
    v_order INTEGER[];
    v_join_order INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Student authentication is required.';
    END IF;

    IF char_length(TRIM(p_display_name)) < 2 THEN
        RAISE EXCEPTION 'Enter a student name with at least 2 characters.';
    END IF;

    SELECT * INTO v_session
    FROM public.quiz_sessions
    WHERE code = UPPER(TRIM(p_code));

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session code not found.';
    END IF;
    IF v_session.status = 'ended' THEN
        RAISE EXCEPTION 'This session has ended.';
    END IF;
    IF v_session.status = 'live' AND NOT v_session.allow_late_join THEN
        RAISE EXCEPTION 'This session is no longer accepting new students.';
    END IF;

    SELECT * INTO v_participant
    FROM public.quiz_participants
    WHERE session_id = v_session.id
      AND auth_user_id = v_user_id;

    IF NOT FOUND THEN
        IF (SELECT COUNT(*) FROM public.quiz_participants WHERE session_id = v_session.id) >= 50 THEN
            RAISE EXCEPTION 'This session is full.';
        END IF;

        SELECT array_agg(
            item.question_id
            ORDER BY CASE
                WHEN v_session.shuffle_questions THEN random()
                ELSE item.ordinality::DOUBLE PRECISION
            END
        ) INTO v_order
        FROM unnest(v_session.question_ids) WITH ORDINALITY AS item(question_id, ordinality);

        SELECT COALESCE(MAX(join_order), 0) + 1 INTO v_join_order
        FROM public.quiz_participants
        WHERE session_id = v_session.id;

        INSERT INTO public.quiz_participants (
            session_id, auth_user_id, display_name, student_ref,
            join_order, status, question_order
        ) VALUES (
            v_session.id,
            v_user_id,
            LEFT(TRIM(p_display_name), 50),
            NULLIF(LEFT(TRIM(COALESCE(p_student_ref, '')), 30), ''),
            v_join_order,
            CASE WHEN v_session.status = 'live' THEN 'active' ELSE 'waiting' END,
            v_order
        )
        RETURNING * INTO v_participant;
    END IF;

    RETURN public.get_addmaths_student_state(v_participant.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_addmaths_answer(
    p_participant_id UUID,
    p_question_id INTEGER,
    p_choice INTEGER,
    p_current_index INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_participant public.quiz_participants%ROWTYPE;
    v_session public.quiz_sessions%ROWTYPE;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Student authentication is required.';
    END IF;
    IF p_choice < 0 OR p_choice > 3 THEN
        RAISE EXCEPTION 'Invalid answer choice.';
    END IF;

    SELECT * INTO v_participant
    FROM public.quiz_participants
    WHERE id = p_participant_id
      AND auth_user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'This quiz attempt was not found on this device.';
    END IF;
    IF v_participant.status = 'submitted' THEN
        RAISE EXCEPTION 'This attempt has already been submitted.';
    END IF;
    IF NOT (p_question_id = ANY(v_participant.question_order)) THEN
        RAISE EXCEPTION 'This question is not part of the session.';
    END IF;

    SELECT * INTO v_session
    FROM public.quiz_sessions
    WHERE id = v_participant.session_id;

    IF v_session.status <> 'live' THEN
        RAISE EXCEPTION 'The teacher has not started this session.';
    END IF;
    IF v_session.ends_at IS NOT NULL AND v_session.ends_at <= NOW() THEN
        RAISE EXCEPTION 'Time is up for this session.';
    END IF;

    UPDATE public.quiz_participants
    SET answers = answers || jsonb_build_object(p_question_id::TEXT, p_choice),
        current_index = GREATEST(0, LEAST(p_current_index, cardinality(question_order) - 1)),
        status = 'active',
        last_active_at = NOW()
    WHERE id = v_participant.id;

    RETURN public.get_addmaths_student_state(v_participant.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_addmaths_attempt(p_participant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_participant public.quiz_participants%ROWTYPE;
    v_session public.quiz_sessions%ROWTYPE;
    v_score INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Student authentication is required.';
    END IF;

    SELECT * INTO v_participant
    FROM public.quiz_participants
    WHERE id = p_participant_id
      AND auth_user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'This quiz attempt was not found on this device.';
    END IF;
    IF v_participant.status = 'submitted' THEN
        RETURN public.get_addmaths_student_state(v_participant.id);
    END IF;

    SELECT * INTO v_session
    FROM public.quiz_sessions
    WHERE id = v_participant.session_id;

    IF v_session.status = 'lobby' THEN
        RAISE EXCEPTION 'The teacher has not started this session.';
    END IF;

    SELECT COUNT(*)::INTEGER INTO v_score
    FROM public.quiz_questions question
    WHERE question.id = ANY(v_participant.question_order)
      AND (v_participant.answers->>question.id::TEXT)::INTEGER = question.correct_option;

    UPDATE public.quiz_participants
    SET status = 'submitted',
        score = v_score,
        submitted_at = NOW(),
        last_active_at = NOW()
    WHERE id = v_participant.id
    RETURNING * INTO v_participant;

    INSERT INTO public.quiz_attempt_events (
        participant_id, event_type, actor_user_id, snapshot
    ) VALUES (
        v_participant.id,
        'submitted',
        v_user_id,
        jsonb_build_object('automatic', FALSE, 'answers', v_participant.answers, 'score', v_score)
    );

    RETURN public.get_addmaths_student_state(v_participant.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.reopen_addmaths_attempt(p_participant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_participant public.quiz_participants%ROWTYPE;
    v_session public.quiz_sessions%ROWTYPE;
    v_staff_role TEXT;
BEGIN
    SELECT role INTO v_staff_role
    FROM public.quiz_staff
    WHERE user_id = v_user_id;

    IF v_staff_role IS NULL THEN
        RAISE EXCEPTION 'Teacher access is required.';
    END IF;

    SELECT * INTO v_participant
    FROM public.quiz_participants
    WHERE id = p_participant_id
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student attempt not found.';
    END IF;

    SELECT * INTO v_session
    FROM public.quiz_sessions
    WHERE id = v_participant.session_id;

    IF v_staff_role <> 'admin' AND v_session.teacher_id <> v_user_id THEN
        RAISE EXCEPTION 'You can only manage your own sessions.';
    END IF;
    IF v_session.status <> 'live' THEN
        RAISE EXCEPTION 'Reopen the class before reopening an individual attempt.';
    END IF;
    IF v_participant.status <> 'submitted' THEN
        RAISE EXCEPTION 'This attempt is not submitted.';
    END IF;

    INSERT INTO public.quiz_attempt_events (
        participant_id, event_type, actor_user_id, snapshot
    ) VALUES (
        v_participant.id,
        'reopened',
        v_user_id,
        jsonb_build_object(
            'answers', v_participant.answers,
            'score', v_participant.score,
            'submitted_at', v_participant.submitted_at
        )
    );

    UPDATE public.quiz_participants
    SET status = 'active',
        submitted_at = NULL,
        score = 0,
        last_active_at = NOW()
    WHERE id = v_participant.id;

    RETURN jsonb_build_object('success', TRUE);
END;
$$;

REVOKE ALL ON FUNCTION public.get_addmaths_student_state(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_addmaths_session(TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_addmaths_answer(UUID, INTEGER, INTEGER, INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.submit_addmaths_attempt(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reopen_addmaths_attempt(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_addmaths_student_state(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_addmaths_session(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_addmaths_answer(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_addmaths_attempt(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reopen_addmaths_attempt(UUID) TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'quiz_participants'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_participants;
    END IF;
END;
$$;

INSERT INTO public.modules (
    id, title, syllabus, subject, bundle, grade_level, is_active
) VALUES (
    'spm-addmath-f4-live-quiz',
    'SPM Form 4 Additional Mathematics Live Quiz',
    'spm',
    'Additional Mathematics',
    'spm_form4',
    'Form 4',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    syllabus = EXCLUDED.syllabus,
    subject = EXCLUDED.subject,
    bundle = EXCLUDED.bundle,
    grade_level = EXCLUDED.grade_level,
    is_active = TRUE;

COMMIT;

-- Verification:
-- SELECT COUNT(*) FROM public.quiz_questions; -- 40
-- SELECT role, COUNT(*) FROM public.quiz_staff GROUP BY role;
-- SELECT id, code, status FROM public.quiz_sessions ORDER BY created_at DESC;
