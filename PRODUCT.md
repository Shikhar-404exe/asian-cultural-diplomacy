# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS, Prisma ORM with SQLite, TipTap rich-text editor, iron-session / secure cookie session auth, Playwright test suite.

## Users

1. **Founder / Solo Publisher**: Non-technical editorial leader who publishes articles, essays, and regional reflections, announces public meetups, organizes events, and moderates community comments directly from desktop, tablet, or smartphone.
2. **Global Diplomatic & Cultural Community**: Scholars, students, diplomats, cultural observers, and general public interested in authentic Asian cultural diplomacy, dialogue, and upcoming gatherings.

## Product Purpose

Serve as the premier digital publication, perspectives journal, and public engagement platform for an emerging Asian Cultural Diplomacy organisation. Enables simple single-founder publishing while presenting an impeccably designed, credible, and welcoming international face to the world.

## Positioning

Unlike generic blogging engines or corporate NGO websites, the Asian Cultural Diplomacy platform merges high-end editorial aesthetics (rooted in Asian cultural artistry and architectural discipline) with zero-friction mobile publishing and built-in community moderation.

## Operating Context

- **Local MVP**: Runs directly on the founder's laptop with LAN Wi-Fi access enabled (`0.0.0.0:3000`) for mobile testing.
- **Future Production**: Prepared for custom domain deployment with HTTPS, PostgreSQL migration compatibility, and hardened security headers.

## Capabilities and Constraints

- **Multi-page architecture**: Dedicated routes for Home, About, Blog / Publications, Article Details, Events, Event Details, Meetups, Contact, and Admin Dashboard.
- **Editorial Publishing**: TipTap visual WYSIWYG editor with rich-text, headings, quotes, image uploads, category and tag selection, draft/publish workflow, and autosave.
- **Community Dialogue**: Reader comments on individual articles with mandatory moderation queue (pending -> approved/rejected/flagged), rate limiting, honeypot spam protection, and like reactions.
- **Event Management**: Comprehensive event listing with categories (seminar, conference, workshop), agenda, speakers, venues, status (upcoming, completed, postponed, cancelled), and past archive.
- **Meetup Tracker**: Dedicated public appearances page showing where the founder will be present (university visits, conferences, networking), with explicit privacy boundaries (no private or live GPS tracking).
- **Contact Inquiries**: Secure local contact form capturing visitor messages with administrative inquiry inbox.
- **Administration**: Single-admin authenticated portal with mobile-first controls for non-technical operation.

## Brand Commitments

- **Mandatory Color Scheme**:
  - Deep Diplomatic Navy (`#142D4E`)
  - Classic Blue (`#315C85`)
  - Muted Sky Blue (`#7699B8`)
  - Powder Blue (`#DCE7EF`)
  - Warm Ivory (`#F5F1E8`)
  - Soft Cream (`#E9E1D3`)
- **Visual Identity**:
  - Cultural sophistication, scholarly credibility, whitespace, architectural gridlines.
  - Integration of founder's sister's artworks (The Moon Bridge and The Garden Pavilion) as core cultural motifs.

## Evidence on Hand

- `references/images.jpg`: Founder's sister's watercolor bridge painting.
- `references/images (1).jpg`: Founder's sister's classical pavilion painting.
- `references/photo-1490806843957-31f4c9a91c65.avif`: Mount Fuji & Sakura landscape photography.
- `references/Screen Recording 2026-11-01 195602.mp4`: Neo Mirai reference recording demonstrating editorial split hero, horizontal speaker cards, architectural grid lines, and manifesto banner.

## Product Principles

1. **Extreme Non-Technical Simplicity**: The publishing and moderation experience must feel natural, friendly, and forgiving for a non-technical founder.
2. **Cultural Reverence & Diversity**: Treat Asian culture with academic depth, nuanced regional representation, and dignified visual presentation.
3. **Uncompromising Security**: Rigorous input sanitization, rate limiting, secure password hashing (bcrypt), CSRF protection, and server-side authorization on all mutation routes.
4. **Resilient Local & Multi-Device Access**: Seamless operation across local Wi-Fi networks with persistent SQLite data and automatic seed fixtures.

## Accessibility & Inclusion

Targeting WCAG 2.1 AA compliance with high-contrast text ratios (> 11:1 for navy on ivory), keyboard focus indicators, screen-reader semantic landmarks, and full touch-target sizing (min 44px) across mobile viewports.

