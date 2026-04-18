const express = require('express');
const router = express.Router();

// Lab 09: Stored XSS - Product Reviews
// INTENTIONALLY VULNERABLE - DO NOT USE IN PRODUCTION

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;

  let reviews = [];
  try {
    const result = await pool.query(
      'SELECT * FROM reviews ORDER BY created_at DESC LIMIT 20'
    );
    reviews = result.rows;
  } catch (err) {
    console.error('[Lab09] DB Error:', err.message);
  }

  res.render('labs/lab09', {
    title: 'รีวิวสินค้า',
    reviews: reviews,
    success: req.query.success || null
  });
});

router.post('/submit', async (req, res) => {
  const pool = req.app.locals.pool;
  const { reviewer_name, content } = req.body;

  try {
    // VULNERABLE: Storing user input directly without sanitization
    // The stored content will be rendered without escaping in the view
    await pool.query(
      'INSERT INTO reviews (product_id, reviewer_name, content) VALUES ($1, $2, $3)',
      [1, reviewer_name, content]
    );

    console.log('[Lab09] New review stored:', { reviewer_name, content });

    res.redirect('/lab09?success=1');
  } catch (err) {
    console.error('[Lab09] Insert Error:', err.message);
    res.redirect('/lab09');
  }
});

module.exports = router;
