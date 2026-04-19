const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'thaimart',
  user: process.env.DB_USER || 'thaimart',
  password: process.env.DB_PASS || 'thaimart_secret',
});

// Make pool available to routes
app.locals.pool = pool;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'thaimart_session_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false, // Intentionally insecure for XSS labs
    secure: false
  }
}));

// Routes
app.use('/', require('./routes/index'));
app.use('/lab01', require('./routes/lab01'));
app.use('/lab02', require('./routes/lab02'));
app.use('/lab03', require('./routes/lab03'));
app.use('/lab04', require('./routes/lab04'));
app.use('/lab05', require('./routes/lab05'));
app.use('/lab06', require('./routes/lab06'));
app.use('/lab07', require('./routes/lab07'));
app.use('/lab08', require('./routes/lab08'));
app.use('/lab09', require('./routes/lab09'));
app.use('/lab10', require('./routes/lab10'));
app.use('/lab11', require('./routes/lab11'));
app.use('/lab12', require('./routes/lab12'));
app.use('/logger', require('./routes/logger'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'ไม่พบหน้าที่ค้นหา' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'เกิดข้อผิดพลาด',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ThaiMart Labs running at http://localhost:${PORT}`);
});
