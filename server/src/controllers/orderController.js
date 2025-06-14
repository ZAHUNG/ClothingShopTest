const Order = require('../models/Order');
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('qs');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

exports.createVNPayPayment = async (req, res) => {
  try {
    console.log('Creating VNPay payment - Request body:', req.body);
    const { shippingInfo, items, totalAmount } = req.body;

    // Validate input
    if (!shippingInfo || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate environment variables
    if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET || !process.env.VNPAY_URL) {
      return res.status(500).json({
        success: false,
        message: 'Missing VNPAY configuration'
      });
    }

    // Set timezone
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    // Get client IP
    let ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

    ipAddr = ipAddr === '::1' ? '127.0.0.1' : 
             ipAddr.includes('::ffff:') ? ipAddr.split('::ffff:')[1] : 
             ipAddr;

    // Create date and reference
    const date = new Date();
    const orderId = moment(date).format('DDHHmmss');
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const txnRef = moment(date).format('DDHHmmss');
    
    // Convert amount
    const amount = Math.round(parseFloat(totalAmount));
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }
    // VNPay requires amount in smallest currency unit (xu)
    const vnpAmount = amount * 100;  // Convert to xu (1 VND = 100 xu)

    // Save temporary order data
    const tempOrder = new Order({
      user: req.user._id,
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        size: item.size
      })),
      shippingInfo,
      totalAmount,
      paymentMethod: 'vnpay',
      paymentStatus: 'pending',
      vnpayTxnRef: orderId
    });

    const savedOrder = await tempOrder.save();
    console.log('Temporary order saved:', savedOrder._id);

    // Create VNPay parameters
    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE.trim(),
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
      vnp_OrderType: 'other',
      vnp_Amount: vnpAmount,
      vnp_ReturnUrl: process.env.CLIENT_URL.trim() + '/vnpay-return',
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_BankCode: 'NCB'
    };

    // Sort and encode parameters
    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    // Log để debug
    console.log('Secret Key:', process.env.VNPAY_HASH_SECRET);
    console.log('Raw Sign Data:', signData);
    
    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET.trim());
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex').toUpperCase();
    
    // Log hash để so sánh
    console.log('Generated Hash:', secureHash);

    // Create payment URL
    const paymentUrl = `${process.env.VNPAY_URL.trim()}?${signData}&vnp_SecureHash=${secureHash}`;

    // Log full URL
    console.log('Full Payment URL:', paymentUrl);

    // Log payment request
    console.log('=== VNPay Payment Request ===');
    console.log('Amount:', amount);
    console.log('VNPay Amount:', vnpAmount);
    console.log('TxnRef:', txnRef);
    console.log('CreateDate:', createDate);
    console.log('TMN Code:', vnpParams.vnp_TmnCode);
    console.log('Client IP:', ipAddr);
    console.log('Sign Data:', signData);
    console.log('Sign Data Length:', signData.length);
    console.log('Hash:', secureHash);
    console.log('=== End VNPay Payment Request ===');

    return res.status(200).json({
      success: true,
      paymentUrl,
      orderId: savedOrder._id
    });

  } catch (error) {
    console.error('VNPay Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.vnpayCallback = async (req, res) => {
  try {
    console.log('=== VNPay Callback Received ===');
    console.log('Query Params:', req.query);
    
    const vnpParams = req.query;
    const secureHash = vnpParams['vnp_SecureHash'];
    
    // Remove hash from params
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    // Sort and encode parameters
    const sortedParams = sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    
    console.log('Sorted Params:', sortedParams);
    console.log('Sign Data:', signData);
    console.log('Original Hash:', secureHash);
    
    const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET.trim());
    const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex').toUpperCase();
    
    console.log('Generated Hash:', calculatedHash);
    console.log('Hash Match:', secureHash.toUpperCase() === calculatedHash);

    if (secureHash.toUpperCase() !== calculatedHash) {
      console.log('Hash Verification Failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const txnRef = vnpParams['vnp_TxnRef'];
    const responseCode = vnpParams['vnp_ResponseCode'];
    const transactionNo = vnpParams['vnp_TransactionNo'];
    const bankCode = vnpParams['vnp_BankCode'];
    const payDate = vnpParams['vnp_PayDate'];

    console.log('Transaction Details:', {
      txnRef,
      responseCode,
      transactionNo,
      bankCode,
      payDate
    });

    // Find order
    const order = await Order.findOne({ vnpayTxnRef: txnRef });
    if (!order) {
      console.log('Order Not Found:', txnRef);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order Found:', order._id);

    // Verify amount
    const amount = parseInt(vnpParams['vnp_Amount']) / 100;
    if (amount !== order.totalAmount) {
      console.log('Amount Mismatch:', {
        expected: order.totalAmount,
        received: amount
      });
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch'
      });
    }

    // Update order status
    if (responseCode === '00') {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.vnpayTransactionNo = transactionNo;
      order.vnpayBankCode = bankCode;
      order.vnpayTransactionDate = moment(payDate, 'YYYYMMDDHHmmss').toDate();
      await order.save();
      
      console.log('Payment Success - Order Updated');
      return res.status(200).json({
        success: true,
        order: order
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      
      console.log('Payment Failed:', responseCode);
      return res.status(400).json({
        success: false,
        message: 'Payment failed'
      });
    }

  } catch (error) {
    console.error('VNPay Callback Error:', error);
    return res.status(500).json({
      success: false, 
      message: error.message
    });
  }
};

exports.verifyVNPayPayment = async (req, res) => {
  try {
    console.log('Request method:', req.method);
    console.log('Request query:', req.query);
    console.log('Request body:', req.body);

    // Get VNPay parameters directly from body
    const vnpParams = req.body;
    
    // Verify vnpParams has required fields
    if (!vnpParams || !vnpParams.vnp_ResponseCode || !vnpParams.vnp_TransactionStatus) {
      console.error('Missing required VNPay parameters:', vnpParams);
      return res.status(400).json({
        success: false,
        message: 'Missing required VNPay parameters'
      });
    }
    
    // Log all incoming parameters
    console.log('VNPay Verification Parameters:', {
      responseCode: vnpParams.vnp_ResponseCode,
      transactionNo: vnpParams.vnp_TransactionNo,
      txnRef: vnpParams.vnp_TxnRef,
      amount: vnpParams.vnp_Amount,
      orderInfo: vnpParams.vnp_OrderInfo,
      allParams: vnpParams
    });
    
    // Check if payment was successful
    if (vnpParams.vnp_ResponseCode === '00' && vnpParams.vnp_TransactionStatus === '00') {
      // Find and update the order
      const order = await Order.findOne({ vnpayTxnRef: vnpParams.vnp_TxnRef });
      
      if (!order) {
        console.error('Order not found for txnRef:', vnpParams.vnp_TxnRef);
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      console.log('Found order:', {
        orderId: order._id,
        orderAmount: order.totalAmount,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus
      });

      // VNPay amount is in xu, convert back to VND for comparison
      const vnpAmount = parseInt(vnpParams.vnp_Amount, 10) / 100;
      const orderAmount = Math.round(order.totalAmount);
      
      console.log('Amount comparison:', {
        vnpAmount,
        orderAmount,
        matches: vnpAmount === orderAmount
      });

      if (vnpAmount !== orderAmount) {
        console.error('Amount mismatch:', {
          vnpAmount,
          orderAmount,
          orderId: order._id
        });
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch'
        });
      }

      // Update order status and payment details
      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.vnpayTransactionNo = vnpParams.vnp_TransactionNo;
      order.vnpayBankCode = vnpParams.vnp_BankCode;
      order.vnpayPayDate = moment(vnpParams.vnp_PayDate, 'YYYYMMDDHHmmss').toDate();
      
      await order.save();
      console.log('Payment Success - Order Updated:', order._id);

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order
      });
    } else {
      console.error('Payment failed:', {
        responseCode: vnpParams.vnp_ResponseCode,
        transactionStatus: vnpParams.vnp_TransactionStatus
      });
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        responseCode: vnpParams.vnp_ResponseCode,
        transactionStatus: vnpParams.vnp_TransactionStatus
      });
    }
  } catch (error) {
    console.error('VNPay Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    console.log('Creating order - Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);

    // Extract data from nested structure if present
    const orderData = req.body.orderData || req.body;
    const { shippingInfo, items, totalAmount } = orderData;
    const paymentMethod = req.body.paymentMethod || orderData.paymentMethod || 'cod';
    const paymentStatus = req.body.paymentStatus || 'pending';

    // Validate required fields
    if (!shippingInfo) {
      console.log('Missing shippingInfo:', orderData);
      return res.status(400).json({
        success: false,
        message: 'Missing shipping information'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('Invalid items:', items);
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing items'
      });
    }

    if (!totalAmount) {
      console.log('Missing totalAmount');
      return res.status(400).json({
        success: false,
        message: 'Missing total amount'
      });
    }

    // Tạo đơn hàng mới
    const order = new Order({
      user: req.user._id,
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        size: item.size
      })),
      shippingInfo,
      totalAmount,
      paymentMethod,
      paymentStatus
    });

    // Lưu đơn hàng
    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      order: savedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể tạo đơn hàng',
      error: error.message
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.productId', 'name price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin đơn hàng',
      error: error.message
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đơn hàng',
      error: error.message
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.productId', 'name price')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đơn hàng',
      error: error.message
    });
  }
};