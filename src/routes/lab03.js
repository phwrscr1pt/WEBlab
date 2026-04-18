const express = require('express');
const router = express.Router();

// Lab 03: SQL Playground - Students type SQL themselves
// Educational SQL executor with safety restrictions

// Blocked keywords
const BLOCKED_KEYWORDS = ['DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE', 'VACUUM', 'COPY'];

// Allowed table
const ALLOWED_TABLE = 'playground_products';

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;

  // Get current table data
  let products = [];
  try {
    const result = await pool.query('SELECT * FROM playground_products ORDER BY id');
    products = result.rows;
  } catch (err) {
    console.error('[Lab03] DB Error:', err.message);
  }

  res.render('labs/lab03', {
    title: 'SQL Playground',
    query: null,
    result: null,
    products: products,
    error: null,
    success: null
  });
});

router.post('/execute', async (req, res) => {
  const pool = req.app.locals.pool;
  const { sql } = req.body;

  let result = null;
  let error = null;
  let success = null;
  let products = [];

  // Get current table data first
  try {
    const prodResult = await pool.query('SELECT * FROM playground_products ORDER BY id');
    products = prodResult.rows;
  } catch (err) {
    console.error('[Lab03] DB Error:', err.message);
  }

  if (!sql || !sql.trim()) {
    error = 'กรุณากรอกคำสั่ง SQL';
  } else {
    const upperSQL = sql.toUpperCase();

    // Check for blocked keywords
    const blockedFound = BLOCKED_KEYWORDS.find(kw => upperSQL.includes(kw));
    if (blockedFound) {
      error = `คำสั่ง ${blockedFound} ไม่อนุญาตให้ใช้ใน Lab นี้`;
    }
    // Check if query targets allowed table
    else if (!upperSQL.includes('PLAYGROUND_PRODUCTS') &&
             !upperSQL.includes('playground_products')) {
      // Allow information_schema for learning
      if (!upperSQL.includes('INFORMATION_SCHEMA')) {
        error = 'อนุญาตให้ใช้คำสั่งกับตาราง playground_products เท่านั้น';
      }
    }

    if (!error) {
      try {
        console.log('[Lab03] Executing:', sql);
        const queryResult = await pool.query(sql);

        if (queryResult.rows && queryResult.rows.length > 0) {
          result = queryResult.rows;
        } else if (queryResult.rowCount !== null) {
          success = `คำสั่งสำเร็จ! (${queryResult.rowCount} แถวได้รับผลกระทบ)`;
        }

        // Refresh products after modification
        const refreshResult = await pool.query('SELECT * FROM playground_products ORDER BY id');
        products = refreshResult.rows;

      } catch (err) {
        console.error('[Lab03] SQL Error:', err.message);
        error = `SQL Error: ${err.message}`;
      }
    }
  }

  res.render('labs/lab03', {
    title: 'SQL Playground',
    query: sql,
    result: result,
    products: products,
    error: error,
    success: success
  });
});

router.post('/reset', async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    // Delete all and re-insert seed data
    await pool.query('DELETE FROM playground_products');
    await pool.query(`
      INSERT INTO playground_products (id, name, price, stock, category) VALUES
      (1, 'iPhone 15 Pro Max', 48900, 50, 'อิเล็กทรอนิกส์'),
      (2, 'Samsung Galaxy S24', 35900, 30, 'อิเล็กทรอนิกส์'),
      (3, 'MacBook Pro 14"', 69900, 15, 'คอมพิวเตอร์'),
      (4, 'AirPods Pro 2', 8990, 100, 'อุปกรณ์เสริม'),
      (5, 'เสื้อยืด Cotton', 299, 500, 'แฟชั่น'),
      (6, 'กางเกงยีนส์', 890, 200, 'แฟชั่น'),
      (7, 'รองเท้าวิ่ง Nike', 4500, 80, 'กีฬา'),
      (8, 'กระเป๋าเป้', 1290, 60, 'กระเป๋า'),
      (9, 'นาฬิกา Smart Watch', 2990, 40, 'อุปกรณ์เสริม'),
      (10, 'หูฟัง Bluetooth', 1590, 120, 'อุปกรณ์เสริม')
    `);
    // Reset sequence
    await pool.query("SELECT setval('playground_products_id_seq', 10, true)");

    console.log('[Lab03] Table reset to seed data');
  } catch (err) {
    console.error('[Lab03] Reset Error:', err.message);
  }

  res.redirect('/lab03');
});

module.exports = router;
