# Kedah 2025 Kertas 2 teacher publication

Date: 2026-08-30

Decision: Publish the Kedah teacher deck as the protected module `spm-chem-f5-kedah-2025-k2-teacher`, using the existing launcher, shared access scripts, central navigation, and Supabase progress tracker already used by the Johor teacher deck.

The public repository contains only the transformed HTML, 32 original question-page images, and five marking-scheme crops required for staged teaching. The source question and marking-scheme PDFs remain in GregOS and are not published. Answers appear in English, explanations in Chinese, and all eight calculations retain labelled, line-by-line working.

The module uses an indigo-and-amber theme to distinguish Kedah from Johor while preserving the verified 1920×1080 layout and interaction model. Rollback consists of removing the module directory, portal card, manifest entry, verifier command, and registry migration before deployment; after database deployment, the registry row should instead be deactivated through a follow-up migration.
