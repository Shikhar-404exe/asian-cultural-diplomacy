# Asian Cultural Diplomacy — Vercel & Supabase Operations Runbook

## 1. Architecture Overview

The Asian Cultural Diplomacy platform is architected as a modern serverless web application deployed on **Vercel**, backed by a managed **Supabase PostgreSQL** database and **Supabase Storage** for media persistence.

```
                         +-----------------------------+
                         |      Custom Domain /        |
                         |   Vercel Edge Network       |
                         |  (Next.js 15 App Router)    |
                         +--------------+--------------+
                                        |
               +------------------------+------------------------+
               |                                                 |
               v                                                 v
+-------------------------------+               +---------------------------------+
|  Supabase Transaction Pooler  |               |        Supabase Storage         |
|  Port: 6543 (pgbouncer=true)  |               |          Bucket: media          |
|  Runtime queries via Prisma   |               |   Asset uploads & CDN delivery  |
+---------------+---------------+               +---------------------------------+
                |
                v
+-------------------------------+
|  Supabase Session Pooler      |
|  Port: 5432 (DIRECT_URL)      |
|  Prisma migrations & schema   |
+-------------------------------+
```

---

## 2. Infrastructure Configuration

### 2.1 Supabase Project Specifications
- **Project Ref**: `opfsovptjskryispdlhf`
- **Region**: `ap-northeast-1` (Tokyo, Japan)
- **Database Engine**: PostgreSQL 15.8 (Supabase managed)
- **Runtime Pooler (Transaction)**: Port `6543` with `?pgbouncer=true&connection_limit=1`
- **Migration Pooler (Session / Direct)**: Port `5432`
- **Storage Bucket**: `media` (Public read, authenticated write)

### 2.2 Vercel Production Environment Variables
The following environment variables are required in the Vercel Project Settings (`Settings -> Environment Variables`):

| Variable Name | Environment | Description / Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production / Preview | Supabase Transaction Pooler string (`port 6543` with `?pgbouncer=true`) |
| `DIRECT_URL` | Production / Preview | Supabase Session Pooler string (`port 5432`) for schema operations |
| `NEXT_PUBLIC_SUPABASE_URL` | All | `https://opfsovptjskryispdlhf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| All | Supabase Public Anonymous Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production / Preview | Supabase Private Service Role Key (Server-only) |
| `SESSION_SECRET` | Production / Preview | 64+ char random hex string for JWT signing |
| `ADMIN_EMAIL` | Production / Preview | `founder@asianculturaldiplomacy.org` |
| `ADMIN_PASSWORD` | Production / Preview | High-entropy founder password |
| `NEXT_PUBLIC_APP_URL` | Production | `https://asian-cultural-diplomacy.vercel.app` |

---

## 3. Deployment & Build Pipeline

### 3.1 Build Command
```json
"scripts": {
  "build": "prisma generate && next build"
}
```
During Vercel build execution:
1. `prisma generate` compiles the typed Prisma Client based on `prisma/schema.prisma`.
2. `next build` compiles static pages, type-checks all routes, optimizes bundles, and collects server action traces.

### 3.2 Continuous Deployment from GitHub
- Branch `master` (and tracking `main`) is connected to Vercel.
- Every commit pushed to `origin/master` automatically triggers an optimized Vercel production deployment.

---

## 4. Operational Maintenance & Runbook

### 4.1 Automated Database Backup Procedure
A dedicated snapshot script is provided at `scripts/backup-db.ts`:
```powershell
npx tsx scripts/backup-db.ts
```
This dumps all table records to `backups/pre_cleanup_backup_<timestamp>.json`. Automated backups are excluded from Git via `.gitignore`.

### 4.2 Data Restoration Procedure
In the event that baseline editorial records need to be restored:
```powershell
npx tsx scripts/cleanup-test-data.ts
```
This idempotently upserts the 5 categories, 3 authentic founder publications, 3 symposia events, and 3 public meetups.

### 4.3 Administrator Password Rotation
1. Update `ADMIN_PASSWORD` in Vercel Project Settings.
2. In the Supabase SQL editor or via application CLI, hash the new password using bcrypt:
   ```javascript
   const hash = await bcrypt.hash(newPassword, 12);
   await prisma.user.update({
     where: { email: 'founder@asianculturaldiplomacy.org' },
     data: { passwordHash: hash }
   });
   ```
3. Existing JWT session cookies expire after 7 days or upon logging out.

---

## 5. Security & Isolation Safeguards

1. **No Credentials in Git**: `.env` and all secrets are excluded from Git. `.env.example` provides safe placeholders only.
2. **Strict Server-Side Session Validation**: Route Handlers extract cookies defensively and enforce server-side role validation (`ADMIN` vs `READER`).
3. **No Direct Public Writes to Storage**: Uploads pass through `/api/upload` which verifies administrator authentication before streaming to the Supabase `media` bucket.

