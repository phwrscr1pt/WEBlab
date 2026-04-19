const express = require('express');
const router = express.Router();

// Lab 11: Burp Suite - Repeater Practice
// Students learn to read responses and add headers using Repeater
// First request returns a token, student must add it as X-Access-Token header

const FLAG = 'SMC{r3p34t3r_h34d3r_f0und}';

// Generate a simple token (in real scenario this would be more complex)
const ACCESS_TOKEN = 'TM_SEC_' + Buffer.from('thaimart2026').toString('base64');

// Main page - Instructions
router.get('/', (req, res) => {
  res.render('labs/lab11', {
    title: 'Internal API',
    result: null
  });
});

// API endpoint - Step 1: Get the token hint
router.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '2.1.0',
    message: 'ThaiMart Internal API',
    auth: {
      type: 'header',
      header_name: 'X-Access-Token',
      hint: 'Token is provided below for authorized personnel',
      access_token: ACCESS_TOKEN
    },
    endpoints: [
      { path: '/lab11/api/status', method: 'GET', description: 'API status (this endpoint)' },
      { path: '/lab11/api/secret', method: 'GET', description: 'Secret data (requires X-Access-Token header)' }
    ]
  });
});

// API endpoint - Step 2: Access secret with token
router.get('/api/secret', (req, res) => {
  const token = req.headers['x-access-token'];

  // No token provided
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Missing X-Access-Token header',
      hint: 'เรียก GET /lab11/api/status ก่อนเพื่อดู token'
    });
  }

  // Wrong token
  if (token !== ACCESS_TOKEN) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Invalid access token',
      provided_token: token,
      hint: 'Token ไม่ถูกต้อง ลองตรวจสอบจาก /lab11/api/status อีกครั้ง'
    });
  }

  // Correct token - return flag
  res.json({
    success: true,
    message: 'Access granted! Welcome to ThaiMart secret API.',
    flag: FLAG,
    secret_data: {
      admin_email: 'admin@thaimart.local',
      db_server: '10.10.61.100',
      backup_schedule: 'daily at 03:00'
    }
  });
});

module.exports = router;
