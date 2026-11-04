# Asian Cultural Diplomacy — Database Cleanup & Integrity Report

## 1. Executive Summary

This report documents the pre-cleanup audit, data safety precautions, executed purges, and restoration of authentic editorial content across the Supabase PostgreSQL database for the Asian Cultural Diplomacy platform.

Prior to cleanup, the database had accumulated mock artifacts from automated test runs (timestamped test articles, synthetic `@culturaltest.org` reader accounts, and mock contact inquiries). All mock data has been purged, while 100% of authentic organizational records—including the Founder Admin account, core categories, site settings, and authentic media assets—have been preserved.

---

## 2. Pre-Cleanup Safety Precautions

Before performing any destructive operation:
1. **Full Database Snapshot**: An automated full database export was generated at:
   ```
   backups/pre_cleanup_backup_2026-11-03T18-47-33-337Z.json
   ```
   This backup contains full JSON records of all tables (`User`, `AdminUser`, `Category`, `Article`, `Event`, `Meetup`, `ContactEnquiry`, `Comment`, `MediaItem`, `SiteSettings`, and `AuditLog`).
2. **Git Safeguard**: Verified that `backups/` and `*.json` inside backups are strictly ignored in `.gitignore`, preventing sensitive credentials or data from ever leaking into version control.
3. **Transaction Safety**: Cleanup scripts were targeted specifically at test artifacts using explicit matching criteria rather than blanket table truncations.

---

## 3. Data Inventory & Cleanup Metrics

### 3.1 Purged Mock / Test Artifacts
- **Test Users Purged (10 accounts)**:
  - Synthetic accounts matching `*@culturaltest.org` created during automated registration tests.
  - Personal developer email `prajapatishikhar43@gmail.com` registered as a test reader.
- **Test Articles Purged (11 articles)**:
  - Timestamped duplicates: `Diplomatic Synergy & Shared Heritage *`
  - Incomplete autosave draft tests: `Cultural Bridges in Modern Diplomacy`
  - Manual UI input artifact: `xefsEWGswtg`
  - Associated cascaded revisions and tags were cleanly removed.
- **Test Enquiries Purged (7 inquiries)**:
  - Synthetic messages matching `*@culturaldiplomacy.test`.
- **Test Audit Logs Purged**:
  - All logs associated with test actor emails.

### 3.2 Strictly Preserved & Verified Authentic Records
- **Administrator / Founder Account**:
  - `founder@asianculturaldiplomacy.org` (Role: `ADMIN`, Name: "Founder & Director", Status: `ACTIVE`)
- **Core Editorial Categories (5 Categories)**:
  - `Diplomatic Essays` (`diplomatic-essays`)
  - `Art & Heritage` (`art-and-heritage`)
  - `Regional Dialogues` (`regional-dialogues`)
  - `Cultural Policy` (`cultural-policy`)
  - `Perspectives & Reflections` (`perspectives-and-reflections`)
- **Site Configuration (`SiteSettings` id: 1)**:
  - Official site title, mission, vision, founder biography, objectives, and areas of engagement.
- **Media Library Assets (3 Authentic Images)**:
  - `founder-sister-bridge.jpg` (`/art/founder-sister-bridge.jpg`)
  - `founder-sister-courtyard.jpg` (`/art/founder-sister-courtyard.jpg`)
  - `fuji-sakura.jpg` (`/images/fuji-sakura.jpg`)

---

## 4. Pristine Founder Starting Point & Empty State Design

In accordance with the founder handover directive, all seed and mock articles, events, and meetups have been completely purged from the production database. The platform is delivered in a pristine, blank-canvas state ready for the founder to publish her authentic work directly through the Publisher Portal.

All public pages (`/blog`, `/events`, `/meetups`, and `/admin`) display polished, respectful empty states that explain to visitors that inaugural publications and announcements are currently in preparation.

---

## 5. Post-Cleanup Verification Counts

```json
{
  "users": 1,
  "adminUsers": 1,
  "articles": 0,
  "events": 0,
  "meetups": 0,
  "comments": 0,
  "enquiries": 0,
  "categories": 5,
  "siteSettings": 1,
  "mediaItems": 3
}
```
All tables are in an authentic, production-ready state with zero test or mock pollution. The founder account (`founder@asianculturaldiplomacy.org`), 5 core categories, site settings, and 3 artwork media assets are intact and verified.

