import nodemailer from 'nodemailer';
import { prisma } from './prisma';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Creates a transporter based on available environment credentials:
 * 1. Gmail OAuth2 (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN)
 * 2. Gmail App Password (GMAIL_USER, GMAIL_APP_PASSWORD)
 * 3. Generic SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 * Returns null if no active credentials are configured.
 */
function createTransporter() {
  const gmailUser = process.env.GMAIL_USER || process.env.ADMIN_EMAIL;
  const gmailClientId = process.env.GMAIL_CLIENT_ID;
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  // 1. Gmail OAuth2
  if (gmailUser && gmailClientId && gmailClientSecret && gmailRefreshToken) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: gmailUser,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken,
      },
    });
  }

  // 2. Gmail App Password
  if (gmailUser && gmailAppPassword) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });
  }

  // 3. Generic SMTP
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return null;
}

/**
 * Generates an Asian Cultural Diplomacy branded HTML email template.
 */
function generateBrandedHtml(title: string, subtitle: string, contentHtml: string, actionUrl?: string, actionText?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullActionUrl = actionUrl?.startsWith('http') ? actionUrl : `${appUrl}${actionUrl || ''}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F5F1E8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #142D4E;
    }
    .wrapper {
      width: 100%;
      background-color: #F5F1E8;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #DCE7EF;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(20, 45, 78, 0.05);
    }
    .header {
      background-color: #142D4E;
      padding: 32px 40px;
      text-align: left;
      border-bottom: 2px solid #7699B8;
    }
    .brand-eyebrow {
      color: #DCE7EF;
      font-size: 11px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .brand-title {
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .body-content {
      padding: 36px 40px;
    }
    .notice-title {
      font-size: 18px;
      font-weight: 600;
      color: #142D4E;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .notice-subtitle {
      font-size: 14px;
      color: #7699B8;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .data-box {
      background-color: #F8FAFC;
      border-left: 3px solid #315C85;
      padding: 16px 20px;
      margin-bottom: 24px;
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
    }
    .btn-action {
      display: inline-block;
      background-color: #315C85;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 3px;
      margin-top: 8px;
      margin-bottom: 12px;
    }
    .footer {
      background-color: #F5F1E8;
      padding: 24px 40px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-eyebrow">Asian Cultural Diplomacy</div>
        <div class="brand-title">Editorial & Engagement Platform</div>
      </div>
      <div class="body-content">
        <h2 class="notice-title">${title}</h2>
        <p class="notice-subtitle">${subtitle}</p>
        <div class="content-main">
          ${contentHtml}
        </div>
        ${actionUrl && actionText ? `
          <div style="margin-top: 24px;">
            <a href="${fullActionUrl}" class="btn-action">${actionText}</a>
          </div>
        ` : ''}
      </div>
      <div class="footer">
        <p style="margin: 0 0 4px 0;">This is an automated notification from your Asian Cultural Diplomacy Platform.</p>
        <p style="margin: 0;">To update your notification preferences, visit your administrator settings.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Resolves the destination email address for founder notifications.
 * Supports FOUNDER_NOTIFICATION_EMAIL (e.g. founder's Gmail), falling back to ADMIN_EMAIL or default.
 */
export function getNotificationRecipient(): string {
  return (
    process.env.FOUNDER_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'founder@asianculturaldiplomacy.org'
  ).trim();
}

/**
 * Core dispatch function.
 * Attempts real sending via nodemailer; if unconfigured, logs to AuditLog and console.
 */
async function sendNotificationEmail(payload: EmailPayload) {
  const transporter = createTransporter();
  const fromAddress = process.env.GMAIL_USER || process.env.ADMIN_EMAIL || 'founder@asianculturaldiplomacy.org';

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"Asian Cultural Diplomacy" <${fromAddress}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || 'Notification from Asian Cultural Diplomacy',
      });
      console.log(`[Email Dispatched] To: ${payload.to} Subject: "${payload.subject}" MessageId: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[Email Dispatch Error]', err?.message || err);
      // Fallback: record in audit log
    }
  }

  // Record dispatch simulation in AuditLog so local development and environments without active SMTP still preserve notifications
  try {
    await prisma.auditLog.create({
      data: {
        action: 'NOTIFICATION_SIMULATED',
        actorEmail: fromAddress,
        details: JSON.stringify({
          to: payload.to,
          subject: payload.subject,
          timestamp: new Date().toISOString(),
          status: transporter ? 'FAILED_FALLBACK' : 'UNCONFIGURED_CREDENTIALS',
        }),
      },
    });
  } catch (dbErr) {
    // Ignore audit log error in edge cases
  }

  console.log(`[Notification Recorded] To: ${payload.to} | Subject: "${payload.subject}"`);
  return { sent: false, simulated: true };
}

/**
 * Triggers notification when a new reader registers an account.
 */
export async function notifyNewReaderRegistration(name: string, email: string) {
  const adminEmail = getNotificationRecipient();

  const title = 'New Reader Registered';
  const subtitle = 'A new reader has joined the Asian Cultural Diplomacy dialogue platform.';
  const content = `
    <div class="data-box">
      <strong>Reader Name:</strong> ${name}<br>
      <strong>Reader Email:</strong> ${email}<br>
      <strong>Registered At:</strong> ${new Date().toLocaleString()}
    </div>
    <p>This reader now has access to participate in article dialogues and manage their reading profile.</p>
  `;

  const html = generateBrandedHtml(title, subtitle, content, '/admin', 'View Platform Overview');
  return await sendNotificationEmail({
    to: adminEmail,
    subject: `[ACD Alert] New Reader Registration: ${name}`,
    html,
  });
}

/**
 * Triggers notification when a new comment is posted on an article.
 */
export async function notifyNewComment(articleTitle: string, authorName: string, commentContent: string, commentId: string) {
  const adminEmail = getNotificationRecipient();

  const title = 'New Reader Comment Submitted';
  const subtitle = `A comment has been posted on "${articleTitle}".`;
  const content = `
    <div class="data-box">
      <strong>Author:</strong> ${authorName}<br>
      <strong>Article:</strong> ${articleTitle}<br>
      <strong>Comment:</strong><br>
      <div style="margin-top: 8px; font-style: italic; color: #1e293b;">"${commentContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</div>
    </div>
    <p>You can review and moderate this comment directly from the moderation portal.</p>
  `;

  const html = generateBrandedHtml(title, subtitle, content, '/admin/comments', 'Review & Moderate Comment');
  return await sendNotificationEmail({
    to: adminEmail,
    subject: `[ACD Comment] New comment on "${articleTitle}"`,
    html,
  });
}

/**
 * Triggers notification when a reader or automated filter flags a comment.
 */
export async function notifyFlaggedComment(articleTitle: string, authorName: string, commentContent: string, reason: string) {
  const adminEmail = getNotificationRecipient();

  const title = 'Comment Flagged for Moderation';
  const subtitle = `A comment on "${articleTitle}" requires urgent moderation attention.`;
  const content = `
    <div class="data-box" style="border-left-color: #B91C1C;">
      <strong>Author:</strong> ${authorName}<br>
      <strong>Reason for Flag:</strong> <span style="color: #B91C1C; font-weight: bold;">${reason}</span><br>
      <strong>Comment Text:</strong><br>
      <div style="margin-top: 8px; font-style: italic;">"${commentContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</div>
    </div>
  `;

  const html = generateBrandedHtml(title, subtitle, content, '/admin/comments', 'Open Moderation Queue');
  return await sendNotificationEmail({
    to: adminEmail,
    subject: `[ACD Moderation Flag] Comment on "${articleTitle}"`,
    html,
  });
}

/**
 * Triggers notification when a visitor submits a contact enquiry.
 */
export async function notifyContactEnquiry(senderName: string, senderEmail: string, subject: string, message: string) {
  const adminEmail = getNotificationRecipient();

  const title = 'New Diplomatic Contact Enquiry';
  const subtitle = `Received enquiry: "${subject}"`;
  const content = `
    <div class="data-box">
      <strong>From:</strong> ${senderName} (&lt;${senderEmail}&gt;)<br>
      <strong>Subject:</strong> ${subject}<br>
      <strong>Message:</strong><br>
      <div style="margin-top: 8px; white-space: pre-line;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
  `;

  const html = generateBrandedHtml(title, subtitle, content, '/admin/enquiries', 'View All Enquiries');
  return await sendNotificationEmail({
    to: adminEmail,
    subject: `[ACD Enquiry] ${subject} - ${senderName}`,
    html,
  });
}

