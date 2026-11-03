# Database Backup, Archival & Disaster Recovery Guide

This document outlines the backup policies, automated snapshot mechanisms, and restoration procedures for the **Asian Cultural Diplomacy** platform.

---

## 1. Automated & On-Demand Backup Architecture

The platform supports multiple layers of data safety:

1. **Pre-Cleanup Automated Backup**:
   - Before executing the demo data purge in Phase 2, a verified backup of the database was archived at:
     ```
     backups/dev_pre_cleanup_20261103_201108.db
     ```
2. **One-Click Administrator Snapshot**:
   - The founder can trigger a full snapshot at any time via the administrator dashboard:
     - Navigate to `/admin/settings`.
     - Click **Download Full Database Snapshot (.db)**.
     - The endpoint (`/api/backup`) generates a timestamped copy of `prisma/dev.db` with headers prompting direct browser download.
3. **Scheduled Nightly Backups (Production)**:
   - When deployed on Supabase or Railway, automated daily WAL backups are maintained with point-in-time recovery (PITR).

---

## 2. Restoration Procedure (Local SQLite)

If disaster strikes or data needs to be rolled back to a previous snapshot:

### Step 1: Stop the Server
```bash
# Terminate the running Next.js instance
Ctrl + C
```

### Step 2: Replace the Database File
```bash
# On Windows PowerShell
Copy-Item "backups/dev_pre_cleanup_20261103_201108.db" "prisma/dev.db" -Force

# On Linux/macOS
cp backups/dev_pre_cleanup_20261103_201108.db prisma/dev.db
```

### Step 3: Resync Schema & Client
```bash
npx prisma generate
```

### Step 4: Restart the Application
```bash
npm run dev
```

---

## 3. Safe Demo Data Cleanup Script

The cleanup script developed in Phase 2 is located at:
```
scripts/cleanup-demo-data.js
```

### Safety Features:
- **Dry-Run Mode**: Inspects and lists all identified demo records without deleting anything:
  ```bash
  node scripts/cleanup-demo-data.js --dry-run
  ```
- **Automatic Pre-Execution Backup**: When `--confirm` is provided, the script automatically copies `prisma/dev.db` to a new timestamped file in `backups/` before deleting any rows:
  ```bash
  node scripts/cleanup-demo-data.js --confirm
  ```
- **Preservation Rules**:
  - Never touches the Administrator account.
  - Never touches categories or required system structures.
  - Leaves genuine user articles and approved comments untouched.

