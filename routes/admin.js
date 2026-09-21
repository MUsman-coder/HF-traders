const express = require('express');
const { pool } = require('../db');
const { hashPassword, requireAdmin } = require('../middleware/adminAuth');
const { mapProduct } = require('../utils/mapProduct');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// POST /api/admin/login — checks email + password, returns a token + admin identity
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const configuredName = process.env.ADMIN_NAME || 'Admin';

  if (!configuredPassword || !configuredEmail) {
    return res.status(503).json({
      error: 'Admin panel is not configured. Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env, then restart the server.',
    });
  }
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }
  if (email.trim().toLowerCase() !== configuredEmail.trim().toLowerCase() || password !== configuredPassword) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  res.json({
    success: true,
    token: hashPassword(password),
    admin: { name: configuredName, email: configuredEmail },
  });
});

// Everything below this line requires a valid admin token.
router.use(requireAdmin);

// GET /api/admin/me — current admin identity (for displaying in the sidebar)
router.get('/me', (req, res) => {
  res.json({
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || '',
  });
});

// ---------- Products ----------

router.get('/products', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY category, name');
    res.json({ products: rows.map(mapProduct) });
  } catch (err) {
    next(err);
  }
});

router.post('/products', async (req, res, next) => {
  try {
    const { id, name, category, type, grade, availability, description, imageUrl } = req.body || {};
    if (!id || !name || !category) {
      return res.status(400).json({ error: 'id, name, and category are required.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO products (id, name, category, type, grade, availability, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        id,
        name,
        category,
        type || '',
        grade || '',
        availability || 'In Stock',
        description || '',
        imageUrl || `/images/products/${id}.jpg`,
      ]
    );
    res.status(201).json({ success: true, product: mapProduct(rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `A product with id "${req.body.id}" already exists.` });
    }
    next(err);
  }
});

router.put('/products/:id', async (req, res, next) => {
  try {
    const { name, category, type, grade, availability, description, imageUrl } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           type = COALESCE($3, type),
           grade = COALESCE($4, grade),
           availability = COALESCE($5, availability),
           description = COALESCE($6, description),
           image_url = COALESCE($7, image_url)
       WHERE id = $8
       RETURNING *`,
      [name, category, type, grade, availability, description, imageUrl, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found.' });
    res.json({ success: true, product: mapProduct(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found.' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Contacts ----------

router.get('/contacts', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ contacts: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/contacts/:id/reply', async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message is required.' });

    const { rows } = await pool.query(
      `UPDATE contacts SET admin_reply = $1, replied_at = now() WHERE id = $2 RETURNING *`,
      [message, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Contact not found.' });

    await sendMail({
      to: rows[0].email,
      subject: 'HF Traders — Response to your message',
      text: `Hi ${rows[0].full_name},\n\n${message}\n\n— HF Traders`,
      html: `<p>Hi ${rows[0].full_name},</p><p>${message}</p><p>— HF Traders</p>`,
    });

    res.json({ success: true, contact: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------- Quotes ----------

router.get('/quotes', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
    res.json({ quotes: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/quotes/:id/reply', async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message is required.' });

    const { rows } = await pool.query(
      `UPDATE quotes SET admin_reply = $1, replied_at = now(), status = 'responded' WHERE id = $2 RETURNING *`,
      [message, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Quote not found.' });

    await sendMail({
      to: rows[0].email,
      subject: `HF Traders — Response to your quote request for ${rows[0].product_name}`,
      text: `Hi ${rows[0].full_name},\n\n${message}\n\n— HF Traders`,
      html: `<p>Hi ${rows[0].full_name},</p><p>${message}</p><p>— HF Traders</p>`,
    });

    res.json({ success: true, quote: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------- Business plan inquiries ----------

router.get('/business-plan-inquiries', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM business_plan_inquiries ORDER BY created_at DESC');
    res.json({ inquiries: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/business-plan-inquiries/:id/reply', async (req, res, next) => {
  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message is required.' });

    const { rows } = await pool.query(
      `UPDATE business_plan_inquiries SET admin_reply = $1, replied_at = now(), status = 'responded' WHERE id = $2 RETURNING *`,
      [message, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Inquiry not found.' });

    await sendMail({
      to: rows[0].email,
      subject: `HF Traders — Response to your ${rows[0].plan_name} plan inquiry`,
      text: `Hi ${rows[0].full_name},\n\n${message}\n\n— HF Traders`,
      html: `<p>Hi ${rows[0].full_name},</p><p>${message}</p><p>— HF Traders</p>`,
    });

    res.json({ success: true, inquiry: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------- Users ----------

router.get('/users', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, company_name, business_type, email, phone, address, avatar_url, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
