# Pre-Deployment Architecture, Security & Data Audit
## Asian Cultural Diplomacy Platform

**Audit Date:** November 3, 2026  
**Auditor:** Senior Full-Stack & Application Security Architect  
**Project:** Asian Cultural Diplomacy (MVP to Production Hardening)

---

## 1. Executive Summary

The Asian Cultural Diplomacy platform currently possesses a high-fidelity visual design, Next.js 15 App Router architecture, TipTap WYSIWYG editorial publishing, and basic SQLite storage. However, prior to public production deployment, significant architectural, security, data persistence, and authentication deficiencies must be upgraded:

1. **Authentication Architecture**: Currently relies solely on a single `AdminUser` table with hardcoded fallback email and cookies, without registered reader roles, email verification, reader account profiles, or OAuth providers.
2. **Comment System Friction**: Comment submission requires manual entry of display name and email on every submission rather than leveraging authenticated reader sessions.
3. **Demo Data Contamination**: The database and seed fixtures contain sample articles, fictitious comments, dummy events, and test meetups that must be safely purged.
4. **Data Persistence**: Uses a local SQLite database (`dev.db`) on the filesystem; articles do not maintain revision history or server-side autosave synchronization statuses.
5. **Notification System**: Contact inquiries and comments are stored locally without transactional email notifications (Gmail/Google integration is not yet connected).
6. **Public Navigation Leak**: An administrative entry point ("Founder Portal") is exposed in the public navigation header.

---

## 2. Existing Architecture Analysis

### Frontend Architecture
- **Framework**: Next.js 15.5.28 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS with custom brand tokens:
  - Deep Diplomatic Navy (`#142D4E`), Classic Blue (`#315C85`), Muted Sky Blue (`#7699B8`), Powder Blue (`#DCE7EF`), Warm Ivory (`#F5F1E8`), Soft Cream (`#E9E1D3`).
- **Typography**: Playfair Display (Serif) & Inter (Sans).
- **Public Routes**:
  - `/`: Split hero, strategic pillars, sister artwork, manifesto, latest articles, upcoming events/meetups.
  - `/about`: Mission, vision, objectives, founder profile, philosophy.
  - `/blog` & `/blog/[slug]`: Publications catalogue, category filters, full editorial reader.
  - `/events` & `/events/[slug]`: Symposia calendar, past archives, event details.
  - `/meetups`: Founder public appearances, attendance windows, privacy statement.
  - `/contact`: Direct inquiry form.
- **Administrative Routes**:
  - `/admin/login`: Administrator sign-in.
  - `/admin`: Dashboard overview with counts and quick actions.
  - `/admin/blogs`, `/admin/blogs/new`, `/admin/blogs/[id]`: TipTap editor and management.
  - `/admin/comments`: Moderation queue (Pending, Approved, Rejected, Flagged).
  - `/admin/events`, `/admin/meetups`, `/admin/categories`, `/admin/media`, `/admin/about`, `/admin/enquiries`, `/admin/settings`.

### Backend Architecture & API Endpoints
- **Server Runtime**: Next.js Route Handlers (`src/app/api/*`).
- **Endpoints**:
  - `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
  - `/api/articles`, `/api/articles/[id]`, `/api/articles/[id]/like`
  - `/api/comments`, `/api/comments/[id]`
  - `/api/events`, `/api/events/[id]`
  - `/api/meetups`, `/api/meetups/[id]`
  - `/api/categories`
  - `/api/enquiries`, `/api/enquiries/[id]`
  - `/api/upload` (Static filesystem writing to `public/uploads`)
  - `/api/settings`
  - `/api/backup` (JSON database dump)

### Database Implementation
- **ORM**: Prisma 6.19.3.
- **Engine**: SQLite (`DATABASE_URL="file:./dev.db"`).
- **Existing Models**: `AdminUser`, `Category`, `Article`, `Tag`, `ArticleTag`, `Comment`, `Event`, `Meetup`, `ContactEnquiry`, `SiteSettings`, `MediaItem`.

---

## 3. Existing Vulnerabilities, Limitations & Architectural Gaps

| Area | Current Implementation | Identified Vulnerability / Limitation | Required Upgrade |
|------|------------------------|---------------------------------------|------------------|
| **User Roles** | Only `AdminUser` model exists | No concept of `Registered Reader`. Comments lack user relationships. | Introduce unified `User`, `Profile`, and `Role` (`ADMIN`, `READER`) models. |
| **Public Nav** | "Founder Portal" button displayed in header | Exposes administrative surface to casual visitors and crawlers. | Remove administrative link from public navigation; keep `/admin` protected. |
| **Authentication** | Custom JWT in `acd_admin_token` cookie | No reader registration, no email verification, no password reset flow. | Implement dual-role auth supporting Reader registration, password reset, and Google OAuth. |
| **Founder Identity** | Hardcoded default in `.env` | Email address could be compromised if default credentials remain. | Dynamically load `ADMIN_EMAIL` from environment during provisioning; assign role strictly server-side. |
| **Comments** | Asks for name and email on every submission | Anonymous/unverified commenting creates moderation spam; inconvenient for readers. | Require authenticated reader session to comment. Auto-populate reader identity; never re-ask for email. |
| **Draft Persistence** | LocalStorage debounce in frontend | Drafts disappear if browser cache is cleared or when switching devices. | Server-side autosave with debounce, synchronization statuses, and version revisions. |
| **Media Storage** | Local directory `public/uploads/` | Files are lost on ephemeral cloud platforms (Vercel, Docker containers) upon redeploy. | Implement resilient object storage abstraction with Supabase Storage / persistent volumes. |
| **Email & Alerts** | No mail transport configured | Founder receives no alerts when new comments, enquiries, or readers arrive. | Implement Gmail API / Nodemailer transport with send-only OAuth/app credentials and branded templates. |
| **Demo Data** | Fictitious seed articles, comments, events | Platform contains placeholder records that look unprofessional if deployed. | Execute audited dry-run and purge script; provide clean empty states. |

---

## 4. Demo Data Inventory for Purging

The following records are identified as demonstration or automated test artifacts:

1. **Articles**:
   - `architecture-of-dialogue-building-bridges` (Seed demo)
   - `courtyards-of-contemplation-classical-architecture` (Seed demo)
   - `mount-fuji-transnational-language-of-serenity` (Seed demo)
   - `preserving-intangible-cultural-heritage-digital-age` (Seed demo)
   - `diplomatic-heritage-reflections-*` (Automated Playwright test runs)
2. **Comments**:
   - Fictitious entries from "Dr. Kenji Takahashi", "Ananya Sharma", "Mark Chen"
   - Automated test comments
3. **Events**:
   - "Pan-Asian Cultural Diplomacy Symposium 2026"
   - "Roundtable on Traditional Arts & Contemporary Statecraft"
   - "Winter Salon: Asian Silk Routes & Shared Memory"
4. **Meetups**:
   - "University Visit & Open Dialogue: Asian Cultural Exchange"
   - "Cultural Salon & Coffee: Perspectives on Heritage Preservation"
   - "Academic Gathering: South & East Asian Literary Connections"
5. **Contact Enquiries**:
   - Automated test inquiries

*Note: Genuine assets (founder's sister's artworks `founder-sister-bridge.jpg` and `founder-sister-courtyard.jpg`, photography `fuji-sakura.jpg`, categories, and the founder's site settings) will be strictly preserved.*

---

## 5. Architectural Upgrade Roadmap

1. **Phase 2**: Create safe backup and standalone executable cleanup script `scripts/cleanup-demo-data.js` with dry-run support. Build elegant empty states.
2. **Phase 3 & 4**: Re-architect user system to support `ADMIN` and `READER` roles. Secure founder administrator provisioning via `ADMIN_EMAIL`. Remove admin link from public nav.
3. **Phase 5**: Complete reader authentication (registration, email verification, login, profile management, password recovery, session handling).
4. **Phase 6**: Upgrade comment system: readers comment with session identity without re-entering email. Provide reader comment history.
5. **Phase 7**: Implement Google OAuth login and Gmail API notifications for comments, registrations, and inquiries.
6. **Phase 8**: Database upgrade with article revisions, server-side autosave (`Saving...`, `Saved`, `Published`), and persistent storage abstraction.
7. **Phase 9**: Hardened security policies, audit logging, input sanitization, rate limiting.
8. **Phase 10 & 11**: Full verification with automated Playwright test suite across public, reader, and admin flows.
9. **Phase 12**: Delivery of complete production documentation.

