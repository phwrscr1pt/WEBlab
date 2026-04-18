const express = require('express');
const router = express.Router();

// Lab 08: Reflected XSS + Cookie Stealing
// INTENTIONALLY VULNERABLE - DO NOT USE IN PRODUCTION

// Login page
router.get('/', (req, res) => {
  if (req.cookies.thaimart_uid) {
    return res.redirect('/lab08/search');
  }
  res.render('labs/lab08-login', {
    title: 'Member Login',
    error: null
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple login check
  if (username === 'member1' && password === '1234') {
    // Set cookies (intentionally insecure for demo)
    res.cookie('thaimart_uid', 'member1', { httpOnly: false });
    res.cookie('thaimart_role', 'customer', { httpOnly: false });
    res.cookie('thaimart_session', 'sess_' + Math.random().toString(36).substr(2, 16), { httpOnly: false });

    return res.redirect('/lab08/search');
  }

  res.render('labs/lab08-login', {
    title: 'Member Login',
    error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
  });
});

// Search page (vulnerable to XSS)
router.get('/search', (req, res) => {
  if (!req.cookies.thaimart_uid) {
    return res.redirect('/lab08');
  }

  const searchQuery = req.query.q || '';

  // VULNERABLE: searchQuery passed to view without sanitization
  res.render('labs/lab08-search', {
    title: 'ค้นหาสมาชิก',
    search: searchQuery,
    user: req.cookies.thaimart_uid
  });
});

// Profile page
router.get('/profile', (req, res) => {
  if (!req.cookies.thaimart_uid) {
    return res.redirect('/lab08');
  }

  res.render('labs/lab08-profile', {
    title: 'โปรไฟล์',
    user: req.cookies.thaimart_uid,
    role: req.cookies.thaimart_role,
    session: req.cookies.thaimart_session
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('thaimart_uid');
  res.clearCookie('thaimart_role');
  res.clearCookie('thaimart_session');
  res.redirect('/lab08');
});

module.exports = router;
