const express = require('express');
const router = express.Router();

// Lab 07: Reflected XSS - Product Search
// INTENTIONALLY VULNERABLE - DO NOT USE IN PRODUCTION

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const searchQuery = req.query.q || '';

  let products = [];

  if (searchQuery) {
    try {
      // Safe query for products (not the vulnerability here)
      const result = await pool.query(
        'SELECT * FROM search_products WHERE name ILIKE $1 LIMIT 10',
        [`%${searchQuery}%`]
      );
      products = result.rows;
    } catch (err) {
      console.error('[Lab07] DB Error:', err.message);
    }
  }

  // VULNERABLE: The searchQuery is passed directly to the view and rendered without escaping
  // The view uses <%- %> instead of <%= %> for raw output
  res.render('labs/lab07', {
    title: 'ค้นหาสินค้า',
    search: searchQuery, // This will be rendered raw in the view
    products: products
  });
});

module.exports = router;
