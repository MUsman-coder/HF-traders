const nodemailer = require('nodemailer');

let transporter = null;
let attempted = false;

function getTransporter() {
  if (attempted) return transporter;
  attempted = true;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      '[mailer] SMTP not configured — emails will be logged to the console instead of sent. ' +
        'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM in backend/.env to send real emails.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs it to the console.
 * Never throws — a failed/unconfigured email should never break the
 * request that triggered it (a submitted quote/contact form still
 * succeeds even if the confirmation email can't go out).
 */
async function sendMail({ to, subject, text, html }) {
  const from = process.env.MAIL_FROM || 'HF Traders <no-reply@hftraders.com>';
  const t = getTransporter();

  if (!t) {
    console.log(`[mailer] (not sent — SMTP unconfigured) To: ${to} | Subject: ${subject}`);
    return { sent: false };
  }

  try {
    await t.sendMail({ from, to, subject, text, html });
    return { sent: true };
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendMail };
