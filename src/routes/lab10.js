const express = require('express');
const router = express.Router();

// Lab 10: Burp Suite - Intercept Practice
// Students learn to intercept and modify HTTP requests
// Hidden discount field must be changed to unlock the flag

const FLAG = 'SMC{1nt3rc3pt_m4st3r}';
const SECRET_DISCOUNT_CODE = 'THAIM4RT_VIP_2026';

// Products for the shop
const products = [
  { id: 1, name: 'iPhone 15 Pro', price: 48900, image: '📱' },
  { id: 2, name: 'AirPods Pro 2', price: 8990, image: '🎧' },
  { id: 3, name: 'MacBook Air M3', price: 42900, image: '💻' }
];

// Main page - Shopping with hidden discount
router.get('/', (req, res) => {
  res.render('labs/lab10', {
    title: 'Flash Sale',
    products: products,
    result: null
  });
});

// Process order - Check for intercepted discount
router.post('/checkout', (req, res) => {
  const { product_id, quantity, discount_code } = req.body;

  const product = products.find(p => p.id === parseInt(product_id));
  if (!product) {
    return res.render('labs/lab10', {
      title: 'Flash Sale',
      products: products,
      result: { success: false, message: 'ไม่พบสินค้า' }
    });
  }

  const qty = parseInt(quantity) || 1;
  const subtotal = product.price * qty;

  // Check if discount code was intercepted and changed
  if (discount_code === SECRET_DISCOUNT_CODE) {
    // Success! Student intercepted and found the correct code
    return res.render('labs/lab10', {
      title: 'Flash Sale',
      products: products,
      result: {
        success: true,
        flag: FLAG,
        product: product,
        quantity: qty,
        subtotal: subtotal,
        discount: '100%',
        total: 0,
        message: 'ยินดีด้วย! คุณได้รับส่วนลด 100%'
      }
    });
  }

  // Normal checkout (no flag)
  return res.render('labs/lab10', {
    title: 'Flash Sale',
    products: products,
    result: {
      success: false,
      product: product,
      quantity: qty,
      subtotal: subtotal,
      discount: '0%',
      total: subtotal,
      message: 'สั่งซื้อสำเร็จ (ไม่มีส่วนลด)'
    }
  });
});

// Hint endpoint - Returns the secret code (for students who explore)
router.get('/api/promotions', (req, res) => {
  res.json({
    active_promotions: [
      { code: 'NEWYEAR10', discount: '10%', status: 'expired' },
      { code: 'SUMMER20', discount: '20%', status: 'expired' },
      { code: SECRET_DISCOUNT_CODE, discount: '100%', status: 'active', note: 'VIP Only' }
    ],
    hint: 'ลองเปลี่ยนค่า discount_code ใน request body'
  });
});

module.exports = router;
