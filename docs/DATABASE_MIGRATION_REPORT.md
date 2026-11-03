# Database Migration & Persistence Report: SQLite to Supabase PostgreSQL

**Author:** DevOps & Database Engineering  
**Project:** Asian Cultural Diplomacy  
**Target Architecture:** Supabase Managed PostgreSQL (Staging & Production)  
**Status:** Validated & Migration-Ready

---

## 1. Current State Assessment

| Attribute | Local / Development State | Production / Staging Target |
|---|---|---|
| **Engine** | SQLite 3 (`prisma/dev.db`) | PostgreSQL 15+ (Supabase) |
| **Connection** | `file:./dev.db` | `postgresql://postgres:[PASS]@[HOST]:5432/postgres?pgbouncer=true` |
| **Concurrency** | Single-writer file lock | High-concurrency connection pooling (PgBouncer) |
| **Persistence** | Ephemeral on serverless (fails on Vercel) | Distributed cloud persistence with PITR |
| **Backups** | Local file snapshot | Automated daily snapshots + continuous WAL archiving |

> [!WARNING]
> While SQLite is ideal for local single-device development, it is **unsuitable for serverless production deployments (such as Vercel)** because serverless function file systems are ephemeral and read-only outside `/tmp`. Migrating to managed PostgreSQL is mandatory before public launch.

---

## 2. Verified Snapshot Counts Prior to Migration

The pre-migration SQLite state was exported and archived via `scripts/migrate-sqlite-to-postgres.js --export`:

| Entity | Record Count | Integrity Check |
|---|---|---|
| `User` (Admin & Readers) | 5 | Verified (1 Founder `ADMIN`, 4 Readers) |
| `AdminUser` (Legacy sync) | 1 | Verified (Founder credentials) |
| `Category` | 5 | Verified (Diplomatic Essays, Cultural Philosophy, etc.) |
| `Article` | 1 | Verified (`Diplomatic Synergy & Shared Heritage`) |
| `ArticleRevision` | 1 | Verified (Linked snapshot) |
| `ContactEnquiry` | 2 | Verified (Diplomatic inquiries) |
| `SiteSettings` | 1 | Verified (Organization metadata) |
| `MediaItem` | 3 | Verified (Sister artworks & photography) |
| `AuditLog` | 6 | Verified (Administrative events) |

---

## 3. Migration Procedure to Supabase PostgreSQL

### Step 1: Provision Supabase Instance
1. Create a new Supabase project: `Asian Cultural Diplomacy (Staging)`.
2. Retrieve the PostgreSQL connection string from **Project Settings > Database**:
   - Connection Pooling URI (Port 6543) for Next.js application runtime.
   - Direct URI (Port 5432) for Prisma migrations.

### Step 2: Push Schema to Target PostgreSQL
Set the target database URL and apply the Prisma schema:
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" npx prisma db push
```

### Step 3: Execute Safe Data Transfer
Run the migration script in dry-run mode first, followed by live confirmation:
```bash
# Dry Run Verification
node scripts/migrate-sqlite-to-postgres.js --target="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" --dry-run

# Live Migration Execution
node scripts/migrate-sqlite-to-postgres.js --target="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" --confirm
```

### Step 4: Verification & Automated Reconciliation
The script automatically queries both databases and prints a reconciliation matrix. All UUIDs, passwords hashes, timestamps, and relations are preserved verbatim without re-seeding or data loss.

---

## 4. Preventing Database Reset During Deployment

To guarantee that deployments **never** reset or truncate the database:

1. **Never use `prisma migrate reset` in CI/CD pipelines**.
2. **Use `prisma db push` or `prisma migrate deploy`**:
   - `prisma migrate deploy` only executes pending migration files without altering existing data.
   - In `package.json`, the build script is configured safely:
     ```json
     "build": "prisma generate && next build"
     ```
   - Database migrations are run as an explicit, deliberate DevOps action, never on automated frontend compilation.
3. **Database Permissions**:
   - Provide the application with a standard role, reserving `DROP` and `TRUNCATE` privileges exclusively for the database administrator.

---

## 5. Rollback & Disaster Recovery Plan

If a migration fails or data corruption occurs during migration:
1. The local SQLite database (`prisma/dev.db`) and timestamped JSON exports in `backups/` remain completely untouched.
2. The target PostgreSQL database can be dropped or re-initialized within Supabase in one click.
3. In production, Supabase provides Point-in-Time Recovery (PITR) allowing rollback to any second in the past 7 days.

