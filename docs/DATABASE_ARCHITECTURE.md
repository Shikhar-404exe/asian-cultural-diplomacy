# Database Architecture & Persistence Guide

This document describes the data persistence architecture of the **Asian Cultural Diplomacy** platform, encompassing local SQLite development, schema design, version history, and production transition to PostgreSQL / Supabase.

---

## 1. Relational Schema Architecture

The database is powered by **Prisma ORM**, providing type-safe relational modeling and migrations.

```
                      +-------------------+
                      |       User        |
                      |-------------------|
                      | id (UUID)         |
                      | email (unique)    |
                      | passwordHash      |
                      | name              |
                      | role (ADMIN/READER)
                      | avatarUrl         |
                      | isEmailVerified   |
                      | status (ACTIVE)   |
                      | googleId          |
                      +-------------------+
                                | 1
            +-------------------+-------------------+
            | *                                     | *
+-----------------------+               +-----------------------+
|        Comment        |               |    ArticleRevision    |
|-----------------------|               |-----------------------|
| id (UUID)             |               | id (UUID)             |
| articleId (FK)        |               | articleId (FK)        |
| userId (FK)           |               | revisionNumber (Int)  |
| authorName            |               | title                 |
| authorEmail (private) |               | subtitle              |
| content               |               | content               |
| status (APPROVED/...) |               | savedById (FK)        |
| createdAt             |               | createdAt             |
+-----------------------+               +-----------------------+
            | *                                     | *
            +-------------------+-------------------+
                                | 1
                      +-------------------+
                      |      Article      |
                      |-------------------|
                      | id (UUID)         |
                      | slug (unique)     |
                      | title             |
                      | subtitle          |
                      | content (HTML)    |
                      | categoryId (FK)   |
                      | isPublished       |
                      | isFeatured        |
                      | lastAutosavedAt   |
                      +-------------------+
                                | *
                                | 1
                      +-------------------+
                      |     Category      |
                      |-------------------|
                      | id (UUID)         |
                      | name (unique)     |
                      | slug (unique)     |
                      +-------------------+
```

---

## 2. Core Entities & Role Partitioning

### A. Unified `User` Model
Replaces fragmented user structures with a unified authority:
- `id`: Unique UUID.
- `email`: Indexed, unique email address.
- `role`: Strict enum-like string (`ADMIN` or `READER`).
- `passwordHash`: Bcrypt hash (nullable if authenticating solely via Google OAuth).
- `googleId`: Unique Google OAuth subject identifier.
- `status`: Account standing (`ACTIVE` or `SUSPENDED`).

### B. `Article` & `ArticleRevision`
Provides rock-solid content persistence:
- `Article`: Live state of the article or working draft.
- `ArticleRevision`: Historical snapshots created automatically during editing and server-side autosave. Contains `revisionNumber`, title, subtitle, full rich HTML `content`, timestamp, and editor attribution.

### C. `Comment`
- Linked via foreign key to `User.id` (`onDelete: SetNull`) to preserve comment history under the reader's `/account` dashboard.
- `authorEmail`: Stored strictly for civility moderation and abuse prevention; never serialized in public queries.
- `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`, `FLAGGED`).

### D. `Event` & `Meetup`
Stores upcoming and past symposia, conferences, and founder public appearances with structured dates, venue details, speaker rosters, and photographic records.

### E. `SiteSettings`
Singleton record (ID: 1) controlling website branding, founder biographical texts, contact emails, and Gmail notification toggles.

### F. `AuditLog`
Audit ledger tracking administrative actions (`ARTICLE_PUBLISHED`, `SETTINGS_UPDATED`, `NOTIFICATION_SIMULATED`).

---

## 3. Server Autosave Mechanics

1. **Typing Debounce**: When the founder edits an article in `/admin/blogs/new` or `/admin/blogs/[id]`, keystrokes trigger a debounced timer (2.5 seconds).
2. **Server Dispatch**: A payload containing the latest content is dispatched to `/api/articles/autosave`.
3. **Draft Upkeep**: The server creates or updates the article record, updating `lastAutosavedAt`.
4. **Revision Capture**: If content differs from the latest snapshot, a new `ArticleRevision` record is generated.
5. **UI State Reflection**:
   - `Saving to Cloud...`
   - `Saved to Cloud (at HH:mm)`
   - `Offline cache active (Sync error fallback)`

---

## 4. Local vs. Production Transition

| Environment | Database Engine | Connection String |
|---|---|---|
| **Local / Wi-Fi MVP** | SQLite (`prisma/dev.db`) | `DATABASE_URL="file:./dev.db"` |
| **Production Cloud** | PostgreSQL / Supabase | `DATABASE_URL="postgresql://user:pass@host:5432/dbname"` |

### Migrating to Supabase / PostgreSQL in Production:
1. Create a Supabase or Neon PostgreSQL database instance.
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run schema migration:
   ```bash
   npx prisma db push
   ```
4. Transfer local data using standard SQLite export or custom seed script.

