# Interactive Course - Complete System Log & Architecture

This document serves as the **Technical Reference (System Log)** for the Interactive Course platform. It outlines the core architecture, data flow, directory structure, and database schema. 
Any Agent working on this project should read this document to understand how the system operates.

---

## 🏗️ 1. System Architecture Overview

The platform is designed as a **Static Site with dynamic serverless capabilities**. 
- **Frontend:** Pure HTML / CSS / Vanilla JavaScript. No heavy frontend frameworks (React/Vue/Angular) are used in the core engine, ensuring blazing-fast load times.
- **Backend/Database:** **Supabase** (PostgreSQL, Auth, RLS Policies).
- **Design System:** **Neoglass UI** (Obsidian dark `#080c14`, frosted glass `backdrop-filter: blur(16px)`, subject-specific neon glows).

---

## 📁 2. Directory Structure

```text
interactive-course-main/
│
├── index.html                  # The Grand Landing Page (Main Hub)
├── DEVELOPMENT_LOG.md          # Tracks ongoing progress, resolved/pending issues
├── HOW_TO_ADD_A_NEW_MODULE.md  # SOP for adding new interactive content
│
├── content/                    # 📚 The Core Syllabus Structure
│   ├── IGCSE_Syllabus/         # Separated by Curriculum -> Level -> Subject -> Topic
│   ├── KSSR_Syllabus/
│   ├── SPM_Syllabus/
│   ├── Singapore_Syllabus/
│   └── UEC_Syllabus/
│       └── .../index.html      # EVERY module is named `index.html` for clean URLs
│
├── js/                         # 🧠 Core System Logic (Client-Side SDKs)
│   ├── auth-access.js          # Supabase Auth Client, PIN validation, route guarding
│   ├── progress-tracker.js     # Progress API (Debounced Auto-save, Load state)
│   └── feedback.js             # Handles user feedback and subject requests
│
├── db/                         # 🗄️ Database Definitions & Migrations
│   ├── schema.sql              # Master table schemas and RLS policies
│   └── migrations/             # Incremental updates (e.g., cascade deletes, auth triggers)
│
├── _drafts/                    # Holding area for raw/unprocessed HTML or PDF modules
└── *.py / *.js (Root Scripts)  # Mass-patching DOM scripts (e.g., fix_modules_batch.py)
```

---

## 🗄️ 3. Database Schema (Supabase PostgreSQL)

The system relies on a relational schema with Row Level Security (RLS). Key tables include:

1. `user_profiles`:
   - Auto-generated via the `handle_new_user()` trigger upon Supabase Auth signup.
   - Contains `role` (Admin or Student) and self-healing mechanisms if accidentally deleted.
2. `modules`:
   - The canonical registry of all modules.
   - `id` corresponds to the `data-module-id` in the HTML (e.g., `spm-bm-kesalahan`).
3. `activation_pins`:
   - Links an access PIN to a specific module or bundle. Admins can generate these.
   - **Cascade delete** is enabled: deleting a user deletes their PIN redemptions.
4. `student_progress`:
   - Stores a JSON payload of the student's progress for a specific `module_id`.
   - Updated continuously by `progress-tracker.js`.
5. `user_feedback`:
   - Stores feature requests and bug reports submitted via the frontend feedback modal.

---

## ⚙️ 4. The 5 Pillars of a Module (Data Flow)

Whenever a new module is added to `content/`, it must adhere to 5 technical pillars:

1. **Storage (Routing):** Resides in its own folder and must be named `index.html`.
2. **Global Navigation (Entry):** Must have a card in the root `index.html`. If it has downloadable PDFs, the `<a class="card">` must be wrapped in a layout grid to avoid nesting <a> tags.
3. **Local Navigation (Exit):** Must contain a `<a class="home-btn-fixed">` that uses exact relative paths (e.g., `../../../../index.html`) back to the root.
4. **State Management (Memory):** Must import `progress-tracker.js` and contain a `<script>` tag with:
   - `data-module-id="unique-id"`
   - `ProgressTracker.init(async (tracker) => { ... })`
   - `ProgressTracker.autoSave({ state }, 1500)`
5. **Security Registry (The Lock):** The `data-module-id` must be `INSERT`ed into the `public.modules` table via `modules_registry.sql` in Supabase, otherwise Admins cannot generate PINs for it. The first module of any syllabus is automatically treated as a Free Preview.

---

## 🛠️ 5. Automation & Patching

Because there are thousands of static `index.html` files inside `content/`, manual editing is impossible.
We use Python and Node.js (`jsdom`) scripts to mass-patch HTML files.
- **`check_home_buttons.py`**: Scans the depth of all modules to ensure the `../../../index.html` strings are perfectly accurate.
- **`fix_modules_batch.py`**: Parses DOM elements across all subfolders to inject `<script>` tags, patch UI issues, or update classes.

*Note: Always ensure batch operations are committed via `git` before executing.*
