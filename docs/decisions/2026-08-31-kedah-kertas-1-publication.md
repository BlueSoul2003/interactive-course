# Kedah 2025 Kertas 1 publication

Date: 2026-08-31

Decision: Publish the Kedah student drill as the protected launcher module `spm-chem-f5-kedah-2025-k1`, using the shared access scripts, central navigation, and Supabase progress tracker already used by the Johor Kertas 1 drill.

The public repository contains only the transformed interactive HTML and 28 original question-page images. The source question PDF and marking-scheme PDF remain in GregOS and are not published. The 40 answer letters were checked against the source scheme; no scheme page is exposed to students.

The module preserves the Kedah indigo-and-amber theme. Mobile portrait uses independent upper-paper and lower-answer panes, while mobile landscape uses left-paper and right-answer panes. Same-page question changes preserve the paper position; source-page changes return the paper to the top. Rollback consists of removing the module directory, portal card, manifest entry, verifier command, registry migration, and this record before deployment; after database deployment, deactivate the registry row through a follow-up migration.