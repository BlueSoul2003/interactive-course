# Private PDF Library Guide

`notes.html` is an account-protected PDF library. Catalogue metadata lives in the Supabase `pdf_resources` table and every PDF binary lives in the private `course-pdfs` Storage bucket.

## Access levels

- Student, Parent, and Guest accounts can read rows marked `member`.
- Admin accounts can read the complete catalogue, including teacher answers and source documents.
- View and Download create short-lived signed URLs. No permanent public PDF URL is stored in the site.
- Only an authenticated admin can request a signed upload token from `pdf-library-admin`.

## SSD source of truth

PDF binaries must stay outside this GitHub repository in the GregOS SSD-only archive. The archive keeps each original relative path so the admin import tool can match a selected folder to the private catalogue.

## Admin import

1. Sign in to `notes.html` with the Admin account.
2. Select the SSD archive folder in **Admin PDF import**.
3. Confirm the matched file count.
4. Choose **Upload matched PDFs** and keep the page open until it finishes.

The browser uploads each matched PDF directly to private Storage. Student, Parent, and Guest accounts never receive upload permission.

## Verify before publishing

```bash
npm run verify:pdf-library
```

The check fails if a PDF, public catalogue, direct PDF link, or missing private-library control is found in the public repository.
