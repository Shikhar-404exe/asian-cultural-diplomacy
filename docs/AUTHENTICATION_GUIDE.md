# User Authentication & Role Architecture Guide

This document provides a comprehensive overview of the dual-role authentication model implemented for the **Asian Cultural Diplomacy** digital publication and engagement platform.

---

## 1. Core Architectural Principles

1. **Two Distinct Roles**:
   - `ADMIN` (The Founder & Executive Director): Sole publisher with unrestricted content authoring, editing, deletion, event management, moderation, and platform settings privileges.
   - `READER` (Community Participant): Registered reader with the ability to manage personal profiles, maintain comment history, and engage in respectful intercultural dialogues on published essays.
2. **Server-Enforced Role Assignment**:
   - Public registration endpoints strictly forbid role specification by the client.
   - Any client attempting to supply `role: "ADMIN"` is overridden on the server.
   - The `ADMIN` role is granted **strictly and dynamically** by matching the user's verified email against the server environment variable `ADMIN_EMAIL`.
3. **Session Security**:
   - Authentication tokens are signed using JSON Web Tokens (JWT) with HMAC-SHA256 via `jose`.
   - Delivered via `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookies (`acd_session_token`).
   - Tokens carry an explicit 7-day expiration window.

---

## 2. Dynamic Admin Provisioning (`ADMIN_EMAIL`)

The founder's administrator privileges are bound dynamically at runtime via `.env`:

```env
ADMIN_EMAIL="founder@asianculturaldiplomacy.org"
```

### Verification Logic (`src/lib/auth.ts`)
```typescript
export function getRoleForEmail(email: string): UserRole {
  const configuredAdmin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (configuredAdmin && email.trim().toLowerCase() === configuredAdmin) {
    return 'ADMIN';
  }
  return 'READER';
}
```

Whenever any user logs in or registers:
- If `email === process.env.ADMIN_EMAIL.toLowerCase()`, the role is verified/promoted to `ADMIN`.
- For all other addresses, the role is unconditionally set to `READER`.

---

## 3. Public Navigation & Zero Public Admin Chrome

As required by Phase 5:
- The public navigation bar (`src/components/Navigation.tsx`) and footer (`src/components/Footer.tsx`) contain **no links** to "Founder Portal", "Publisher Sign In", or "Admin".
- Visitors see clean editorial navigation:
  - `Home`
  - `About`
  - `Blog / Publications`
  - `Events`
  - `Meetups`
  - `Contact`
  - `Sign In` / `Join Dialogue`
- When logged in as a **Registered Reader**:
  - The reader's initial avatar and display name are rendered in the top bar.
  - A direct link to their personal account page (`/account`) is provided.
  - A quick "Sign Out" button is available.
- The administrator portal is accessed solely by directly visiting:
  ```
  /admin
  ```

---

## 4. Reader Experience & Profile Management

### Registration (`/register`)
- Collects:
  - **Display Name**: Displayed publicly alongside approved reflections (e.g. `Prof. Lin Wei`).
  - **Email Address**: Kept strictly confidential and never exposed in HTML or public APIs.
  - **Password**: Hashed using `bcryptjs` with salt round cost 12.
- Upon completion, the reader is automatically signed in and directed to their account dashboard.

### Reader Dashboard (`/account`)
Readers have access to three functional tabs:
1. **My Dialogue Perspectives**:
   - Comprehensive log of all comments submitted by this user.
   - Displays moderation status badges:
     - `Published` (Emerald badge)
     - `Under Review` (Amber badge)
     - `Flagged` (Rose badge)
   - Direct link to the associated publication.
2. **Profile Details**:
   - Update public display name at any time.
3. **Security & Password**:
   - Update account password (requires verifying current password).

---

## 5. Commenting Session Identity & Civility Policy

- Unauthenticated visitors viewing an article see an inviting civility callout card prompting them to **Sign In** or **Register as Reader**.
- Authenticated readers see:
  - Automatic identity attribution: `"Commenting as [Display Name] (Registered Reader)"`.
  - A clean textarea with 2,500-character counter.
  - No repeated entry of names or email addresses is necessary.
- Spam Protection:
  - Invisible honeypot trap fields silently discard automated bot submissions.
  - Rate limiting protects `/api/comments` against flooding.
  - Reader submissions enter the founder's moderation queue before public display. Founder comments are published immediately.

---

## 6. API Route Reference

| Method | Endpoint | Access Level | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a new reader; assigns `READER` role. |
| `POST` | `/api/auth/login` | Public | Authenticates admin or reader credentials. |
| `POST` | `/api/auth/logout` | Session | Clears session cookies. |
| `GET` | `/api/auth/me` | Public/Session | Returns current session user payload. |
| `GET` | `/api/auth/profile` | Session | Retrieves user profile and personal comment history. |
| `PUT` | `/api/auth/profile` | Session | Updates user display name or password. |
| `GET` | `/api/auth/google` | Public | Initiates Google OAuth2 flow or handles callback. |

