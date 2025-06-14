import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Register.css'; // Đường dẫn file CSS

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      setMessage(response.data.message || 'Đăng ký thành công!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại!');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Đăng ký tài khoản</h2>
        {message && <p className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="firstName">Họ và tên</label>
              <input
                type="text"
                id="firstName"
                placeholder="Nhập họ và tên"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label htmlFor="address">Địa chỉ</label>
              <input
                type="text"
                id="address"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="register-button">Đăng ký</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
