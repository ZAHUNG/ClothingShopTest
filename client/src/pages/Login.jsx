import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice'; // Import setUser để lưu thông tin người dùng
import { setAuthState } from '../redux/slices/authSlice'; // Import setAuthState để cập nhật trạng thái đăng nhập
import { initializeCart } from '../redux/slices/cartSlice'; // Import initializeCart để khởi tạo giỏ hàng
import '../styles/Login.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log('Login response:', response.data);
      console.log('User object:', response.data.user);
      console.log('User ID:', response.data.user.id); // Kiểm tra xem id có đúng không

      // Lưu token và user vào localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Lưu thông tin người dùng vào Redux
      dispatch(setUser(response.data.user));

      // Cập nhật trạng thái đăng nhập vào Redux
      dispatch(setAuthState({ isAuthenticated: true, user: response.data.user }));

      // Khởi tạo giỏ hàng cho user - sử dụng id thay vì _id
      console.log('Initializing cart for user:', response.data.user.id);
      dispatch(initializeCart(response.data.user.id));

      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Đăng nhập</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Đăng nhập
          </button>
        </form>
        <div className="register-prompt">
          Bạn chưa có tài khoản? <a href="/register">Đăng ký</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
