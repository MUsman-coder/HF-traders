const nodemailer = require('nodemailer');

let transporter = null;
let attempted = false;

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

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
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, '') },
  });
  console.log('[mailer] SMTP configured — emails will be sent via SMTP.');
  return transporter;
}

const sendMail = async({
  to,subject,text,html
})=>{

  const initializeTransporter = getTransporter();
  if (!initializeTransporter) {
    console.log(`[mailer] (not sent — SMTP unconfigured) To: ${to} | Subject: ${subject}`);
    return { sent: false };
  }

  const from = process.env.MAIL_FROM || 'HF Traders <hanifusman695@gmail.com>';
  const mailOptions = { from, to, subject, text, html };

  try {
    await initializeTransporter.sendMail(mailOptions);
    return { sent: true };
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message);
    return { sent: false, error: err.message };
  }



}

// async function verifyMailer() {
//   if (hasResendConfig()) {
//     try {
//       const response = await fetch('https://api.resend.com/domains', {
//         headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
//       });
//       if (!response.ok) {
//         const details = await response.text();
//         console.error('[mailer] Resend verification failed:', response.status, details);
//         return { configured: true, connected: false, provider: 'resend', error: `Resend HTTP ${response.status}` };
//       }
//       return { configured: true, connected: true, provider: 'resend' };
//     } catch (err) {
//       console.error('[mailer] Resend verification request failed:', err.message);
//       return { configured: true, connected: false, provider: 'resend', error: err.message };
//     }
//   }

//   const t = getTransporter();
//   if (!t) return { configured: false, connected: false, provider: 'smtp' };

//   try {
//     await t.verify();
//     return { configured: true, connected: true, provider: 'smtp' };
//   } catch (err) {
//     console.error('[mailer] SMTP verification failed:', err.code || err.message);
//     return { configured: true, connected: false, provider: 'smtp', error: err.code || err.message };
//   }
// }


// async function sendMail({ to, subject, text, html }) {
//   if (hasResendConfig()) {
//     try {
//       const response = await fetch('https://api.resend.com/emails', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           from: process.env.RESEND_FROM,
//           to: [to],
//           subject,
//           text,
//           html,
//         }),
//       });

//       if (!response.ok) {
//         const details = await response.text();
//         console.error('[mailer] Resend failed:', response.status, details);
//         return { sent: false, error: `Resend HTTP ${response.status}` };
//       }
//       return { sent: true, provider: 'resend' };
//     } catch (err) {
//       console.error('[mailer] Resend request failed:', err.message);
//       return { sent: false, error: err.message };
//     }
//   }
//   const from = process.env.MAIL_FROM || 'HF Traders <no-reply@hftraders.com>';
//   const t = getTransporter();

//   if (!t) {
//     console.log(`[mailer] (not sent — SMTP unconfigured) To: ${to} | Subject: ${subject}`);
//     return { sent: false };
//   }

//   try {
//     await t.sendMail({ from, to, subject, text, html });
//     return { sent: true };
//   } catch (err) {
//     console.error('[mailer] Failed to send email:', err.message);
//     return { sent: false, error: err.message };
//   }
// }

module.exports = { sendMail };
