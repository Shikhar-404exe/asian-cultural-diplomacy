# Asian Cultural Diplomacy Platform
### Professional Editorial, Cultural Engagement & Community Platform

An authoritative digital publication and community engagement platform built for an emerging organization focused on **Asian Cultural Diplomacy**. Designed to give the founder a frictionless, non-technical publishing experience while presenting a culturally sophisticated, academically credible face to the international diplomatic and cultural community.

---

## Brand Identity & Fixed Palette

The platform strictly implements the official brand color scheme:

| Color Token | Hex Code | Applied Design Purpose |
|-------------|----------|------------------------|
| **Deep Diplomatic Navy** | `#142D4E` | Primary brand identity, major typography (H1/H2), and anchor footer |
| **Classic Blue** | `#315C85` | Primary buttons, active navigation indicators, hyperlinks |
| **Muted Sky Blue** | `#7699B8` | Secondary accents, dates, badges, subtle icons |
| **Powder Blue** | `#DCE7EF` | Soft section backdrops, highlighted callouts, hover states |
| **Warm Ivory** | `#F5F1E8` | Dominant website background with architectural gridlines |
| **Soft Cream** | `#E9E1D3` | Editorial cards, inputs, secondary surface layers |

---

## Cultural References & Artworks Integrated

The visual world draws directly from discovered assets in `references/`:
1. **The Bridge of Dialogue (`founder-sister-bridge.jpg`)**: Original watercolor artwork by the founder's sister featuring an arched moon bridge and glowing paper lanterns. Serves as the central visual metaphor for intercultural bridge-building.
2. **The Courtyard of Contemplation (`founder-sister-courtyard.jpg`)**: Classical gongbi painting by the founder's sister depicting jade-tiled pavilions and blooming peonies. Embodies sanctuaries of thoughtful dialogue.
3. **Mount Fuji & Sakura (`fuji-sakura.jpg`)**: Fine-art photography celebrating transnational serenity.
4. **Neo Mirai Interaction Language (`Screen Recording...mp4`)**: Editorial split-hero layout, active dot navigation, horizontal cards, and manifesto callout banner.

---

## Key Platform Features

- **Multi-Page Architecture**: Dedicated pages for Home, About, Blog / Publications, Single Article View, Events, Single Event View, Meetups, Contact, and Admin Portal.
- **WYSIWYG TipTap Publishing**: Visual rich-text editor with headings, quotes, lists, image insertions, and autosave. No HTML or Markdown required.
- **Community Moderation Queue**: Readers submit perspectives on individual articles. All comments start as `PENDING` until the founder approves them in her moderation queue. Honeypot and rate-limiting protect against spam and abuse.
- **Event Management**: Symposia, conferences, and workshops with agendas, speakers, venues, and status tracking (Upcoming, Ongoing, Completed).
- **Public Meetups Tracker**: Informs readers where the founder will make public appearances (campus visits, salons) while strictly safeguarding personal privacy.
- **Contact Inquiry Inbox**: Stores visitor inquiries in the local database for founder review.
- **One-Click Database Backup**: Complete JSON export of all articles, comments, events, and settings.
- **Multi-Device Local Access**: Accessible locally on laptop (`http://localhost:3000`) and across mobile phones on the same Wi-Fi network (`http://192.168.1.8:3000`).

---

## Quick Start & Running the Platform

```bash
# 1. Install dependencies
npm install

# 2. Synchronize database schema
npx prisma db push

# 3. Seed initial founder account, sister artworks & articles
npm run prisma:seed

# 4. Build optimized production release
npm run build

# 5. Start server listening on all network interfaces
npm run start
```

### Access URLs:
- **Laptop Browser**: `http://localhost:3000`
- **Mobile Phones / Tablets (Same Wi-Fi)**: `http://192.168.1.8:3000`
- **Founder Dashboard**: `http://localhost:3000/admin/login`
  - **Email**: `founder@asianculturaldiplomacy.org`
  - **Password**: `CulturalDiplomacy2026!`

---

## Automated Test Suite

Run the full Playwright end-to-end test suite across Desktop and Mobile viewports:

```bash
npm run test:e2e
```

All 20 tests pass, verifying:
- Split-hero layout, navigation, and sister artwork integration
- About, Blog search, category filtering, and single article pages
- Article liking and comment moderation workflow
- Events, Meetups, and Contact inquiry submissions
- Security boundaries (401 on unauthenticated mutations, stored XSS protection, bot honeypot)
- Founder login, article publication, and comment approval

---

## Documentation Directory Map

Detailed operational and architectural documentation can be found in `docs/`:

1. [`docs/DESIGN_ANALYSIS.md`](./docs/DESIGN_ANALYSIS.md) — 12-point analysis of references, artworks, and video frames.
2. [`docs/REFERENCE_INVENTORY.md`](./docs/REFERENCE_INVENTORY.md) — Discovered asset inventory and visual purpose.
3. [`docs/ADMIN_GUIDE.md`](./docs/ADMIN_GUIDE.md) — Plain-language guide for the non-technical founder.
4. [`docs/SECURITY_REVIEW.md`](./docs/SECURITY_REVIEW.md) — OWASP threat model and defensive mechanisms.
5. [`docs/LOCAL_SETUP.md`](./docs/LOCAL_SETUP.md) — Multi-device setup and local network configuration.
6. [`docs/DEPLOYMENT_CHECKLIST.md`](./docs/DEPLOYMENT_CHECKLIST.md) — Production PostgreSQL migration and deployment roadmap.
7. [`PRODUCT.md`](./PRODUCT.md) — Impeccable durable product specification.
