import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import '../styles/VNPayReturn.css';

const VNPayReturn = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        // Lấy toàn bộ query parameters từ URL
        const queryParams = new URLSearchParams(location.search);
        const token = localStorage.getItem('token');
        const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));

        if (!pendingOrder) {
          throw new Error('Không tìm thấy thông tin đơn hàng');
        }

        // Gọi API để xác nhận kết quả thanh toán
        const response = await axios.get(
          `http://localhost:5000/api/orders/vnpay-callback${location.search}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Nếu thanh toán thành công, tạo đơn hàng
          const orderResponse = await axios.post(
            'http://localhost:5000/api/orders',
            {
              ...pendingOrder,
              paymentMethod: 'vnpay',
              paymentStatus: 'paid'
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (orderResponse.data.success) {
            setStatus('success');
            setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
            dispatch(clearCart());
            localStorage.removeItem('pendingOrder');
            
            // Chuyển về trang lịch sử đơn hàng sau 3 giây
            setTimeout(() => {
              navigate('/order-history');
            }, 3000);
          }
        } else {
          throw new Error(response.data.message || 'Thanh toán thất bại');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      }
    };

    processPaymentResult();
  }, [location, navigate, dispatch]);

  return (
    <div className="vnpay-return">
      <div className={`payment-status ${status}`}>
        <div className="status-icon">
          {status === 'processing' && <div className="spinner"></div>}
          {status === 'success' && <div className="success-icon">✓</div>}
          {status === 'error' && <div className="error-icon">✕</div>}
        </div>
        <h2>Kết quả thanh toán</h2>
        <p>{message}</p>
        {status === 'error' && (
          <button onClick={() => navigate('/checkout')} className="retry-button">
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
};

export default VNPayReturn;
