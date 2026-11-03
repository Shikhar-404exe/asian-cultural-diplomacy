# Localhost & Multi-Device Setup Guide
## Asian Cultural Diplomacy Platform

This document describes how to run and access the application locally on your laptop, as well as how to connect mobile phones and tablets over your local Wi-Fi network.

---

## 1. System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux.
- **Node.js**: v18.0.0 or newer (tested on Node v24.19.0).
- **npm**: v9.0.0 or newer (tested on npm 11.17.0).

---

## 2. Quick Start (First-Time Setup)

Open PowerShell or terminal in the project directory:

```powershell
# 1. Install dependencies
npm install

# 2. Push database schema to SQLite
npx prisma db push

# 3. Seed initial founder account, articles, and sister artworks
npm run prisma:seed

# 4. Build optimized production release
npm run build

# 5. Start the local server
npm run start
```

---

## 3. Accessing the Platform

### A. From Your Laptop (Localhost)
Open your laptop browser and navigate to:
```
http://localhost:3000
```

### B. From Mobile Phones & Tablets (Same Wi-Fi Network)
To access the platform from smartphones or tablets connected to the same trusted home or office Wi-Fi network:

1. Identify your laptop's current local IPv4 address:
   ```powershell
   Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object InterfaceAlias, IPAddress
   ```
   *(Currently verified at: `192.168.1.8`)*

2. Open the browser on your smartphone or tablet and enter:
   ```
   http://192.168.1.8:3000
   ```

3. Ensure Windows Firewall permits incoming connections on port `3000` for **Private Networks** only:
   ```powershell
   New-NetFirewallRule -DisplayName "Asian Cultural Diplomacy MVP (Port 3000)" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Private
   ```

---

## 4. Initial Founder Credentials

| Attribute | Default Value | Notes |
|-----------|---------------|-------|
| **Portal URL** | `http://localhost:3000/admin/login` | Also available at `http://192.168.1.8:3000/admin/login` |
| **Email** | `founder@asianculturaldiplomacy.org` | Pre-configured in seed fixture |
| **Password** | `CulturalDiplomacy2026!` | Change anytime under Settings |
| **Role** | Solo Publisher & Founder | Authorised to publish, moderate, and edit |

---

## 5. Local Database & Persistence

- The database is stored locally in `dev.db` (SQLite).
- All changes (new articles, draft revisions, reader comments, uploaded images) persist across application restarts.
- Uploaded images are stored safely in `public/uploads/`.
- To create a quick file backup of your entire database:
  ```powershell
  Copy-Item dev.db "dev_backup_$(Get-Date -Format 'yyyyMMdd_HHmm').db"
  ```
  Or use the **Download Database Snapshot (.JSON)** button in the Founder Dashboard Settings.

