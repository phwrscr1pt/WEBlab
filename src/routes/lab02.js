const express = require('express');
const router = express.Router();

// Lab 02: Stateless Demo - Member Login
// Credentials: user1 / password123
// Theme: light / dark / orange (stored in thaimart_theme cookie)

// Valid themes
const VALID_THEMES = ['light', 'dark', 'orange'];

// Middleware to get common template variables
function getCommonVars(req) {
  return {
    isLoggedIn: !!req.cookies.thaimart_session,
    username: req.cookies.thaimart_user || null,
    theme: VALID_THEMES.includes(req.cookies.thaimart_theme)
      ? req.cookies.thaimart_theme
      : 'light'
  };
}

router.get('/', (req, res) => {
  const vars = getCommonVars(req);
  res.render('labs/lab02-home', {
    title: 'ระบบสมาชิก ThaiMart',
    ...vars
  });
});

router.get('/login', (req, res) => {
  // If already logged in, redirect to profile
  if (req.cookies.thaimart_session) {
    return res.redirect('/lab02/profile');
  }
  const vars = getCommonVars(req);
  res.render('labs/lab02-login', {
    title: 'เข้าสู่ระบบ',
    error: null,
    ...vars
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple credential check (NOT vulnerable - this is a concept demo)
  if (username === 'user1' && password === 'password123') {
    // Set cookies
    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
    res.cookie('thaimart_session', sessionId, { httpOnly: false });
    res.cookie('thaimart_user', username, { httpOnly: false });

    return res.redirect('/lab02/profile');
  }

  const vars = getCommonVars(req);
  res.render('labs/lab02-login', {
    title: 'เข้าสู่ระบบ',
    error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    ...vars
  });
});

router.get('/profile', (req, res) => {
  // Check if logged in
  if (!req.cookies.thaimart_session) {
    return res.redirect('/lab02/login');
  }

  const vars = getCommonVars(req);
  res.render('labs/lab02-profile', {
    title: 'โปรไฟล์สมาชิก',
    sessionId: req.cookies.thaimart_session,
    ...vars
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('thaimart_session');
  res.clearCookie('thaimart_user');
  res.redirect('/lab02');
});

// Theme switching endpoint
router.post('/theme', (req, res) => {
  const { theme } = req.body;

  if (VALID_THEMES.includes(theme)) {
    res.cookie('thaimart_theme', theme, { httpOnly: false, maxAge: 365 * 24 * 60 * 60 * 1000 });
  }

  // Redirect back to referring page or profile
  const referer = req.get('Referer') || '/lab02';
  res.redirect(referer);
});

module.exports = router;
