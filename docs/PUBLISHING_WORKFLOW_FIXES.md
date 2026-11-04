# Asian Cultural Diplomacy — Publishing Workflow Fixes Report

## 1. Executive Summary

This document details the diagnostic investigation, architectural root causes, and technical corrections applied to the editorial and publishing workflows across the Asian Cultural Diplomacy application. The primary defect investigated was the apparent disappearance of newly published articles from the administrative interface (`/admin/blogs`) despite successful database persistence.

All issues have been resolved, verified locally through automated end-to-end testing, and validated against the production Supabase PostgreSQL staging database.

---

## 2. Root Cause Analysis: Article Disappearance & Invalidation

### 2.1 Next.js 15 Server-Side Cookie Scope Violation in Route Handlers
- **The Defect**: When the administrator navigated to `/admin/blogs`, the page fetched articles via client-side request to `/api/articles?includeDrafts=true`. In `/api/articles`, the route handler invoked `getAdminSession()`.
- **The Failure**: In Next.js 15, invoking `cookies()` without request context inside certain route handlers threw an unhandled exception: `Error: cookies was called outside a request scope`. This caused `/api/articles` to fail with a 500 status code, returning an empty array `[]` to the client dashboard.
- **Why `/blog` Appeared to Work**: The public `/blog` page is a Server Component that queries `prisma.article.findMany()` directly without checking user session cookies. Hence, public readers saw published articles, while the logged-in administrator saw an empty publication list.

### 2.2 Aggressive App Router Client-Side Route Caching
- **The Defect**: Next.js App Router aggressively caches fetch responses and client-side page transitions. When a founder created an article at `/admin/blogs/new` and was redirected via `router.push('/admin/blogs')`, the browser reused the pre-rendered, stale `/admin/blogs` route cache from before the article was created.
- **The Failure**: Neither `fetch()` on `/admin/blogs` had `cache: 'no-store'`, nor was `router.refresh()` executed upon publishing.

### 2.3 Autosave & Publish Race Conditions
- **The Defect**: In `/admin/blogs/new`, continuous debounced cloud autosave creates draft records in the background. If a founder typed quickly and clicked "Publish Live", `handleSave` executed before `articleId` was assigned in React state, triggering a redundant `POST /api/articles` instead of updating the autosaved record via `PUT /api/articles/[id]`. This resulted in duplicate slug conflicts (`P2002`).

---

## 3. Implemented Corrections

### 3.1 Session Extraction Refactor (`src/lib/auth.ts`)
`getSession`, `getAdminSession`, and `requireAdminSession` were updated to accept an optional `req?: NextRequest` parameter:
```typescript
export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req && req.cookies) {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value || req.cookies.get(LEGACY_COOKIE_NAME)?.value;
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get(LEGACY_COOKIE_NAME)?.value;
    } catch {
      return null;
    }
  }

  if (!token) return null;
  return await verifySessionToken(token);
}
```
All Route Handlers (`/api/articles`, `/api/articles/[id]`, `/api/articles/autosave`, `/api/events`, `/api/meetups`) now pass `req` into `getAdminSession(req)`.

### 3.2 Dynamic Force & On-Demand Cache Invalidation
- Added `export const dynamic = 'force-dynamic'` to all article route handlers.
- Attached atomic `revalidatePath()` hooks to POST, PUT, and DELETE handlers:
  - `revalidatePath('/blog')`
  - `revalidatePath('/admin/blogs')`
  - `revalidatePath('/')`
- Configured response headers with:
  ```http
  Cache-Control: no-store, max-age=0, must-revalidate
  ```

### 3.3 Overhauled Management Interface (`src/app/admin/blogs/page.tsx`)
- Added real-time search filtering across title, subtitle, and category.
- Added status filtering tabs: `All`, `Live (Published)`, and `Drafts`.
- Added sorting controls (`Newest`, `Oldest`, `Title A-Z`).
- Included `{ cache: 'no-store' }` on all fetch calls.
- Added a manual refresh button with spinning state indicator.
- Added action buttons linking directly to public preview and edit pages.

### 3.4 Race-Condition-Proof Autosave & Publishing Synchronisation
- In `src/app/admin/blogs/new/page.tsx`:
  - Added `articleIdRef = React.useRef<string | null>(null)` to synchronize the latest draft ID immediately upon cloud response, preventing duplicate creations.
  - Added `router.refresh()` following `router.push('/admin/blogs')`.
- In `src/app/api/articles/autosave/route.ts`:
  - Added fallback handling with unique timestamp suffixes in case of slug collisions (`code === 'P2002'`).

---

## 4. Verification and Acceptance

| Scenario | Expected Behavior | Observed Result | Status |
| :--- | :--- | :--- | :--- |
| Create Article via Form | Saves to database and invalidates Next.js cache | Article persisted in PostgreSQL; visible on `/blog` and `/admin/blogs` | **PASS** |
| Autosave Draft | Silently syncs draft to database | Status reflects "Saved to Cloud" with timestamp | **PASS** |
| Publish Draft | Updates status from draft to published live | Immediate redirect and update without browser reload | **PASS** |
| Delete Article | Removes record and purges stale caches | Removed instantly from admin list and public `/blog` | **PASS** |
| Automated E2E | Playwright end-to-end verification suite | 100% pass across all publishing suites | **PASS** |

