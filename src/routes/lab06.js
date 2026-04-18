const express = require('express');
const router = express.Router();

// Lab 06: SQLmap Target - Product Category Page
// INTENTIONALLY VULNERABLE - DO NOT USE IN PRODUCTION
// Designed for: sqlmap -u "http://TARGET/lab06?id=1" --dbs

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const categoryId = req.query.id;

  // If no id parameter, show the instruction page
  if (!categoryId) {
    return res.render('labs/lab06', {
      title: 'SQLmap Lab'
    });
  }

  // If id parameter exists, show the vulnerable target page
  let products = [];
  let category = null;
  let error = null;

  try {
    // VULNERABLE: Numeric injection (no quotes) - SQLmap will work easily
    // Attack: sqlmap -u "http://localhost/lab06?id=1" --dbs
    // The id parameter is directly concatenated without quotes

    const categoryQuery = `SELECT * FROM categories WHERE id=${categoryId}`;
    console.log('[Lab06] Category query:', categoryQuery);

    const catResult = await pool.query(categoryQuery);
    if (catResult.rows.length > 0) {
      category = catResult.rows[0];
    }

    const productsQuery = `SELECT * FROM category_products WHERE category_id=${categoryId}`;
    console.log('[Lab06] Products query:', productsQuery);

    const prodResult = await pool.query(productsQuery);
    products = prodResult.rows;

  } catch (err) {
    console.error('[Lab06] SQL Error:', err.message);
    error = err.message;
  }

  res.render('labs/lab06-target', {
    title: category ? category.name : 'หมวดหมู่สินค้า',
    categoryId: categoryId,
    category: category,
    products: products,
    error: error
  });
});

module.exports = router;
