const crypto = require('crypto');

/**
 * Simple shared-secret admin auth: the admin token is a SHA-256 hash of the
 * ADMIN_PASSWORD env var. The frontend computes/receives this same hash on
 * login and sends it back as `x-admin-token` on every admin request.
 *
 * This is intentionally lightweight (no user accounts, no sessions table)
 * since there's a single admin. For multiple admin users or finer-grained
 * permissions, swap this for real authentication (e.g. sessions or JWT tied
 * to rows in the `users` table with an `is_admin` flag).
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function requireAdmin(req, res, next) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) {
    return res.status(503).json({
      error: 'Admin panel is not configured. Set ADMIN_PASSWORD in backend/.env.',
    });
  }

  const token = req.header('x-admin-token');
  if (!token || token !== hashPassword(configuredPassword)) {
    return res.status(401).json({ error: 'Invalid or missing admin credentials.' });
  }

  next();
}

module.exports = { hashPassword, requireAdmin };
