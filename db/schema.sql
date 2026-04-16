-- =======================================================================================
-- db/schema.sql
-- THE SINGLE SOURCE OF TRUTH for the interactive-course Supabase database.
--
-- Run this ONCE (or re-run idempotently) in your Supabase SQL Editor.
-- It covers every table, RLS policy, stored function, and seed data needed.
--
-- Sections:
--   1. user_profiles table patches
--   2. activation_pins table
--   3. modules registry table
--   4. Row-Level Security (RLS) policies
--   5. redeem_activation_pin() RPC (v3: context-aware, JSONB response)
--   6. Module seed data (single source of truth)
-- =======================================================================================


-- ──────────────────────────────────────────────────────────────────
-- SECTION 1: user_profiles patches
-- ──────────────────────────────────────────────────────────────────

-- 1a. Add unlocked_modules column if it doesn't exist yet
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'user_profiles'
          AND column_name  = 'unlocked_modules'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN unlocked_modules TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 1b. RLS: Users can INSERT their own profile row (required on registration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename  = 'user_profiles'
          AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
        ON public.user_profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 1c. RLS: Users can UPDATE their own profile row (required for upsert / demographic data)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename  = 'user_profiles'
          AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
        ON public.user_profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;


-- ──────────────────────────────────────────────────────────────────
-- SECTION 2: activation_pins table
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.activation_pins (
  pin_code         VARCHAR(50)              PRIMARY KEY,
  modules_to_unlock TEXT[]                  NOT NULL,
  is_used          BOOLEAN                  DEFAULT FALSE,
  -- References auth.users directly to avoid FK issues if profiles sync slowly
  used_by          UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
  used_at          TIMESTAMP WITH TIME ZONE NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activation_pins ENABLE ROW LEVEL SECURITY;


-- ──────────────────────────────────────────────────────────────────
-- SECTION 3: modules registry table
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.modules (
  id           TEXT        PRIMARY KEY,   -- canonical module ID e.g. 'spm-en-social-media'
  title        TEXT        NOT NULL,      -- human-readable name shown in admin UI
  syllabus     TEXT        NOT NULL,      -- 'spm' | 'uec' | 'igcse' | 'sg' | 'kssr'
  subject      TEXT        NOT NULL,      -- 'english' | 'bm' | 'math' | 'science'
  bundle       TEXT        NOT NULL,      -- unlockable bundle key e.g. 'spm_form5'
  grade_level  TEXT        NOT NULL,      -- 'Form5' | 'Senior' | 'Year4' | 'Primary3' etc.
  is_active    BOOLEAN     DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;


-- ──────────────────────────────────────────────────────────────────
-- SECTION 4: Row-Level Security policies (idempotent)
-- ──────────────────────────────────────────────────────────────────

-- modules table ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view modules"   ON public.modules;
CREATE POLICY "Anyone can view modules" ON public.modules
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL
  USING      ((SELECT tier FROM public.user_profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT tier FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- activation_pins table ────────────────────────────────────────────
-- Remove any legacy policies before recreating the single unified one
DO $$
BEGIN
  BEGIN DROP POLICY "Admins can insert PINs"            ON public.activation_pins; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY "Admins can view PINs"              ON public.activation_pins; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY "Admins can manage activation pins" ON public.activation_pins; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

CREATE POLICY "Admins can manage activation pins"
ON public.activation_pins
FOR ALL
USING (
  (SELECT tier FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT tier FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);


-- ──────────────────────────────────────────────────────────────────
-- SECTION 5: redeem_activation_pin() RPC  (v3 — context-aware)
--
-- Changes vs. v2 (modules_registry.sql):
--   • Accepts an optional p_target_module parameter so the frontend
--     can pass the ID of the card the student clicked.
--   • If supplied, the PIN is validated against syllabus / bundle /
--     exact module ID before being redeemed, giving a friendly error
--     ("This PIN is for X — please navigate to that module").
--   • Returns JSONB: { success, newly_unlocked, all_unlocked }
-- ──────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS redeem_activation_pin(VARCHAR);
DROP FUNCTION IF EXISTS redeem_activation_pin(VARCHAR, VARCHAR);

CREATE OR REPLACE FUNCTION redeem_activation_pin(
  p_pin_code      VARCHAR,
  p_target_module VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id           UUID;
  v_modules_to_unlock TEXT[];
  v_current_modules   TEXT[];
  v_new_modules       TEXT[];
  v_invalid_ids       TEXT[];
  v_mod_id            TEXT;
  v_target_syllabus   TEXT;
  v_target_bundle     TEXT;
  v_matches_context   BOOLEAN;
  v_intended_titles   TEXT;
BEGIN
  -- 1. Must be authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Lock PIN row and fetch module list (reject used/missing PINs)
  SELECT modules_to_unlock INTO v_modules_to_unlock
  FROM public.activation_pins
  WHERE pin_code = p_pin_code AND is_used = FALSE
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or already used PIN';
  END IF;

  -- 3. CONTEXT CHECK: if a target module was provided, verify this PIN unlocks it
  IF p_target_module IS NOT NULL THEN
    SELECT syllabus, bundle
    INTO v_target_syllabus, v_target_bundle
    FROM public.modules
    WHERE id = p_target_module;

    v_matches_context := FALSE;
    IF '*' = ANY(v_modules_to_unlock) THEN
      v_matches_context := TRUE;
    ELSIF p_target_module = ANY(v_modules_to_unlock) THEN
      v_matches_context := TRUE;
    ELSIF v_target_bundle = ANY(v_modules_to_unlock) THEN
      v_matches_context := TRUE;
    ELSIF v_target_syllabus = ANY(v_modules_to_unlock) THEN
      v_matches_context := TRUE;
    END IF;

    IF NOT v_matches_context THEN
      SELECT string_agg(title, ', ') INTO v_intended_titles
      FROM public.modules
      WHERE id = ANY(v_modules_to_unlock)
         OR bundle   = ANY(v_modules_to_unlock)
         OR syllabus = ANY(v_modules_to_unlock);

      IF v_intended_titles IS NULL THEN
        v_intended_titles := array_to_string(v_modules_to_unlock, ', ');
      END IF;

      RAISE EXCEPTION 'PIN_MISMATCH: This PIN is meant for "%". Please navigate to the correct module to unlock it.', v_intended_titles;
    END IF;
  END IF;

  -- 4. Validate every module ID in the PIN against the active registry
  v_invalid_ids := ARRAY[]::TEXT[];
  FOREACH v_mod_id IN ARRAY v_modules_to_unlock LOOP
    IF v_mod_id <> '*' AND NOT EXISTS (
      SELECT 1 FROM public.modules WHERE id = v_mod_id AND is_active = TRUE
    ) THEN
      v_invalid_ids := array_append(v_invalid_ids, v_mod_id);
    END IF;
  END LOOP;

  IF array_length(v_invalid_ids, 1) > 0 THEN
    RAISE EXCEPTION 'PIN contains invalid module IDs: %', array_to_string(v_invalid_ids, ', ');
  END IF;

  -- 5. Mark PIN as used
  UPDATE public.activation_pins
  SET is_used = TRUE, used_by = v_user_id, used_at = NOW()
  WHERE pin_code = p_pin_code;

  -- 6. Fetch current user's unlocked modules
  SELECT unlocked_modules INTO v_current_modules
  FROM public.user_profiles WHERE id = v_user_id;

  IF v_current_modules IS NULL THEN
    v_current_modules := '{}'::TEXT[];
  END IF;

  -- 7. Merge arrays, removing duplicates
  SELECT ARRAY(
    SELECT DISTINCT unnest(v_current_modules || v_modules_to_unlock)
  ) INTO v_new_modules;

  -- 8. Persist the updated unlocked list
  UPDATE public.user_profiles
  SET unlocked_modules = v_new_modules
  WHERE id = v_user_id;

  -- 9. Return rich JSON so the frontend knows exactly what was unlocked
  RETURN jsonb_build_object(
    'success',        TRUE,
    'newly_unlocked', to_jsonb(v_modules_to_unlock),
    'all_unlocked',   to_jsonb(v_new_modules)
  );
END;
$$;


-- ──────────────────────────────────────────────────────────────────
-- SECTION 6: Module seed data (single source of truth)
-- Re-running this file is safe — TRUNCATE clears old data first.
-- ──────────────────────────────────────────────────────────────────
TRUNCATE TABLE public.modules;

INSERT INTO public.modules (id, title, syllabus, subject, bundle, grade_level) VALUES

-- ── SPM English (Form 5) ──────────────────────────────────────────
('spm-en-social-media',        'Social Media Masterclass',                    'spm', 'english', 'spm_form5', 'Form5'),
('spm-en-dream-holiday',       'My Dream Holiday',                            'spm', 'english', 'spm_form5', 'Form5'),
('spm-en-storytellers-toolkit','The Storyteller''s Toolkit',                  'spm', 'english', 'spm_form5', 'Form5'),
('spm-en-advice-expert',       'The Advice Expert',                           'spm', 'english', 'spm_form5', 'Form5'),
('spm-en-speech-writing',      'The Public Speaker',                          'spm', 'english', 'spm_form5', 'Form5'),

-- ── SPM Bahasa Melayu (Form 5) ────────────────────────────────────
('spm-bm-kesalahan-ejaan',     'Sistem特訓: 錯別字 Debug',                    'spm', 'bm',      'spm_form5', 'Form5'),
('spm-bm-peribahasa',          'Peribahasa Mastery',                          'spm', 'bm',      'spm_form5', 'Form5'),
('spm-bm-kata-terbitan',       'Morfologi Mastery',                           'spm', 'bm',      'spm_form5', 'Form5'),
('spm-bm-komsas-novel',        'Novel Silir Daksina (Interactive)',            'spm', 'bm',      'spm_form5', 'Form5'),
('spm-bm-karangan',            'Modul Karangan SPM 1',                        'spm', 'bm',      'spm_form5', 'Form5'),
('spm-bm-rumusan',             'Rumusan 极简通关训练',                          'spm', 'bm',      'spm_form5', 'Form5'),
('spm-bm-reading-comprehension','SPM 阅读理解黑客 V7',                          'spm', 'bm',      'spm_form5', 'Form5'),
('spm-bm-imbuhan-alchemy',     'Imbuhan Alchemy (词缀炼金术)',                  'spm', 'bm',      'spm_form5', 'Form5'),

-- ── SPM Mathematics (Form 2) ──────────────────────────────────────
('spm-math-kssm-revision1',    'KSSM Form 2 Math: Intensive Revision 1',      'spm', 'math',    'spm_form2', 'Form2'),

-- ── UEC English (Senior) ──────────────────────────────────────────
('uec-en-reading',             'Reading Comprehension',                       'uec', 'english', 'uec_senior', 'Senior'),
('uec-en-grammar',             'Grammar & Usage',                             'uec', 'english', 'uec_senior', 'Senior'),
('uec-en-summary',             'Summary Writing',                             'uec', 'english', 'uec_senior', 'Senior'),
('uec-en-discovery-journey',   'The Discovery Journey',                       'uec', 'english', 'uec_senior', 'Senior'),
('uec-en-teen-ceo',            'Teen CEO Simulator Pro',                      'uec', 'english', 'uec_senior', 'Senior'),
('uec-en-ai-cofounder',        'The AI Co-Founder Simulator',                 'uec', 'english', 'uec_senior', 'Senior'),
('uec-en-pricing-strategy',    'The Profit Playbook Pro',                     'uec', 'english', 'uec_senior', 'Senior'),
('uec-en-master-negotiator',   'The Master Negotiator',                       'uec', 'english', 'uec_senior', 'Senior'),
('uec-en-rich-teen-simulator', 'Rich Teen Simulator',                         'uec', 'english', 'uec_senior', 'Senior'),

-- ── IGCSE Science Year 4 ──────────────────────────────────────────
('igcse-y4-sci-topic1',        'Topic 1: Life Processes & Ecosystems',        'igcse', 'science', 'igcse_y4_science', 'Year4'),
('igcse-y4-sci-topic2',        'Topic 2: Living Things in Their Environment', 'igcse', 'science', 'igcse_y4_science', 'Year4'),
('igcse-y4-sci-topic3',        'Topic 3: States of Matter',                  'igcse', 'science', 'igcse_y4_science', 'Year4'),
('igcse-y4-sci-topic4',        'Topic 4: Energy and Light',                  'igcse', 'science', 'igcse_y4_science', 'Year4'),
('igcse-y4-sci-topic5',        'Topic 5: Electricity and Circuits',          'igcse', 'science', 'igcse_y4_science', 'Year4'),
('igcse-y4-sci-topic6',        'Topic 6: Planet Earth',                      'igcse', 'science', 'igcse_y4_science', 'Year4'),
('igcse-y4-sci-topic7',        'Topic 7: Earth and Space',                   'igcse', 'science', 'igcse_y4_science', 'Year4'),

-- ── IGCSE Science Year 8 ──────────────────────────────────────────
('igcse-y8-sci-ch1',           'Chapter 1: Respiration & Breathing',         'igcse', 'science', 'igcse_y8_science', 'Year8'),
('igcse-y8-sci-ch2',           'Chapter 2: Properties of Materials',         'igcse', 'science', 'igcse_y8_science', 'Year8'),
('igcse-y8-sci-ch3',           'Chapter 3: Forces and Energy',               'igcse', 'science', 'igcse_y8_science', 'Year8'),
('igcse-y8-sci-ch4',           'Chapter 4: Ecosystems',                      'igcse', 'science', 'igcse_y8_science', 'Year8'),

-- ── Singapore Math Year 4 ─────────────────────────────────────────
('sg-y4-math-whole-number',    'Chapter 2: Whole Numbers (Part 2)',           'sg', 'math', 'sg_y4_math', 'Year4'),
('sg-y4-math-review1',         'Review 1: Whole Numbers Review',             'sg', 'math', 'sg_y4_math', 'Year4'),
('sg-y4-math-pokemon-gym',     'Chapter 3: Whole Numbers (Part 3)',           'sg', 'math', 'sg_y4_math', 'Year4'),
('sg-y4-math-data-graphs',     'Chapter 4: Data & Graphs (Campaign)',         'sg', 'math', 'sg_y4_math', 'Year4'),
('sg-y4-math-fractions',       'Chapter 5: Fraction Quest',                  'sg', 'math', 'sg_y4_math', 'Year4'),
('sg-y4-math-angles',          'Chapter 6: Angle Quest',                     'sg', 'math', 'sg_y4_math', 'Year4'),

-- ── KSSR English Primary 3 ────────────────────────────────────────
('kssr-p3-en-unit1',           'Unit 1: Getting Smart',                      'kssr', 'english', 'kssr_p3_english', 'Primary3'),
('kssr-p3-en-unit2',           'Unit 2: City Heroes',                        'kssr', 'english', 'kssr_p3_english', 'Primary3'),
('kssr-p3-en-unit3',           'Unit 3: Housework',                          'kssr', 'english', 'kssr_p3_english', 'Primary3'),

-- ── KSSR English Primary 6 ────────────────────────────────────────
('kssr-p6-en-unit1',           'Unit 1: Scenario Practice',                  'kssr', 'english', 'kssr_p6_english', 'Primary6'),
('kssr-p6-en-unit2',           'Unit 2: Interactive Reading',                'kssr', 'english', 'kssr_p6_english', 'Primary6'),
('kssr-p6-en-unit3',           'Unit 3: Outdoor Activities',                 'kssr', 'english', 'kssr_p6_english', 'Primary6');

-- ──────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES (run manually after applying):
--   SELECT COUNT(*) FROM public.modules;         -- should be 40
--   SELECT id FROM public.modules ORDER BY id;   -- full alphabetical list
--   SELECT COUNT(*) FROM public.activation_pins; -- 0 if you wiped old PINs
-- ──────────────────────────────────────────────────────────────────
