# Public Production Deployment Checklist
## Asian Cultural Diplomacy Platform

Follow this comprehensive checklist before publishing the platform to a custom domain (e.g. `asianculturaldiplomacy.org`).

---

## 1. Database Migration: SQLite to PostgreSQL

The local MVP utilizes SQLite for zero-configuration local operation. For public production with concurrent readers and high reliability, migrate to PostgreSQL:

1. Provision a managed PostgreSQL instance (e.g., Supabase, Neon, AWS RDS, or Railway).
2. In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set the production connection string in `.env.production`:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/acd_prod?sslmode=require"
   ```
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Migrate initial seed data or restore from the MVP JSON backup.

---

## 2. Secrets & Environment Configuration

| Variable | Local MVP Value | Production Requirement |
|----------|-----------------|------------------------|
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | `file:./dev.db` | PostgreSQL connection URI |
| `SESSION_SECRET` | Local secret key | Generate cryptographically strong 64-character secret (`openssl rand -hex 32`) |
| `ADMIN_EMAIL` | `founder@asianculturaldiplomacy.org` | Official founder domain email |
| `ADMIN_PASSWORD` | `CulturalDiplomacy2026!` | Replace with strong 16+ character passphrase |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Full HTTPS domain: `https://asianculturaldiplomacy.org` |

---

## 3. Custom Domain & DNS Settings

1. Purchase domain through a reputable registrar (e.g., Cloudflare, Google Domains/Squarespace, Namecheap).
2. Configure DNS records:
   - `A` or `CNAME` pointing to host (Vercel, Netlify, Railway, or VPS).
   - `CNAME` for `www` alias pointing to root.
3. Enforce **HTTPS Always** and **HTTP-to-HTTPS redirect**.
4. Enable **DNSSEC** for domain protection.

---

## 4. HTTPS, TLS & Security Headers

Ensure your production web server or Next.js edge configuration serves the following security headers:

- **Strict-Transport-Security (HSTS)**: `max-age=63072000; includeSubDomains; preload`
- **X-Frame-Options**: `SAMEORIGIN`
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=()`
- **Content-Security-Policy (CSP)**:
  ```text
  default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';
  ```

---

## 5. Media & Asset Storage (S3 / Cloud Storage)

For high-scale public traffic:
- Transition `public/uploads` to an S3-compatible cloud storage bucket (AWS S3, Cloudflare R2, or Google Cloud Storage) with signed URLs and image optimization through Cloudflare Images or Next.js Image CDN.

---

## 6. Backup & Recovery Protocol

- **Automated Daily Backups**: Enable point-in-time recovery on the PostgreSQL database with 30-day retention.
- **Weekly Snapshot**: Download the JSON data export from `/admin/settings` and archive to an offline encrypted drive.
- **Disaster Recovery**: Documented recovery time objective (RTO) of < 30 minutes using the automated Prisma seed/migration pipeline.
