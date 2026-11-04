# Production Launch & Go-Live Checklist

**Platform:** Asian Cultural Diplomacy  
**Domain:** `asianculturaldiplomacy.org`  
**Hosting Target:** Vercel (Edge Network) + Supabase (Managed PostgreSQL & Object Storage)  
**Status:** Pre-Launch Staging Complete — Awaiting Final Founder Approval  

---

## 1. Core Architectural Sign-Off

| Milestone | Target State | Pre-Launch Audit Status |
|---|---|---|
| **Production Database** | Supabase PostgreSQL with Connection Pooling | Migration script verified with pre-migration snapshot |
| **Administrator Provisioning** | Dynamic `ADMIN_EMAIL` match; public registration blocked | **VERIFIED** (Role `ADMIN` enforced on server) |
| **Public Navigation** | Zero admin/founder portal links in header or footer | **VERIFIED** (Strictly public links only) |
| **Reader Authentication** | Distinct `READER` role with `/account` profile & comment log | **VERIFIED** (Passes 100% automated E2E tests) |
| **Comment Moderation** | Intercultural Civility queue (`PENDING` by default) | **VERIFIED** (Founder moderation queue operational) |
| **Article Autosave** | Real-time cloud autosave + version history restoration | **VERIFIED** (Debounced autosave & `ArticleRevision`) |
| **Persistent Media Storage** | Supabase Storage (`media` bucket) with public CDN | **IMPLEMENTED** (Storage abstraction in `src/lib/storage.ts`) |
| **Disaster Recovery** | Verified backup & isolated restoration test | **VERIFIED** (Restoration verified in `scripts/test-restore.js`) |
| **Gmail Notifications** | Branded HTML templates for registrations, comments, inquiries | **IMPLEMENTED** (Safe simulation active; awaiting live OAuth) |

---

## 2. Infrastructure & Cloud Setup (DevOps Actions)

### Step 1: Provision Supabase Production Services
- [ ] Create `ACD-Production` on [Supabase](https://supabase.com).
- [ ] Enable Connection Pooling (Port 6543) and save `DATABASE_URL`.
- [ ] Create a public Storage bucket named `media` with MIME type whitelist (`image/*`).
- [ ] Run live migration:
  ```bash
  node scripts/migrate-sqlite-to-postgres.js --target="postgresql://..." --confirm
  ```

### Step 2: Configure Vercel Production Environment
- [ ] Import project to Vercel and assign production domain `asianculturaldiplomacy.org`.
- [ ] Configure Environment Variables for Production Scope:
  - `NODE_ENV="production"`
  - `NEXT_PUBLIC_APP_URL="https://asianculturaldiplomacy.org"`
  - `SESSION_SECRET` (generate 64-char random string via `openssl rand -hex 32`)
  - `ADMIN_EMAIL="founder@asianculturaldiplomacy.org"`
  - `ADMIN_PASSWORD` (strong production master password)
  - `DATABASE_URL` (Supabase connection pooler)
  - `DIRECT_URL` (Supabase direct connection)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_STORAGE_BUCKET="media"`
  - `GMAIL_USER="shashwatiprajapati@gmail.com"`
  - `GMAIL_APP_PASSWORD`

### Step 3: DNS & Custom Domain Records
- [ ] In domain registrar (Cloudflare / Namecheap / Route 53):
  - Add `CNAME` record: `www` -> `cname.vercel-dns.com`
  - Add `A` record: `@` -> `76.76.21.21` (or designated Vercel IP)
- [ ] Verify automatic SSL/TLS certificate issuance.
- [ ] Confirm HSTS (`Strict-Transport-Security: max-age=63072000`) enabled via `vercel.json`.

---

## 4. Compliance, SEO & Metadata Final Verification

- [x] **Robots.txt & Sitemap**: Configured to index `/`, `/about`, `/blog`, `/events`, `/meetups`, `/contact` while disallowing `/admin/*`, `/api/*`, and `/account/*`.
- [x] **SEO Meta Tags**: OpenGraph and Twitter cards configured with sister's watercolor banner (*The Bridge of Dialogue*).
- [x] **Editorial Civility Policy**: Prominently displayed across all comment submission sections.
- [x] **Privacy Policy**: Reader email addresses are kept strictly confidential and never exposed via public HTML or APIs.

---

## 5. Explicit Approval Gate

> [!IMPORTANT]
> The final DNS cutover and live production launch will **never be executed automatically**. It requires explicit confirmation from the founder after completing the mobile acceptance walkthrough.

