# Production Deployment & Security Checklist

This document provides complete instructions for deploying the **Asian Cultural Diplomacy** platform to production environments with a custom domain, SSL certificates, external database persistence, and hardened security settings.

---

## 1. Pre-Deployment Verification Checklist

Before taking the platform public, verify that all steps below are satisfied:

- [x] **Zero Demo Data**: Verify that all placeholder articles, fake comments, and dummy events have been purged using `scripts/cleanup-demo-data.js`.
- [x] **No Public Admin Links**: Verify that the public header (`Navigation.tsx`) and footer (`Footer.tsx`) contain no links to `/admin`, "Founder Portal", or "Publisher Login".
- [x] **Role-Based Access Control (RBAC)**: Ensure that readers cannot access `/admin` or write articles.
- [x] **Dynamic Admin Email**: Ensure `ADMIN_EMAIL` is configured in production environment variables.
- [x] **Server-Side Autosave**: Verify that article drafts save reliably to the database with revision tracking.
- [x] **Civility Comment Moderation**: Verify that reader comments queue in `PENDING` state until approved by the founder.
- [x] **Rate Limiting**: Protect authentication (`/api/auth/login`, `/api/auth/register`), commenting (`/api/comments`), and contact forms against flooding.
- [x] **CSRF / SameSite Cookies**: Ensure `SESSION_COOKIE` is set to `HttpOnly`, `SameSite=Lax`, and `Secure` in production.

---

## 2. Environment Variables Configuration

Set the following environment variables in your hosting provider (Vercel, Railway, or AWS):

```env
# Application Core
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://asianculturaldiplomacy.org"
SESSION_SECRET="generate_a_64_character_random_hex_string_for_production"

# Founder Identity & Access
ADMIN_EMAIL="founder@asianculturaldiplomacy.org"
ADMIN_PASSWORD="StrongFounderPassword2026!"
ADMIN_NAME="Founder & Director"

# Database (PostgreSQL / Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Gmail & Transactional Alerts (OAuth 2.0 or App Password)
GMAIL_USER="founder@asianculturaldiplomacy.org"
GMAIL_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your-client-secret"
GMAIL_REFRESH_TOKEN="your-refresh-token"
# Optional fallback:
# GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"

# Google Sign-In for Readers
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```

---

## 3. Recommended Hosting Platforms

### Option A: Vercel + Supabase (Recommended)
1. **Database**: Create a project on [Supabase](https://supabase.com). Copy the PostgreSQL connection URI.
2. **Schema Deployment**:
   ```bash
   DATABASE_URL="your-supabase-uri" npx prisma db push
   ```
3. **Frontend**: Import the GitHub repository into [Vercel](https://vercel.com).
4. Add all environment variables listed above.
5. Deploy.

### Option B: Railway (All-in-One Node.js + PostgreSQL)
1. Create a new project on [Railway](https://railway.app).
2. Provision a **PostgreSQL** service.
3. Link your GitHub repository as a **Node.js** service.
4. Set the build command:
   ```bash
   npm run build
   ```
5. Set the start command:
   ```bash
   npm run start
   ```

---

## 4. Custom Domain & SSL Setup

1. In your DNS provider (Cloudflare, Namecheap, Route 53):
   - Add a `CNAME` record pointing `www` to your hosting alias (e.g., `cname.vercel-dns.com`).
   - Add an `A` record pointing the apex domain `@` to the designated server IP.
2. Enable automatic SSL/TLS encryption (managed automatically by Vercel / Cloudflare).
3. Enforce **HSTS** (HTTP Strict Transport Security).

