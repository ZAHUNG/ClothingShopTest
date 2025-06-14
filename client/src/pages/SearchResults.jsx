import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import Toast from '../components/Toast';
import '../styles/ProductList.css';

const SearchResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q');
  
  const products = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);
  const user = useSelector((state) => state.user.user);
  const [toast, setToast] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products && searchQuery) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchQuery]);

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

  const handleNavigateToDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (status === 'loading') {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="error-container">
        <p>Có lỗi xảy ra: {error}</p>
        <button onClick={() => dispatch(fetchProducts())}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h2>Kết quả tìm kiếm cho "{searchQuery}"</h2>
      <div className="product-grid">
        {filteredProducts && filteredProducts.map((product) => (
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
