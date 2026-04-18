const express = require('express');
const router = express.Router();

// Lab 01: HTTP Methods - Learn through a real shopping cart
// Students interact with a realistic e-commerce page and see the HTTP requests

// In-memory product catalog
const products = [
  { id: 1, name: 'iPhone 15 Pro', price: 48900, image: '📱', category: 'อิเล็กทรอนิกส์' },
  { id: 2, name: 'AirPods Pro 2', price: 8990, image: '🎧', category: 'อุปกรณ์เสริม' },
  { id: 3, name: 'MacBook Air M3', price: 42900, image: '💻', category: 'คอมพิวเตอร์' },
  { id: 4, name: 'iPad Pro 11"', price: 35900, image: '📲', category: 'แท็บเล็ต' },
  { id: 5, name: 'Apple Watch Series 9', price: 15900, image: '⌚', category: 'อุปกรณ์เสริม' },
  { id: 6, name: 'Magic Keyboard', price: 3990, image: '⌨️', category: 'อุปกรณ์เสริม' }
];

// In-memory cart (shared for demo purposes - resets on server restart)
let cart = [];
let cartIdCounter = 1;

// Main page - render shopping cart UI
router.get('/', (req, res) => {
  res.render('labs/lab01', {
    title: 'ตะกร้าสินค้า',
    products: products,
    cart: cart
  });
});

// GET /lab01/products - List all products
router.get('/products', (req, res) => {
  res.json({
    success: true,
    method: 'GET',
    path: '/lab01/products',
    data: products,
    count: products.length
  });
});

// GET /lab01/cart - Get current cart
router.get('/cart', (req, res) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.json({
    success: true,
    method: 'GET',
    path: '/lab01/cart',
    data: cart,
    count: cart.length,
    total: total
  });
});

// POST /lab01/cart - Add item to cart
router.post('/cart', (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({
      success: false,
      method: 'POST',
      path: '/lab01/cart',
      error: 'กรุณาระบุ product_id'
    });
  }

  const product = products.find(p => p.id === parseInt(product_id));
  if (!product) {
    return res.status(404).json({
      success: false,
      method: 'POST',
      path: '/lab01/cart',
      error: 'ไม่พบสินค้า'
    });
  }

  // Check if product already in cart
  const existingItem = cart.find(item => item.product_id === parseInt(product_id));
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
    return res.json({
      success: true,
      method: 'POST',
      path: '/lab01/cart',
      message: 'เพิ่มจำนวนสินค้าในตะกร้าแล้ว',
      data: existingItem,
      cart: cart
    });
  }

  // Add new item to cart
  const cartItem = {
    id: cartIdCounter++,
    product_id: parseInt(product_id),
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: parseInt(quantity)
  };

  cart.push(cartItem);

  res.status(201).json({
    success: true,
    method: 'POST',
    path: '/lab01/cart',
    message: 'เพิ่มสินค้าลงตะกร้าแล้ว',
    data: cartItem,
    cart: cart
  });
});

// PUT /lab01/cart/:id - Update cart item quantity
router.put('/cart/:id', (req, res) => {
  const cartId = parseInt(req.params.id);
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      success: false,
      method: 'PUT',
      path: `/lab01/cart/${cartId}`,
      error: 'กรุณาระบุ quantity ที่มากกว่า 0'
    });
  }

  const cartItem = cart.find(item => item.id === cartId);
  if (!cartItem) {
    return res.status(404).json({
      success: false,
      method: 'PUT',
      path: `/lab01/cart/${cartId}`,
      error: 'ไม่พบสินค้าในตะกร้า'
    });
  }

  cartItem.quantity = parseInt(quantity);

  res.json({
    success: true,
    method: 'PUT',
    path: `/lab01/cart/${cartId}`,
    message: 'แก้ไขจำนวนสินค้าแล้ว',
    data: cartItem,
    cart: cart
  });
});

// DELETE /lab01/cart/:id - Remove item from cart
router.delete('/cart/:id', (req, res) => {
  const cartId = parseInt(req.params.id);

  const cartIndex = cart.findIndex(item => item.id === cartId);
  if (cartIndex === -1) {
    return res.status(404).json({
      success: false,
      method: 'DELETE',
      path: `/lab01/cart/${cartId}`,
      error: 'ไม่พบสินค้าในตะกร้า'
    });
  }

  const removed = cart.splice(cartIndex, 1)[0];

  res.json({
    success: true,
    method: 'DELETE',
    path: `/lab01/cart/${cartId}`,
    message: 'ลบสินค้าออกจากตะกร้าแล้ว',
    data: removed,
    cart: cart
  });
});

// POST /lab01/cart/clear - Clear entire cart
router.post('/cart/clear', (req, res) => {
  cart = [];
  cartIdCounter = 1;

  res.json({
    success: true,
    method: 'POST',
    path: '/lab01/cart/clear',
    message: 'ล้างตะกร้าสินค้าแล้ว',
    cart: cart
  });
});

module.exports = router;
