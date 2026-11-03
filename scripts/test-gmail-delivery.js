/**
 * Gmail / SMTP Live Delivery Verification Script
 * Tests whether active email credentials are configured and dispatches a test notification.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmailDelivery() {
  console.log('--- Gmail & Notification Delivery Verification ---');

  const gmailUser = process.env.GMAIL_USER || process.env.ADMIN_EMAIL;
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const appPassword = process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST;

  console.log('Configuration Check:');
  console.log(`- Recipient (Admin Email): ${process.env.ADMIN_EMAIL || 'Not configured'}`);
  console.log(`- Gmail Sender Account: ${gmailUser || 'Not configured'}`);
  console.log(`- OAuth2 Client ID: ${clientId ? 'Configured' : 'Missing'}`);
  console.log(`- OAuth2 Client Secret: ${clientSecret ? 'Configured' : 'Missing'}`);
  console.log(`- OAuth2 Refresh Token: ${refreshToken ? 'Configured' : 'Missing'}`);
  console.log(`- App Password: ${appPassword ? 'Configured' : 'Missing'}`);
  console.log(`- Custom SMTP Host: ${smtpHost || 'Missing'}`);

  let transporter = null;
  let authType = 'NONE';

  if (gmailUser && clientId && clientSecret && refreshToken) {
    authType = 'GMAIL_OAUTH2';
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: gmailUser,
        clientId,
        clientSecret,
        refreshToken,
      },
    });
  } else if (gmailUser && appPassword) {
    authType = 'GMAIL_APP_PASSWORD';
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: appPassword,
      },
    });
  } else if (smtpHost && process.env.SMTP_USER && process.env.SMTP_PASS) {
    authType = 'SMTP';
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (!transporter) {
    console.log('\n[RESULT: UNCONFIGURED]');
    console.log('No live external email credentials found in environment variables.');
    console.log('The platform currently operates in "Safe Simulation Mode":');
    console.log('- Alerts are recorded to console and stored in the database "AuditLog" table.');
    console.log('- Zero application crashes or unhandled rejections.');
    console.log('\nTo enable real inbox delivery, follow instructions in docs/GMAIL_SETUP.md');
    return { status: 'UNCONFIGURED', simulated: true };
  }

  console.log(`\nAttempting test dispatch via ${authType}...`);
  try {
    const info = await transporter.sendMail({
      from: `"Asian Cultural Diplomacy" <${gmailUser}>`,
      to: process.env.ADMIN_EMAIL || gmailUser,
      subject: '[ACD Live Verification] Email Delivery Test',
      text: 'This is a test notification verifying that live email delivery is operational.',
      html: '<p>This is a test notification verifying that <strong>live email delivery</strong> is operational for the Asian Cultural Diplomacy platform.</p>',
    });

    console.log('\n[RESULT: SUCCESS]');
    console.log(`Email successfully dispatched. Message ID: ${info.messageId}`);
    return { status: 'DELIVERED', messageId: info.messageId };
  } catch (err) {
    console.error('\n[RESULT: DELIVERY_FAILED]');
    console.error(`Error dispatched from mail service: ${err.message}`);
    return { status: 'FAILED', error: err.message };
  }
}

testGmailDelivery().catch(console.error);

