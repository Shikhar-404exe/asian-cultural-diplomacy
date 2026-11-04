# Final Functional Audit: Publishing Repair, Admin Sync, Data Cleanup, Ownership & Cloud Operations

**Date**: November 4, 2026  
**System**: Asian Cultural Diplomacy Platform (`asian-cultural-diplomacy.vercel.app`)  
**Scope**: End-to-end audit of editorial publishing, administrative synchronisation, events and meetups publishing, data persistence, and founder ownership.

---

## 1. Executive Summary

This audit investigates and documents the root causes for the functional defects identified in the Asian Cultural Diplomacy production application following its initial deployment to Vercel and connection to Supabase PostgreSQL:

1. **Article Management Synchronisation Failure**: Published articles successfully appear on the public `/blog` route, but fail to populate in the administrator's `/admin/blogs` management interface.
2. **Event Publishing Form Loop**: Creating an event in `/admin/events` triggers a publishing indicator but fails silently, resets/retains the form without error notification, and fails to persist to the public `/events` catalog.
3. **Meetup Publishing & Missing Detail Pages**: Meetup publishing experiences the same silent-failure pattern, and the individual detail route `/meetups/[slug]` is completely missing from the application.
4. **Mock and Test Data Infiltration**: Local automated test runs created temporary test accounts (`reader_*@culturaltest.org`), mock test inquiries (`delegate*@culturaldiplomacy.test`), and duplicate test draft articles in the production database.
5. **Organizational Ownership & Identity**: Ensuring absolute clarity that Asian Cultural Diplomacy belongs exclusively to the founder (the user's sister), and removing all ambiguous developer or placeholder references from all public, metadata, and editorial surfaces.

---

## 2. Root Cause Analysis

### 2.1 Issue: Published Articles Disappearing from Administrator Management (`/admin/blogs`)

#### Architecture Comparison: Public `/blog` vs. Admin `/admin/blogs`

| Route | Execution Type | Data Fetching Mechanism | Session Requirement | Caching Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Public `/blog`** | Server Component (`async function BlogPage`) | Direct Prisma Query (`prisma.article.findMany`) | None (`isPublished: true`) | Dynamic (`revalidate = 0`) |
| **Admin `/admin/blogs`** | Client Component (`'use client'`) | Client `fetch('/api/articles?includeDrafts=true')` | Requires `ADMIN` Session | Unspecified client-side cache |

#### Root Causes Identified:
1. **Next.js 15 Cookie Store in Route Handlers**:
   - In `src/lib/auth.ts`, `getSession()` calls `await cookies()` from `next/headers` without passing `req: NextRequest`.
   - In Next.js 15 route handlers, calling `cookies()` outside a server action or server component context throws:
     `Error: cookies was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`
   - When `/api/articles?includeDrafts=true` was called by `/admin/blogs`, `getAdminSession()` threw this unhandled exception or failed to read `req.cookies`, causing `/api/articles` to return HTTP 500 `{ error: 'Failed to fetch articles' }`.
   - Because `ManageBlogsPage` used `if (data.articles) setArticles(data.articles)`, the 500 response left `articles` as an empty array (`[]`).
   - Meanwhile, `/blog` queried Prisma directly on the server without calling `getAdminSession()`, so published articles appeared publicly while remaining completely invisible to the admin!

2. **HTTP and App Router Cache Stagnation**:
   - `src/app/api/articles/route.ts` lacked `export const dynamic = 'force-dynamic'` and `Cache-Control: no-store`.
   - In Next.js App Router, client-side transitions via `router.push('/admin/blogs')` served stale GET payloads from browser cache.
   - When an article was published, `revalidatePath('/admin/blogs')` and `revalidatePath('/blog')` were never called.

3. **Autosave Race Condition & Duplicate Creation**:
   - In `/admin/blogs/new`, a 2500ms debounce timer triggers `/api/articles/autosave`.
   - If the administrator clicked "Publish Live" while autosave was in flight or before `articleId` was committed to React state, `handleSave` executed `POST /api/articles` (creating a new published record) while the background autosave created a draft record. This resulted in two distinct records for the same essay.

---

### 2.2 Issue: Event Publishing Form Loop and Public Absence

#### Root Causes Identified:
1. **Silent Error Swallowing in Admin Client Form**:
   - In `src/app/admin/events/page.tsx` line 91:
     ```ts
     if (res.ok) {
       setShowModal(false);
       // reset fields...
       fetchEvents();
     }
     // NO else block! NO alert, banner, or error feedback!
     ```
   - When `/api/events` returned an error (e.g. 401 session failure, validation error, or 500), the form silently remained on the screen and reset the button from "Publishing..." to "Publish Event", giving the appearance of a loop.
2. **Date Serialization & Timezone Vulnerability**:
   - `startDate: new Date(startDate).toISOString()` throws an uncaught JavaScript `RangeError: Invalid time value` if the user leaves `startDate` formatted as an incomplete string from some browser inputs, crashing the submission handler before `fetch` was even called.
3. **Missing Route Cache Invalidation**:
   - `POST /api/events` did not call `revalidatePath('/events')` or `revalidatePath('/')`.

---

### 2.3 Issue: Meetup Publishing and Missing Detail Page (`/meetups/[slug]`)

#### Root Causes Identified:
1. **Missing Dynamic Route**:
   - The route `src/app/meetups/[slug]/page.tsx` did not exist anywhere in the project. Clicking or navigating to a meetup URL resulted in a 404 Not Found.
2. **Identical Silent-Failure Pattern**:
   - `src/app/admin/meetups/page.tsx` also had `if (res.ok)` without an `else` branch, silently masking backend rejections.
3. **Session Verification in API**:
   - Same `cookies()` vs `req.cookies` discrepancy in `/api/meetups` causing 401/500 responses when called from the client component.

---

### 2.4 Issue: Mock, Test, and Artifact Data Inventory

Inspection of Supabase PostgreSQL revealed:
- **Test Reader Accounts**: 6 accounts generated with `@culturaltest.org` from local Playwright tests.
- **Test Inquiries**: 4 enquiries generated with `@culturaldiplomacy.test` from automated tests.
- **Duplicate/Test Articles**: 6 articles created with timestamped titles during tests.
- **Genuine Records to Preserve**:
  - Founder Admin (`founder@asianculturaldiplomacy.org`)
  - 5 Core Categories ("Diplomatic Essays", "Art & Heritage", "Regional Dialogues", "Cultural Policy", "Perspectives & Reflections")
  - Real Site Settings (Mission, Vision, Objectives, Philosophy, Tagline)
  - Authentic Media Items (Sister's Moon Bridge, Sister's Courtyard Pavilion, Mount Fuji & Sakura)

---

### 2.5 Issue: Founder Ownership and Attribution Audit

- The organisation belongs strictly to the user's sister as the Founder and Director.
- All public pages, metadata, and editorial default fields must represent the founder's authentic voice and identity.
- No personal or developer identities may be associated with the organization's founder, owner, or public representative role.
- Technical developer credits, if any, must be confined strictly to repository-level and internal configuration.

---

## 3. Corrective Action Plan

1. **Authentication Session Engine (`src/lib/auth.ts`)**:
   - Update `getSession(req?: NextRequest)` and `getAdminSession(req?: NextRequest)` to check `req.cookies` first with seamless fallback to `cookies()`.
   - Prevent any unhandled request store exceptions in API Route Handlers.
2. **Article Management & Synchronisation (`/admin/blogs` & `/api/articles`)**:
   - Add `export const dynamic = 'force-dynamic'` and `Cache-Control: no-store, max-age=0` to all article API routes.
   - Refactor `src/app/admin/blogs/page.tsx` with dedicated Status Tabs (All, Published/Live, Drafts), live title search, sorting controls, and visual error states.
   - Add atomic `revalidatePath` calls across `/blog`, `/blog/[slug]`, and `/admin/blogs`.
   - Synchronize autosave in `/admin/blogs/new` to prevent duplicate record generation.
3. **Events Publishing (`/admin/events` & `/api/events`)**:
   - Add robust date validation, error banner reporting, automatic modal dismissal, list refresh, and `revalidatePath('/events')`.
   - Support edit and unpublish actions in event management.
4. **Meetups Publishing & Route Creation**:
   - Create `src/app/meetups/[slug]/page.tsx` for full standalone meetup details with RSVP, venue instructions, and agenda.
   - Fix `/admin/meetups` form submission, error reporting, and list synchronization.
5. **Database Cleanup Script**:
   - Execute backup to `backups/pre_cleanup_backup_*.json`.
   - Safely remove confirmed Playwright test artifacts while preserving founder admin, categories, settings, and media.
6. **Automated E2E Verification & Cloud Deployment**:
   - Expand Playwright test suite to verify the complete 23-point acceptance matrix.
   - Commit, push to GitHub, and trigger verified Vercel production deployment.

