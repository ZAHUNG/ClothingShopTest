const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminAuth } = require('../middleware/auth');
const {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  createVNPayPayment,
  vnpayCallback,
  verifyVNPayPayment,
  getAllOrders
} = require('../controllers/orderController');

// Routes
router.post('/', protect, createOrder);
router.post('/create-vnpay-payment', protect, createVNPayPayment);
router.post('/verify-vnpay-payment', verifyVNPayPayment);
router.get('/vnpay-callback', vnpayCallback);
router.get('/user-orders', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

router.get('/admin/all', protect, adminAuth, getAllOrders);
router.put('/admin/:id/status', protect,adminAuth, updateOrderStatus);

module.exports = router;  