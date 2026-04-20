const express = require('express');
const router = express.Router();

// Lab 04: Auth Bypass - SQL Injection Vulnerable Login
// INTENTIONALLY VULNERABLE - DO NOT USE IN PRODUCTION

router.get('/', (req, res) => {
  res.render('labs/lab04-login', {
    title: 'Seller Portal - เข้าสู่ระบบ',
    error: null
  });
});

router.post('/login', async (req, res) => {
  const pool = req.app.locals.pool;
  const { username, password } = req.body;

  try {
    // VULNERABLE: Direct string concatenation - SQL Injection possible
    // Attack: username = ' OR '1'='1  OR  username = admin'--
    const query = `SELECT * FROM seller_accounts WHERE username='${username}' AND password='${password}'`;

    console.log('[Lab04] Executing query:', query);

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Detect if login was via SQLi bypass
      // Check if the submitted credentials contain SQLi patterns or don't match DB
      const sqliPatterns = ["'", '"', '--', 'OR', 'or', '=', ';', '/*', '*/'];
      const inputContainsSqli = sqliPatterns.some(pattern =>
        username.includes(pattern) || password.includes(pattern)
      );
      const credentialsMismatch = user.username !== username || user.password !== password;
      const isBypass = inputContainsSqli || credentialsMismatch;

      // Set session
      req.session.lab04_user = {
        id: user.id,
        username: user.username,
        shop_name: user.shop_name,
        role: user.role,
        login_input: username, // Store what user typed
        bypassed: isBypass
      };
      return res.redirect('/lab04/dashboard');
    }

    res.render('labs/lab04-login', {
      title: 'Seller Portal - เข้าสู่ระบบ',
      error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    });

  } catch (err) {
    console.error('[Lab04] SQL Error:', err.message);
    res.render('labs/lab04-login', {
      title: 'Seller Portal - เข้าสู่ระบบ',
      error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    });
  }
});

router.get('/dashboard', (req, res) => {
  if (!req.session.lab04_user) {
    return res.redirect('/lab04');
  }

  res.render('labs/lab04-dashboard', {
    title: 'Seller Dashboard',
    user: req.session.lab04_user
  });
});

router.get('/logout', (req, res) => {
  delete req.session.lab04_user;
  res.redirect('/lab04');
});

module.exports = router;
