// src/components/HeaderComponent.jsx
import React, { useState, useEffect } from 'react';
import { Link,  } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import { initializeCart, resetCart } from '../redux/slices/cartSlice';
import '../styles/Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const HeaderComponent = () => {
  const [topDropdownVisible, setTopDropdownVisible] = useState(false);
  const [bottomDropdownVisible, setBottomDropdownVisible] = useState(false);
  const [userDropdownVisible, setUserDropdownVisible] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user) {
      dispatch(initializeCart(user._id));
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <header className="bg-light py-3 shadow">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="logo">
          <Link to="/" className="navbar-brand fw-bold">CLOTHESSHOP</Link>
        </div>

        <nav className="d-flex gap-4">
          <Link to="/" className="nav-link">Trang chủ</Link>
          
          <div onMouseEnter={() => setTopDropdownVisible(true)} 
               onMouseLeave={() => setTopDropdownVisible(false)}
               className="nav-item" >
            <span>Áo</span>
            
            {topDropdownVisible && (
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="/tshirt">Áo thun</Link>
                <Link className="dropdown-item" to="/jacket">Áo khoác</Link>
              </div>
            )}
          </div>

          <div onMouseEnter={() => setBottomDropdownVisible(true)} 
               onMouseLeave={() => setBottomDropdownVisible(false)}
               className="nav-item" >
            <span>Quần</span>
            {bottomDropdownVisible && (
              <div className="dropdown-menu">
                <Link className="dropdown-item" to="/shorts">Quần Ngắn</Link>
                <Link className="dropdown-item" to="/trouse">Quần Dài</Link>
              </div>
            )}
          </div>
          <Link to="/allproductspage" className="nav-link">Tất cả sản phẩm</Link>
          <Link to="/contact" className="nav-link">Liên hệ</Link>
        </nav>

        <div className="d-flex gap-3 align-items-center">
          {user ? (
            <div className="user-menu" 
                 onMouseEnter={() => setUserDropdownVisible(true)}
                 onMouseLeave={() => setUserDropdownVisible(false)}>
              <span className="greeting">Xin chào, {user.username}</span>
              {userDropdownVisible && (
                <div className="dropdown-menu">
                  <Link className="dropdown-item" to="/order-history">Lịch sử đơn hàng</Link>
                  <div className="dropdown-divider"></div>
                  <Link className="dropdown-item" to="#" onClick={handleLogout}>Đăng xuất</Link>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn">Đăng nhập</Link>
          )}
          <Link to="/cart" className="btn">Giỏ hàng</Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderComponent;
