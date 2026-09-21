const express = require('express');
const { pool } = require('../db');
const { mapProduct } = require('../utils/mapProduct');

const router = express.Router();

// GET /api/products — full catalog, optionally filtered
// Query params: q (name/type keyword), category (exact match)
router.get('/', async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const conditions = [];
    const values = [];

    if (category && category !== 'All') {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    if (q && String(q).trim() !== '') {
      values.push(`%${String(q).toLowerCase()}%`);
      conditions.push(`(LOWER(name) LIKE $${values.length} OR LOWER(type) LIKE $${values.length})`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM products ${where} ORDER BY category, name`,
      values
    );

    res.json({ count: rows.length, products: rows.map(mapProduct) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id — single product lookup
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(mapProduct(rows[0]));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
