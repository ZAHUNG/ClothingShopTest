import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { Link } from 'react-router-dom';
import '../styles/Cart.css';

const Cart = () => {
  const dispatch = useDispatch();
  const { cartItems, totalAmount } = useSelector((state) => state.cart);

  const handleQuantityChange = (id, size, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, size, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id, size) => {
    dispatch(removeFromCart({ id, size }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Giỏ hàng trống</h2>
        <Link to="/" className="continue-shopping">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {/* Khung hiển thị tổng quan giỏ hàng */}
      <div className="cart-summary-header">
        <h2>Giỏ hàng của bạn</h2>
      </div>

      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={`${item.id}-${item.size}`} className="cart-item">
            <img src={item.imageUrl} alt={item.name} className="item-image" />
            <div className="item-details">
              <h3 className="item-name">{item.name}</h3>
              <p className="size">Size: {item.size}</p>
              <p className="price">{item.price.toLocaleString()}đ</p>
            </div>
            <div className="quantity-controls">
              <button
                onClick={() => handleQuantityChange(item.id, item.size, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.id, item.size, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="item-total">
              {item.totalPrice.toLocaleString()}đ
            </div>
            <button
              className="remove-item"
              onClick={() => handleRemoveItem(item.id, item.size)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Tổng tiền:</span>
          <span>{totalAmount.toLocaleString()}đ</span>
        </div>
        <div className="cart-actions">
          <button className="clear-cart" onClick={handleClearCart}>
            Xóa giỏ hàng
          </button>
          <Link to="/checkout" className="checkout-button">
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
