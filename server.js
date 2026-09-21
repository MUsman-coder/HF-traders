require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const productsRouter = require('./routes/products');
const contactRouter = require('./routes/contact');
const quoteRouter = require('./routes/quote');
const signupRouter = require('./routes/signup');
const businessPlanRouter = require('./routes/business-plan');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
// Default body-size limit is 100kb, far too small for a base64-encoded
// profile photo (which can easily be 1-2MB) — raised to 5mb to fit.
app.use(express.json({ limit: '5mb' }));

// Health check — also verifies the database connection
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      database: 'unreachable',
      hint: 'Check DATABASE_URL in .env and that Postgres is running, then run "npm run db:setup".',
      error: err.message,
    });
  }
});

app.use('/api/products', productsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/quote', quoteRouter);
app.use('/api/signup', signupRouter);
app.use('/api/business-plan', businessPlanRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That file is too large. Please use a smaller image.' });
  }
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`HF Traders backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
