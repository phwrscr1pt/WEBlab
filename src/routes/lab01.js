const express = require('express');
const router = express.Router();

// Lab 01: HTTP Methods - Terminal-first API Tester
// Students use curl commands from their terminal

router.get('/', (req, res) => {
  res.render('labs/lab01', {
    title: 'Developer Portal - API Tester'
  });
});

// API endpoint that receives requests and returns JSON
router.all('/api/test', (req, res) => {
  const response = {
    method: req.method,
    path: req.path,
    headers: {
      'content-type': req.headers['content-type'] || null,
      'user-agent': req.headers['user-agent'] || null,
      'host': req.headers['host'] || null
    },
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  };

  res.json(response);
});

module.exports = router;
