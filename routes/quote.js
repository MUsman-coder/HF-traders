const express = require('express');
const { pool } = require('../db');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// POST /api/quote
router.post('/', async (req, res, next) => {
  try {
    const { productId, productName, fullName, email, phone, company, message } = req.body || {};

    if (!fullName || !email || !(productId || productName)) {
      return res.status(400).json({
        error: 'fullName, email, and productId (or productName) are required.',
      });
    }

    let resolvedProductName = productName;
    if (productId) {
      const { rows } = await pool.query('SELECT name FROM products WHERE id = $1', [productId]);
      if (rows[0]) resolvedProductName = rows[0].name;
    }

    const { rows: inserted } = await pool.query(
      `INSERT INTO quotes (product_id, product_name, full_name, email, phone, company, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        productId || null,
        resolvedProductName || 'Unspecified',
        String(fullName).trim(),
        String(email).trim(),
        phone ? String(phone).trim() : null,
        company ? String(company).trim() : null,
        message ? String(message).trim() : null,
      ]
    );

    res.status(201).json({ success: true, quote: inserted[0] });

    sendMail({
      to: String(email).trim(),
      subject: `HF Traders — Your quote request for ${resolvedProductName || 'your item'} was received`,
      text: `Hi ${fullName},\n\nYour order was successfully submitted. We've received your quote request for "${resolvedProductName}" and our team will follow up with pricing shortly.\n\n— HF Traders`,
      html: `<p>Hi ${fullName},</p><p>Your order was successfully submitted. We've received your quote request for <strong>${resolvedProductName}</strong> and our team will follow up with pricing shortly.</p><p>— HF Traders</p>`,
    }).catch(() => {});

    if (process.env.ADMIN_EMAIL) {
      sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `New quote request — ${resolvedProductName}`,
        text: `New quote request:\n\nProduct: ${resolvedProductName}\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone || '—'}\nCompany: ${company || '—'}\n\nMessage:\n${message || '—'}\n\nReply from the admin panel: Quotes tab.`,
        html: `<p><strong>New quote request</strong></p><p>Product: ${resolvedProductName}<br/>Name: ${fullName}<br/>Email: ${email}<br/>Phone: ${phone || '—'}<br/>Company: ${company || '—'}</p><p><strong>Message:</strong><br/>${message || '—'}</p><p>Reply from the admin panel → Quotes tab.</p>`,
      }).catch(() => {});
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
