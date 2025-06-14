import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearCart } from '../redux/cartSlice';
import '../styles/Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const token = localStorage.getItem('token');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Kiểm tra nếu chưa đăng nhập, chuyển hướng về trang login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const totalAmount = Array.isArray(cartItems) 
    ? cartItems.reduce((total, item) => total + item.price * item.quantity, 0) 
    : 0;

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });

  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!userInfo.fullName.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    if (!userInfo.phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!userInfo.address.trim()) {
      setError('Vui lòng nhập địa chỉ');
      return false;
    }
    if (!userInfo.city.trim()) {
      setError('Vui lòng nhập thành phố');
      return false;
    }
    if (!userInfo.district.trim()) {
      setError('Vui lòng nhập quận/huyện');
      return false;
    }
    if (!userInfo.ward.trim()) {
      setError('Vui lòng nhập phường/xã');
      return false;
    }
    if (!/^[0-9]{10}$/.test(userInfo.phone)) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }
    if (userInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      setError('Email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      setError('Giỏ hàng của bạn trống');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const orderData = {
        shippingInfo: {
          fullName: userInfo.fullName,
          email: userInfo.email,
          phone: userInfo.phone,
          address: userInfo.address,
          city: userInfo.city,
          district: userInfo.district,
          ward: userInfo.ward,
          note: userInfo.note
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        })),
        totalAmount: totalAmount, 
        paymentMethod
      };

      if (paymentMethod === 'vnpay') {
        try {
          // Tạo dữ liệu đúng format cho backend
          const vnpayData = {
            shippingInfo: orderData.shippingInfo,
            items: orderData.items,
            totalAmount: Math.round(totalAmount), // Chuyển sang đơn vị xu (1 VND = 100 xu)
            paymentMethod: 'vnpay'
          };
      
          console.log('Dữ liệu thanh toán VNPay:', {
            ...vnpayData,
            originalAmount: totalAmount,
            convertedAmount: Math.round(totalAmount * 100)
          });
      
          const vnpayResponse = await axios.post(
            'http://localhost:5000/api/orders/create-vnpay-payment',
            vnpayData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true
            }
          );

          console.log('Phản hồi từ server VNPay:', vnpayResponse.data);

          if (vnpayResponse.data.success && vnpayResponse.data.paymentUrl) {
            // Lưu thông tin đơn hàng vào localStorage
            const orderInfo = {
              orderId: vnpayResponse.data.orderId,
              orderData: vnpayData,
              vnpayTxnRef: vnpayResponse.data.txnRef // Lấy mã giao dịch từ response
            };

            localStorage.setItem('pendingOrder', JSON.stringify(orderInfo));
            console.log('Đã lưu thông tin đơn hàng:', orderInfo);

            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = vnpayResponse.data.paymentUrl;
          } else {
            console.error('Lỗi tạo URL thanh toán:', vnpayResponse.data);
            throw new Error(vnpayResponse.data.message || 'Không thể tạo URL thanh toán VNPay');
          }
        } catch (error) {
          console.error('Lỗi thanh toán VNPay:', error);
          const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Không thể tạo thanh toán VNPay. Vui lòng thử lại sau.';
          setError(errorMessage);
          return;
        }
      } else {
        // Thanh toán COD
        const response = await axios.post(
          'http://localhost:5000/api/orders',
          orderData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          dispatch(clearCart());
          alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ để xác nhận đơn hàng.');
          navigate('/order-history');
        } else {
          throw new Error('Không thể tạo đơn hàng');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý đơn hàng');
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Tiến hành đặt hàng</h2>
      
      <div className="checkout-content">
        <div className="user-info">
          <h3>Thông tin giao hàng</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Họ và tên:
              <input type="text" name="fullName" value={userInfo.fullName} onChange={handleInputChange} required />
            </label>
            <label>
              Email:
              <input type="email" name="email" value={userInfo.email} onChange={handleInputChange} />
            </label>
            <label>
              Số điện thoại:
              <input type="tel" name="phone" value={userInfo.phone} onChange={handleInputChange} required />
            </label>
            <label>
              Địa chỉ:
              <input type="text" name="address" value={userInfo.address} onChange={handleInputChange} required />
            </label>
            <label>
              Thành phố:
              <input type="text" name="city" value={userInfo.city} onChange={handleInputChange} required />
            </label>
            <label>
              Quận/Huyện:
              <input type="text" name="district" value={userInfo.district} onChange={handleInputChange} required />
            </label>
            <label>
              Phường/Xã:
              <input type="text" name="ward" value={userInfo.ward} onChange={handleInputChange} required />
            </label>
            <label>
              Ghi chú:
              <textarea name="note" value={userInfo.note} onChange={handleInputChange}></textarea>
            </label>

            {error && <div className="error-message">{error}</div>}

            <div className="payment-methods">
              <h4>Phương thức thanh toán</h4>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Thanh toán qua VNPay</span>
                </label>
              </div>
            </div>

            <button type="submit" className="order-button">
              {paymentMethod === 'cod' ? 'Đặt hàng (COD)' : 'Thanh toán qua VNPay'}
            </button>
          </form>
        </div>

        {/* Phần đơn hàng (bên phải) */}
        <div className="order-summary">
          <h3>Đơn hàng của bạn</h3>
          {Array.isArray(cartItems) && cartItems.length === 0 ? (
            <p>Giỏ hàng của bạn trống.</p>
          ) : (
            <>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sản phẩm</th>
                    <th>Size</th>
                    <th>Số lượng</th>
                    <th>Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(cartItems) && cartItems.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.size}</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="order-total">
                <span>Tổng đơn hàng:</span>
                <span>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;