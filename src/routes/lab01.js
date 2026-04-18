const express = require('express');
const router = express.Router();

// Lab 01: HTTP Methods - API Tester
router.get('/', (req, res) => {
  res.render('labs/lab01', {
    title: 'Developer Portal - API Tester',
    result: null
  });
});

// Handle API test requests
router.all('/api/test', (req, res) => {
  const result = {
    method: req.method,
    path: req.path,
    headers: req.headers,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  };

  // If it's an AJAX request, return JSON
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.json(result);
  }

  // Otherwise render the page with result
  res.render('labs/lab01', {
    title: 'Developer Portal - API Tester',
    result: result
  });
});

module.exports = router;
