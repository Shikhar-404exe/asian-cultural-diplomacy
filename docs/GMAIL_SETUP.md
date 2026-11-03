# Gmail API & Notification Integration Guide

This guide details how to configure transactional and administrative notifications for the **Asian Cultural Diplomacy** platform using Google Workspace / Gmail API (OAuth 2.0) or Google App Passwords.

---

## 1. Automated Notification Events

When enabled in **Administrator Settings**, the platform dispatches emails formatted with Deep Diplomatic Navy (`#142D4E`) headers and Warm Ivory (`#F5F1E8`) styling for the following events:

| Event | Recipient | Trigger Condition |
|---|---|---|
| **New Reader Registration** | Founder (`ADMIN_EMAIL`) | Triggered when a new reader registers at `/register`. |
| **New Reader Comment** | Founder (`ADMIN_EMAIL`) | Triggered when a reader posts a comment on an article. |
| **Comment Moderation Flag** | Founder (`ADMIN_EMAIL`) | Triggered when a comment is flagged for editorial civility review. |
| **Diplomatic Contact Enquiry** | Founder (`ADMIN_EMAIL`) | Triggered when a visitor submits the contact form at `/contact`. |

---

## 2. Option A: Gmail OAuth 2.0 (Recommended for Production)

OAuth 2.0 is the most secure and robust method for sending notifications without exposing passwords.

### Step 1: Create a Google Cloud Project
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project: `Asian Cultural Diplomacy Platform`.
3. In the sidebar, navigate to **APIs & Services > Library**.
4. Search for **Gmail API** and click **Enable**.

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** (or **Internal** if using Google Workspace organization).
3. Fill in:
   - **App name**: `Asian Cultural Diplomacy Platform`
   - **User support email**: `founder@asianculturaldiplomacy.org`
   - **Developer contact information**: Your technical administrator email.
4. Add the scope: `https://mail.google.com/` (or `https://www.googleapis.com/auth/gmail.send`).
5. Add your founder Gmail address as a **Test User** (if in testing mode).

### Step 3: Create OAuth Client ID
1. Navigate to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Application Type: **Web application**.
4. Authorized Redirect URIs:
   - Add `https://developers.google.com/oauthplayground` (used to obtain refresh token).
   - Add your production domain: `https://your-domain.org/api/auth/google`.
5. Click **Create** and record your **Client ID** and **Client Secret**.

### Step 4: Obtain Refresh Token via Google OAuth Playground
1. Open the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
2. Click the gear icon (top right):
   - Check **Use your own OAuth credentials**.
   - Paste your **OAuth Client ID** and **OAuth Client Secret**.
3. Under **Step 1 (Select & authorize APIs)**:
   - In the input box, paste: `https://mail.google.com/`
   - Click **Authorize APIs** and sign in with the founder's Gmail account.
4. Under **Step 2 (Exchange authorization code for tokens)**:
   - Click **Exchange authorization code for tokens**.
   - Copy the generated **Refresh token**.

### Step 5: Configure `.env`
Add the acquired values to your `.env` or deployment secrets:
```env
GMAIL_USER="founder@asianculturaldiplomacy.org"
GMAIL_CLIENT_ID="1234567890-abcdef.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="GOCSPX-yourClientSecret"
GMAIL_REFRESH_TOKEN="1//04yourRefreshToken"
```

---

## 3. Option B: Gmail App Password (Quick Setup)

If you do not wish to use OAuth 2.0, you can configure a 16-character Google App Password:

1. Log into your Google Account at [myaccount.google.com](https://myaccount.google.com).
2. Ensure **2-Step Verification** is turned on.
3. In the search bar at top, type **App passwords**.
4. Create a new app password named `AsianCulturalDiplomacy`.
5. Google will display a 16-character code (e.g., `abcd efgh ijkl mnop`).
6. Add to `.env`:
   ```env
   GMAIL_USER="founder@asianculturaldiplomacy.org"
   GMAIL_APP_PASSWORD="abcdefghijklmnop"
   ```

---

## 4. Option C: Generic SMTP Relay

For enterprise or custom SMTP providers (e.g., Postmark, SendGrid, Amazon SES, Mailgun):

```env
SMTP_HOST="smtp.mailprovider.com"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-smtp-secret"
```

---

## 5. Development Simulation & Safe Fallback

If no Gmail credentials are configured in local development:
- The system **will not fail** or throw unhandled exceptions.
- It logs an informative simulation note in the console:
  ```
  [Notification Recorded] To: founder@asianculturaldiplomacy.org | Subject: "[ACD Alert] New Reader Registration: ..."
  ```
- It automatically inserts a structured record into the database table `AuditLog` (`action: "NOTIFICATION_SIMULATED"`).
- The founder can review simulated alerts directly in the database or admin logs.

---

## 6. Testing Notifications

To verify notification delivery:
1. Log into the administrator dashboard at `/admin`.
2. Navigate to `/admin/settings`.
3. Verify that **Enable Gmail & Email Notifications** is checked.
4. Submit a test inquiry on `/contact` or create a new reader account on `/register`.
5. Check the destination inbox or developer console.

