const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function sanitizeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    companyName: row.company_name,
    businessType: row.business_type,
    email: row.email,
    phone: row.phone,
    address: row.address,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

// POST /api/signup
router.post('/', async (req, res, next) => {
  try {
    const { fullName, companyName, businessType, email, phone, address, password, confirmPassword } =
      req.body || {};

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'fullName, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (confirmPassword !== undefined && confirmPassword !== password) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows[0]) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (full_name, company_name, business_type, email, phone, address, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        String(fullName).trim(),
        companyName ? String(companyName).trim() : null,
        businessType || null,
        normalizedEmail,
        phone ? String(phone).trim() : null,
        address ? String(address).trim() : null,
        passwordHash,
      ]
    );

    res.status(201).json({ success: true, user: sanitizeUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// POST /api/signup/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ success: true, user: sanitizeUser(user) });

    sendMail({
      to: user.email,
      subject: 'HF Traders — You just logged in',
      text: `Hi ${user.full_name},\n\nYour account was just logged in successfully.\n\nIf this wasn't you, please contact us right away at hftraders625@gmail.com.\n\n— HF Traders`,
      html: `<p>Hi ${user.full_name},</p><p>Your account was just logged in successfully.</p><p>If this wasn't you, please contact us right away at hftraders625@gmail.com.</p><p>— HF Traders</p>`,
    }).catch(() => {});
  } catch (err) {
    next(err);
  }
});

// POST /api/signup/forgot-password
// Creates a reset token. NOTE: for a real public deployment, email this link
// to the user instead of returning it in the response — see README.
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'email is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    const user = rows[0];

    // Always respond the same way whether or not the account exists,
    // so the endpoint can't be used to check which emails are registered.
    const genericResponse = {
      success: true,
      message: 'If an account exists for that email, a password reset link has been generated.',
    };

    if (!user) {
      return res.json(genericResponse);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.id, token, expiresAt]
    );

    // Returned directly here only because this app has no email service wired up yet.
    // Replace this with an actual email send before using in production.
    res.json({ ...genericResponse, devResetToken: token, devResetUrl: `/reset-password?token=${token}` });
  } catch (err) {
    next(err);
  }
});

// POST /api/signup/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ error: 'token and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > now()`,
      [token]
    );
    const resetRecord = rows[0];

    if (!resetRecord) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      passwordHash,
      resetRecord.user_id,
    ]);
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [resetRecord.id]);

    res.json({ success: true, message: 'Password has been reset. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/signup/avatar — updates a user's profile picture.
// Accepts either a Cloudinary (or any) HTTPS image URL — the normal path
// now that uploads go straight to Cloudinary from the browser — or a
// base64 data URL as a fallback for when Cloudinary isn't configured.
router.post('/avatar', async (req, res, next) => {
  try {
    const { userId, avatarUrl, avatarDataUrl } = req.body || {};
    const url = avatarUrl || avatarDataUrl;

    if (!userId || !url) {
      return res.status(400).json({ error: 'userId and avatarUrl are required.' });
    }

    const isHttpsUrl = /^https:\/\//.test(url);
    const isDataUrl = String(url).startsWith('data:image/');
    if (!isHttpsUrl && !isDataUrl) {
      return res.status(400).json({ error: 'avatarUrl must be an https:// image URL or an image data URL.' });
    }
    // Data URLs are stored directly in Postgres, so keep them small.
    // Cloudinary URLs are just short links, so this limit doesn't apply to those.
    if (isDataUrl && url.length > 2_000_000) {
      return res.status(400).json({ error: 'Image is too large. Please use a smaller photo (under ~1.5MB).' });
    }

    const { rows } = await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING *',
      [url, userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found.' });

    res.json({ success: true, user: sanitizeUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
