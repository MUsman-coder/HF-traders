const express = require('express');
const { pool } = require('../db');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// POST /api/contact
router.post('/', async (req, res, next) => {
  try {
    const { fullName, email, phone, message } = req.body || {};

    if (!fullName || !email || !message) {
      return res.status(400).json({ error: 'fullName, email, and message are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO contacts (full_name, email, phone, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [String(fullName).trim(), String(email).trim(), phone ? String(phone).trim() : null, String(message).trim()]
    );

    res.status(201).json({ success: true, contact: rows[0] });

    // Confirmation email to the user, and a notification to the admin —
    // sent after responding so neither ever delays the request.
    sendMail({
      to: String(email).trim(),
      subject: 'HF Traders — We received your message',
      text: `Hi ${fullName},\n\nThanks for reaching out to HF Traders. Your message has been received and our team will get back to you shortly.\n\nYour message:\n"${message}"\n\n— HF Traders`,
      html: `<p>Hi ${fullName},</p><p>Thanks for reaching out to HF Traders. Your message has been received and our team will get back to you shortly.</p><p><strong>Your message:</strong><br/>${message}</p><p>— HF Traders</p>`,
    }).catch(() => {});

    if (process.env.ADMIN_EMAIL) {
      sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `New contact message from ${fullName}`,
        text: `New contact form submission:\n\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone || '—'}\n\nMessage:\n${message}\n\nReply from the admin panel: Contacts tab.`,
        html: `<p><strong>New contact form submission</strong></p><p>Name: ${fullName}<br/>Email: ${email}<br/>Phone: ${phone || '—'}</p><p><strong>Message:</strong><br/>${message}</p><p>Reply from the admin panel → Contacts tab.</p>`,
      }).catch(() => {});
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
