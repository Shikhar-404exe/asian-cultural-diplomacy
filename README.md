# Asian Cultural Diplomacy Platform
### Production Editorial, Intercultural Engagement & Reader Dialogue Platform

An authoritative digital publication and community engagement platform built for an emerging organization focused on **Asian Cultural Diplomacy**. Designed to give the founder a frictionless, non-technical publishing experience while providing registered readers with a respectful, civil environment to engage in intercultural dialogue.

---

## 1. Brand Identity & Fixed Palette

The platform strictly implements the official brand color scheme:

| Color Token | Hex Code | Applied Design Purpose |
|---|---|---|
| **Deep Diplomatic Navy** | `#142D4E` | Primary brand identity, major typography (H1/H2), and anchor footer |
| **Classic Blue** | `#315C85` | Primary buttons, active navigation indicators, hyperlinks |
| **Muted Sky Blue** | `#7699B8` | Secondary accents, dates, badges, subtle icons |
| **Powder Blue** | `#DCE7EF` | Soft section backdrops, highlighted callouts, hover states |
| **Warm Ivory** | `#F5F1E8` | Dominant website background with architectural gridlines |
| **Soft Cream** | `#E9E1D3` | Editorial cards, inputs, secondary surface layers |

---

## 2. Key Architecture & Upgrades

- **Two Distinct User Roles**:
  - `ADMIN` (Founder & Executive Director): Sole publisher with exclusive access to write, edit, publish, delete articles, manage categories, events, meetups, moderate comments, and configure settings. Assigned strictly on the server matching `ADMIN_EMAIL`.
  - `READER` (Community Participant): Registered reader with a personal dashboard (`/account`), display name customization, and comment tracking.
- **Zero Public Admin Chrome**:
  - All "Founder Portal", "Publisher Sign In", and admin navigation links have been completely removed from public headers and footers.
  - Visitors see only public links (`Home`, `About`, `Blog`, `Events`, `Meetups`, `Contact`, `Sign In`, `Join Dialogue`).
  - Access to the administration interface is strictly via direct URL (`/admin`).
- **Server Autosave & Version History**:
  - Real-time server-side autosave with live status indicator (`Saving to Cloud...`, `Saved to Cloud`, `Offline cache fallback`).
  - Automatic `ArticleRevision` snapshot tracking allows the founder to review and restore previous drafts at any time.
- **Session-Based Comment Identity & Civility Policy**:
  - Unauthenticated visitors are politely prompted to sign in or register before commenting.
  - Authenticated readers comment automatically with their session identity (no repetitive name/email fields).
  - Private email storage ensures reader emails are never exposed publicly.
  - Reader comments queue in `PENDING` state until civility review by the founder.
- **Gmail & Transactional Notifications**:
  - Branded HTML notifications dispatched on new reader registrations, new comments, flagged comments, and contact form enquiries.
  - Supports Gmail OAuth 2.0, Google App Passwords, and SMTP relays, with fallback simulation recording in `AuditLog`.
- **Safe Demo Data Purge**:
  - Verified and confirmed purge of all placeholder articles, fake comments, and dummy events.
  - Automated timestamped backup archived in `backups/dev_pre_cleanup_20261103_201108.db`.
  - Respectful empty states guide visitors when content is pending publication.

---

## 3. Quick Start & Local Execution

```bash
# 1. Install dependencies
npm install

# 2. Synchronize database schema
npx prisma db push

# 3. Build optimized production release
npm run build

# 4. Start production server
npm run start
```

### Access URLs:
- **Public Website**: `http://localhost:3000`
- **Reader Registration**: `http://localhost:3000/register`
- **Reader Sign In**: `http://localhost:3000/login`
- **Reader Account Hub**: `http://localhost:3000/account`
- **Founder Administrator Portal**: `http://localhost:3000/admin`
  - **Email**: `founder@asianculturaldiplomacy.org` (configured dynamically via `ADMIN_EMAIL`)
  - **Password**: `CulturalDiplomacy2026!` (configured via `ADMIN_PASSWORD`)

---

## 4. Automated Verification & Testing

Run the full end-to-end test suite:

```bash
npm run test:e2e
```

**100% Pass Rate (8/8 tests)**:
1. Homepage branding, strategic pillars, sister artwork, and clean public navigation without admin links.
2. About page mission, vision, and intercultural philosophy.
3. Respectful empty states on Publications, Events, and Meetups.
4. Diplomatic contact form submission and automated enquiry alerts.
5. Reader registration lifecycle and automatic account onboarding.
6. Role-Based Access Control (RBAC): readers are strictly blocked from `/admin`.
7. Reader profile management and display name updating.
8. Founder administrator login, server autosave, and live article publishing.

---

## 5. Architectural Documentation Map

Comprehensive guides in `docs/`:

1. [`docs/PRE_DEPLOYMENT_AUDIT.md`](./docs/PRE_DEPLOYMENT_AUDIT.md) — Initial codebase audit, vulnerability evaluation, and remediation roadmap.
2. [`docs/AUTHENTICATION_GUIDE.md`](./docs/AUTHENTICATION_GUIDE.md) — Two distinct user roles, dynamic `ADMIN_EMAIL` provisioning, session tokens, and security.
3. [`docs/GMAIL_SETUP.md`](./docs/GMAIL_SETUP.md) — Step-by-step Gmail OAuth 2.0 and App Password configuration.
4. [`docs/DATABASE_ARCHITECTURE.md`](./docs/DATABASE_ARCHITECTURE.md) — Relational schema, autosave mechanics, revisions, and Supabase / PostgreSQL transition.
5. [`docs/BACKUP_AND_RESTORE.md`](./docs/BACKUP_AND_RESTORE.md) — Snapshot procedures, disaster recovery, and demo cleanup rollback.
6. [`docs/PRODUCTION_DEPLOYMENT.md`](./docs/PRODUCTION_DEPLOYMENT.md) — Custom domain, SSL, environment secrets, and hosting instructions.
7. [`docs/ADMIN_GUIDE.md`](./docs/ADMIN_GUIDE.md) — Plain-language manual for the non-technical founder.
