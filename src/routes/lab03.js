const express = require('express');
const router = express.Router();

// Lab 03: SQL Playground - Educational SQL Explorer (NOT vulnerable)

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;

  // Get all products for initial display
  let products = [];
  try {
    const result = await pool.query('SELECT * FROM playground_products ORDER BY id LIMIT 10');
    products = result.rows;
  } catch (err) {
    console.error('DB Error:', err.message);
  }

  res.render('labs/lab03', {
    title: 'Employee DB Explorer',
    query: null,
    result: products,
    error: null,
    queryType: 'SELECT_ALL'
  });
});

router.post('/execute', async (req, res) => {
  const pool = req.app.locals.pool;
  const { queryType, filterColumn, filterValue, insertName, insertPrice, insertStock, insertCategory,
    updateId, updateColumn, updateValue, deleteId } = req.body;

  let query = '';
  let result = [];
  let error = null;

  try {
    switch (queryType) {
      case 'SELECT_ALL':
        query = 'SELECT * FROM playground_products ORDER BY id';
        const allResult = await pool.query(query);
        result = allResult.rows;
        break;

      case 'SELECT_WHERE':
        // Sanitized - using parameterized query
        const validColumns = ['id', 'name', 'price', 'stock', 'category'];
        const col = validColumns.includes(filterColumn) ? filterColumn : 'id';
        query = `SELECT * FROM playground_products WHERE ${col} = $1`;
        const whereResult = await pool.query(query, [filterValue]);
        result = whereResult.rows;
        query = `SELECT * FROM playground_products WHERE ${col} = '${filterValue}'`; // Display version
        break;

      case 'INSERT':
        query = `INSERT INTO playground_products (name, price, stock, category) VALUES ($1, $2, $3, $4) RETURNING *`;
        const insertResult = await pool.query(query, [insertName, insertPrice, insertStock, insertCategory]);
        result = insertResult.rows;
        query = `INSERT INTO playground_products (name, price, stock, category) VALUES ('${insertName}', ${insertPrice}, ${insertStock}, '${insertCategory}')`;
        break;

      case 'UPDATE':
        const validUpdateCols = ['name', 'price', 'stock', 'category'];
        const updateCol = validUpdateCols.includes(updateColumn) ? updateColumn : 'name';
        query = `UPDATE playground_products SET ${updateCol} = $1 WHERE id = $2 RETURNING *`;
        const updateResult = await pool.query(query, [updateValue, updateId]);
        result = updateResult.rows;
        query = `UPDATE playground_products SET ${updateCol} = '${updateValue}' WHERE id = ${updateId}`;
        break;

      case 'DELETE':
        query = `DELETE FROM playground_products WHERE id = $1 RETURNING *`;
        const deleteResult = await pool.query(query, [deleteId]);
        result = deleteResult.rows;
        query = `DELETE FROM playground_products WHERE id = ${deleteId}`;
        break;

      default:
        error = 'Invalid query type';
    }
  } catch (err) {
    error = err.message;
  }

  res.render('labs/lab03', {
    title: 'Employee DB Explorer',
    query: query,
    result: result,
    error: error,
    queryType: queryType
  });
});

module.exports = router;
