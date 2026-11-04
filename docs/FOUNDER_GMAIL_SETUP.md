# Founder Gmail Notification Setup & Configuration Guide
**Asian Cultural Diplomacy Platform**

This guide explains how to configure automated email notifications so that the founder receives alerts whenever:
1. A reader submits a new comment awaiting moderation.
2. A visitor submits a contact or collaboration inquiry.
3. A comment is flagged for moderation review.
4. A new reader registers an account.

---

## 1. How It Works

The platform uses a resilient dispatch pipeline:
- **Primary Delivery**: Uses `nodemailer` to dispatch branded HTML emails using Gmail App Password or Gmail OAuth2.
- **Fail-Safe Operation**: If email credentials are not set, or if network/SMTP delivery encounters an error, the platform logs the event safely in the database `AuditLog` table.
- **Zero Reader Interruption**: A failure in email dispatch **never** causes comment submission or contact form submission to fail.

---

## 2. Recommended Setup: Gmail App Password (2 Minutes)

A Gmail App Password is a 16-character code that allows Nodemailer to securely send emails through your Gmail or Google Workspace account without disabling Two-Factor Authentication (2FA).

### Step 1: Generate an App Password in Google Account
1. Log in to the Google / Gmail account you want to send notifications from (e.g., `founder@asianculturaldiplomacy.org` or founder's Gmail).
2. Go to [Google Account Security](https://myaccount.google.com/security).
3. Ensure **2-Step Verification** is turned **ON**.
4. In the search bar at the top of your Google Account page, search for **"App passwords"** (or navigate to 2-Step Verification > App Passwords).
5. Enter an app name: `Asian Cultural Diplomacy`.
6. Click **Create**.
7. Google will display a 16-character code (e.g., `abcd efgh ijkl mnop`). Copy this password.

### Step 2: Configure Environment Variables in Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/) -> Select project `asian-cultural-diplomacy`.
2. Navigate to **Settings** -> **Environment Variables**.
3. Add the following variables:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `GMAIL_USER` | `founder@asianculturaldiplomacy.org` | The sending Gmail / Google Workspace address |
| `GMAIL_APP_PASSWORD` | `abcdefghijklmnop` | The 16-character App Password (spaces optional) |
| `FOUNDER_NOTIFICATION_EMAIL` | `founder@asianculturaldiplomacy.org` | Where you want notifications delivered (can be personal Gmail or work email) |

4. Check **Production**, **Preview**, and **Development** checkboxes.
5. Click **Save**.

### Step 3: Redeploy
After adding the environment variables, trigger a redeployment in Vercel (or push a commit) so the new environment variables take effect in serverless functions.

---

## 3. Alternative Setup: Generic SMTP
If you use a custom SMTP provider (e.g., Amazon SES, SendGrid, Mailgun, Brevo), you can configure:

- `SMTP_HOST`: e.g., `smtp.sendgrid.net`
- `SMTP_PORT`: `587`
- `SMTP_USER`: `apikey`
- `SMTP_PASS`: Your provider API key
- `FOUNDER_NOTIFICATION_EMAIL`: Founder's inbox email address

---

## 4. Testing Notification Delivery
1. Visit the public contact page: `https://asian-cultural-diplomacy.vercel.app/contact`
2. Submit a test inquiry.
3. Check the inbox of `FOUNDER_NOTIFICATION_EMAIL`. You will receive a branded ACD email with the sender's details and a direct button to `/admin/enquiries`.
4. In the admin dashboard at `/admin`, all inquiries and comments remain permanently accessible and manageable regardless of email delivery status.

