const express = require('express');
const { pool } = require('../db');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// POST /api/business-plan — submitted when a user picks a plan on the Business Plans page
router.post('/', async (req, res, next) => {
  try {
    const { planName, fullName, companyName, email, phone, message } = req.body || {};

    if (!planName || !fullName || !email) {
      return res.status(400).json({ error: 'planName, fullName, and email are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO business_plan_inquiries (plan_name, full_name, company_name, email, phone, message)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        String(planName).trim(),
        String(fullName).trim(),
        companyName ? String(companyName).trim() : null,
        String(email).trim(),
        phone ? String(phone).trim() : null,
        message ? String(message).trim() : null,
      ]
    );

    res.status(201).json({ success: true, inquiry: rows[0] });

    sendMail({
      to: String(email).trim(),
      subject: `HF Traders — Your ${planName} plan inquiry was received`,
      text: `Hi ${fullName},\n\nYour order was successfully submitted. We've received your interest in the ${planName} plan and our team will follow up shortly.\n\n— HF Traders`,
      html: `<p>Hi ${fullName},</p><p>Your order was successfully submitted. We've received your interest in the <strong>${planName}</strong> plan and our team will follow up shortly.</p><p>— HF Traders</p>`,
    }).catch(() => {});

    if (process.env.ADMIN_EMAIL) {
      sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `New business plan inquiry — ${planName}`,
        text: `New business plan inquiry:\n\nPlan: ${planName}\nName: ${fullName}\nCompany: ${companyName || '—'}\nEmail: ${email}\nPhone: ${phone || '—'}\n\nMessage:\n${message || '—'}\n\nReply from the admin panel: Business Plans tab.`,
        html: `<p><strong>New business plan inquiry</strong></p><p>Plan: ${planName}<br/>Name: ${fullName}<br/>Company: ${companyName || '—'}<br/>Email: ${email}<br/>Phone: ${phone || '—'}</p><p><strong>Message:</strong><br/>${message || '—'}</p><p>Reply from the admin panel → Business Plans tab.</p>`,
      }).catch(() => {});
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
