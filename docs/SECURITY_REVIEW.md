# Comprehensive Security Review & Threat Model

**Platform:** Asian Cultural Diplomacy  
**Scope:** Application Security, Authentication, RBAC, Data Protection, Network Boundaries, and Deployment Readiness  
**Review Status:** Hardened & Audited  

---

## 1. Authentication & Session Architecture

### Dual-Role Model
- The platform strictly separates **Administrator (`ADMIN`)** privileges from **Registered Reader (`READER`)** accounts.
- The `ADMIN` role grants exclusive publishing, editing, deletion, event coordination, comment moderation, and system settings rights.
- `READER` accounts can manage personal profiles, view personal comment logs, and participate in moderated intercultural dialogues.

### Server-Enforced Role Assignment & `ADMIN_EMAIL` Hardening
- Public registration (`POST /api/auth/register`) strictly ignores any role supplied in the request body and unconditionally creates `READER` accounts.
- Attempts to register publicly using the configured `ADMIN_EMAIL` are explicitly rejected (`403 Forbidden`).
- The `ADMIN` role is granted exclusively by the server by comparing verified credentials against `process.env.ADMIN_EMAIL`.
- In Google OAuth (`GET /api/auth/google`), the system checks `profile.email_verified === true`. Unverified email addresses from OAuth providers cannot authenticate or claim administrator rights.

### Cryptographic Credential Protection
- Passwords hashed using `bcryptjs` with salt work factor of 12 rounds.
- Plaintext passwords are never stored, logged, or returned in API responses.
- Session tokens signed using HMAC-SHA256 (`jose`) with 7-day expiration and secret key isolation (`SESSION_SECRET`).
- Cookies delivered with `HttpOnly`, `SameSite=Lax`, and `Secure` (production).

---

## 2. Server-Side Authorization & Anti-IDOR Protections

Client-side UI states never serve as security boundaries. Every mutation route verifies authorization on the server:

| Endpoint | Method | Required Role | Enforcement Mechanism |
|---|---|---|---|
| `/api/articles` | `POST` | `ADMIN` | `getAdminSession()` |
| `/api/articles/[id]` | `PUT`, `DELETE` | `ADMIN` | `getAdminSession()` |
| `/api/articles/autosave` | `POST` | `ADMIN` | `getAdminSession()` |
| `/api/comments` | `GET` (queue) | `ADMIN` | `getAdminSession()` |
| `/api/comments/[id]` | `PATCH`, `DELETE`| `ADMIN` | `getAdminSession()` |
| `/api/events` | `POST` | `ADMIN` | `getAdminSession()` |
| `/api/events/[id]` | `PUT`, `DELETE` | `ADMIN` | `getAdminSession()` |
| `/api/meetups` | `POST` | `ADMIN` | `getAdminSession()` |
| `/api/meetups/[id]` | `PUT`, `DELETE` | `ADMIN` | `getAdminSession()` |
| `/api/upload` | `POST`, `DELETE`| `ADMIN` | `getAdminSession()` |
| `/api/settings` | `PUT` | `ADMIN` | `getAdminSession()` |
| `/api/backup` | `GET` | `ADMIN` | `getAdminSession()` |
| `/api/auth/profile` | `GET`, `PUT` | Session (`ADMIN` or `READER`)| `getSession()` (User can only read/edit their own record) |

### Insecure Direct Object Reference (IDOR) Safeguards
- In `src/app/api/auth/profile/route.ts`, profile queries and updates derive user identity strictly from `session.userId`.
- A reader cannot supply another user's ID to view private comments, email addresses, or modify names/passwords.

---

## 3. Rate Limiting & Brute Force Mitigation

Memory sliding-window rate limiters protect all sensitive endpoints (`src/lib/security.ts`):

- **Login Attempts (`/api/auth/login`)**: Max 10 attempts per 15 minutes per IP.
- **Registration (`/api/auth/register`)**: Max 5 attempts per 15 minutes per IP.
- **Commenting (`/api/comments`)**: Max 8 submissions per 5 minutes per IP.
- **Contact Inquiries (`/api/enquiries`)**: Max 5 submissions per 10 minutes per IP.

---

## 4. Multi-Factor Authentication (MFA) Strategy

For production deployment, MFA is supported via two recommended paths:

1. **Google Workspace / Gmail OAuth**:
   - The founder authenticates using Google OAuth with hardware security keys (FIDO2 / WebAuthn) or Google Authenticator enforced on the Google Workspace administrator level.
2. **TOTP (Time-Based One-Time Password)**:
   - Schema field `mfaSecret` and `isMfaEnabled` are defined in `model User`.
   - Integration with standard authenticator applications (1Password, Google Authenticator).

---

## 5. Input Sanitization & Injection Defense

- **SQL Injection**: Prevented universally through Prisma ORM parameterized queries. No raw dynamic SQL string interpolation exists in the codebase.
- **Cross-Site Scripting (XSS)**: All user submissions (comments, inquiries) are sanitized via `sanitizePlainText()`, escaping all HTML entities (`<`, `>`, `"`, `'`, `/`).
- **Spam Bot Defense**: Invisible honeypot field (`website_hp`) silently traps automated submission bots.
- **Malicious Uploads**: File uploads require `ADMIN` session, restricted to JPEG, PNG, WebP, and max 5MB. Files are given cryptographically random filenames, preventing path traversal.
