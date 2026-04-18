const express = require('express');
const router = express.Router();

// Lab 02: Stateless Demo - Member Login
// Credentials: user1 / password123

router.get('/', (req, res) => {
  const isLoggedIn = req.cookies.thaimart_session;
  res.render('labs/lab02-home', {
    title: 'ระบบสมาชิก ThaiMart',
    isLoggedIn: !!isLoggedIn,
    username: req.cookies.thaimart_user || null
  });
});

router.get('/login', (req, res) => {
  // If already logged in, redirect to profile
  if (req.cookies.thaimart_session) {
    return res.redirect('/lab02/profile');
  }
  res.render('labs/lab02-login', {
    title: 'เข้าสู่ระบบ',
    error: null
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

  res.render('labs/lab02-login', {
    title: 'เข้าสู่ระบบ',
    error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
  });
});

router.get('/profile', (req, res) => {
  // Check if logged in
  if (!req.cookies.thaimart_session) {
    return res.redirect('/lab02/login');
  }

  res.render('labs/lab02-profile', {
    title: 'โปรไฟล์สมาชิก',
    username: req.cookies.thaimart_user || 'Unknown',
    sessionId: req.cookies.thaimart_session
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('thaimart_session');
  res.clearCookie('thaimart_user');
  res.redirect('/lab02');
});

module.exports = router;
