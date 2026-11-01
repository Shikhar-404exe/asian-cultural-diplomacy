# Security Review & Threat Model
## Asian Cultural Diplomacy Platform

This document outlines the security architecture, OWASP compliance safeguards, implemented protections, and production transition roadmap.

---

## 1. Authentication & Session Management

- **Password Hashing**: Passwords are encrypted using `bcryptjs` with a work factor of 12 rounds and cryptographic salt. Plaintext passwords are never logged or stored.
- **Session Tokens**: Implemented with JSON Web Tokens (`jose`) signed using HMAC-SHA256 and an isolated environment secret (`SESSION_SECRET`).
- **Cookie Security**:
  - `httpOnly: true` (prevents JavaScript access and XSS cookie exfiltration).
  - `sameSite: 'lax'` (guards against Cross-Site Request Forgery).
  - `secure: true` in production environments (restricts cookies to HTTPS).
  - Explicit 7-day expiration with server-side token validation.
- **Brute-Force & Rate Limiting**: Login endpoint (`/api/auth/login`) enforces a sliding window rate limit of 5 attempts per 15 minutes per IP address.
- **Restricted Registration**: There is no public administrator registration endpoint. Only the single founder account is provisioned via secure administrative seeding.

---

## 2. Server-Side Authorization Model

Client-side UI states never serve as security boundaries. Every mutation route verifies authorization on the server:
- `POST /api/articles` — Verified via `getAdminSession()`
- `PUT /api/articles/[id]` — Verified via `getAdminSession()`
- `DELETE /api/articles/[id]` — Verified via `getAdminSession()`
- `PATCH /api/comments/[id]` — Verified via `getAdminSession()`
- `DELETE /api/comments/[id]` — Verified via `getAdminSession()`
- `POST /api/events` — Verified via `getAdminSession()`
- `PUT /api/events/[id]` — Verified via `getAdminSession()`
- `DELETE /api/events/[id]` — Verified via `getAdminSession()`
- `POST /api/meetups` — Verified via `getAdminSession()`
- `PUT /api/meetups/[id]` — Verified via `getAdminSession()`
- `DELETE /api/meetups/[id]` — Verified via `getAdminSession()`
- `POST /api/upload` — Verified via `getAdminSession()`
- `PUT /api/settings` — Verified via `getAdminSession()`
- `GET /api/backup` — Verified via `getAdminSession()`

Unauthenticated or invalid session tokens immediately receive `401 Unauthorized` responses.

---

## 3. Application Security & Injection Protections

### Stored & Reflected XSS Prevention
- All public text submissions (reader comments and contact enquiries) pass through `sanitizePlainText()` before storage, escaping HTML entities:
  - `<` converted to `&lt;`
  - `>` converted to `&gt;`
  - `"` converted to `&quot;`
  - `'` converted to `&#x27;`
  - `/` converted to `&#x2F;`
- Verified by automated Playwright test `Comments with script tags are escaped to prevent stored XSS`.

### SQL Injection Protection
- All database queries execute through the **Prisma ORM**, which utilizes parameterized queries under the hood. No raw dynamic SQL string interpolation exists in the codebase.

### Spam & Bot Defense
- **Honeypot Trap**: Public forms include an off-screen honeypot input field (`website_hp`). If completed by an automated bot, the payload is silently rejected without exposing database resources.
- **Comment Rate Limiting**: Limits comment submissions to 5 per 5 minutes per client identifier.

---

## 4. File Upload Hardening

- **MIME Whitelist**: Strictly limited to `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`.
- **Extension Whitelist**: Only `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`.
- **Size Limitation**: Hard-capped at 8 MB (`MAX_UPLOAD_SIZE`).
- **Filename Sanitization**: Uploaded files are stripped of original filenames and assigned cryptographically randomized identifiers (`acd_${Date.now()}_${randomBytes(4).hex}.ext`), eliminating path traversal attacks.
- **Execution Restrictions**: Uploaded media resides in static `/public/uploads/` and is served as static binary assets, never executed as server-side scripts.

---

## 5. Network & Multi-Device Access Security

- **Restricted LAN Access**: The application binds to `0.0.0.0:3000` for Wi-Fi access on `192.168.1.8:3000`.
- **No Internet Exposure**: Router port forwarding and public UPnP are explicitly forbidden. The application is isolated strictly to the local subnet.
- **Database Privacy**: The SQLite database file (`dev.db`) resides locally in the application root, protected by OS permissions and excluded from public static web directories.

---

## 6. Production Hardening Roadmap

Before deploying to a public custom domain, ensure:
1. **Database Migration**: Switch datasource from `sqlite` to `postgresql` in `prisma/schema.prisma`.
2. **Environment Secrets**: Generate a 64-character random string for `SESSION_SECRET` via `openssl rand -hex 32`.
3. **HTTPS / TLS**: Terminate TLS at the reverse proxy (Nginx, Caddy, Vercel, or Cloudflare) with HSTS enabled.
4. **Content Security Policy (CSP)**: Deploy strict CSP headers restricting script and image sources.
