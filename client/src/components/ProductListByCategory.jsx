import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByCategory } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductList.css';
import Toast from './Toast';

export default function ProductListByCategory({ categoryId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);
  const user = useSelector((state) => state.user.user);
  const [toast, setToast] = useState(null);

  // Lấy sản phẩm theo categoryId
  useEffect(() => {
    if (categoryId) {
      dispatch(fetchProductsByCategory(categoryId));
    }
  }, [dispatch, categoryId]);
  const handleNavigateToDetail = (productId) => {
    navigate(`/product/${productId}`);
  };
  const getImageUrl = (product) => {
    try {
      return product.images?.[0]?.url
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${product.images[0].url}`
        : 'https://via.placeholder.com/150';
    } catch (error) {
      console.error('Error processing image URL:', error);
      return 'https://via.placeholder.com/150';
    }
  };
  
  const handleAddToCart = (product) => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="product-list-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h2>Sản phẩm theo danh mục</h2>
      <div className="product-grid">
        {products && products.map((product) => (
          <div key={product._id} 
          className="product-card"
          onClick={() => handleNavigateToDetail(product._id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="product-image">
              <img 
                src={getImageUrl(product)} 
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">{product.price?.toLocaleString()}đ</p>
              <p className="description">{product.description}</p>
              <button 
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product)}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
