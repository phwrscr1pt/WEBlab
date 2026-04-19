const express = require('express');
const router = express.Router();

// Lab 12: Burp Suite - Intruder Practice
// Students learn to brute force a 4-digit PIN using Intruder
// Correct PIN: 7392

const FLAG = 'SMC{brut3_f0rc3_w1ns}';
const CORRECT_PIN = '7392';

// Track failed attempts (for display only, not for blocking)
let attemptCount = 0;

// Main page - Gift Card Redemption
router.get('/', (req, res) => {
  res.render('labs/lab12', {
    title: 'Gift Card Redemption',
    result: null,
    attempts: attemptCount
  });
});

// Verify PIN endpoint
router.post('/verify', (req, res) => {
  const { pin } = req.body;
  attemptCount++;

  // Validate PIN format
  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid PIN format',
      message: 'PIN ต้องเป็นตัวเลข 4 หลัก',
      attempts: attemptCount
    });
  }

  // Check PIN
  if (pin === CORRECT_PIN) {
    return res.json({
      success: true,
      message: 'ยินดีด้วย! PIN ถูกต้อง',
      flag: FLAG,
      gift_card: {
        code: 'TM-GIFT-2026-XXXX',
        value: 10000,
        currency: 'THB'
      },
      attempts: attemptCount
    });
  }

  // Wrong PIN
  return res.status(401).json({
    success: false,
    error: 'Invalid PIN',
    message: 'PIN ไม่ถูกต้อง กรุณาลองใหม่',
    attempts: attemptCount
  });
});

// Reset attempt counter
router.post('/reset', (req, res) => {
  attemptCount = 0;
  res.json({ success: true, message: 'Reset attempt counter', attempts: 0 });
});

// API endpoint for form submission (returns HTML result)
router.post('/redeem', (req, res) => {
  const { pin } = req.body;
  attemptCount++;

  // Validate PIN format
  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.render('labs/lab12', {
      title: 'Gift Card Redemption',
      result: { success: false, message: 'PIN ต้องเป็นตัวเลข 4 หลัก' },
      attempts: attemptCount
    });
  }

  // Check PIN
  if (pin === CORRECT_PIN) {
    return res.render('labs/lab12', {
      title: 'Gift Card Redemption',
      result: {
        success: true,
        flag: FLAG,
        message: 'ยินดีด้วย! คุณแลก Gift Card สำเร็จ'
      },
      attempts: attemptCount
    });
  }

  // Wrong PIN
  return res.render('labs/lab12', {
    title: 'Gift Card Redemption',
    result: { success: false, message: 'PIN ไม่ถูกต้อง กรุณาลองใหม่' },
    attempts: attemptCount
  });
});

module.exports = router;
