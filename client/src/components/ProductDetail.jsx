import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice'; // Import addToCart action
import { toast, ToastContainer } from 'react-toastify'; // Import cả toast và ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS cho toastify
import '../styles/ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy trạng thái và dữ liệu từ Redux
  const product = useSelector((state) => state.products.selectedProduct);
  const status = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);
  const user = useSelector((state) => state.user.user); // Lấy thông tin người dùng

  const [selectedSize, setSelectedSize] = useState(null); // Lưu kích thước đã chọn

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id)); // Dispatch action để lấy dữ liệu sản phẩm
    }
  }, [dispatch, id]);

  // Hiển thị trạng thái đang tải
  if (status === 'loading') {
    return <p>Đang tải sản phẩm...</p>;
  }

  // Hiển thị lỗi nếu có
  if (status === 'failed') {
    return <p>Lỗi: {error}</p>;
  }

  // Kiểm tra xem sản phẩm có tồn tại hay không
  if (!product) {
    return <p>Sản phẩm không tồn tại</p>;
  }

  // Hàm xử lý khi chọn kích thước
  const handleSizeClick = (size) => {
    setSelectedSize(size); // Lưu kích thước được chọn
  };

  // Hàm xử lý khi nhấn "Thêm vào giỏ hàng"
  const handleAddToCart = () => {
    if (!user || !user.id) {
      // Kiểm tra nếu người dùng chưa đăng nhập
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login'); // Chuyển hướng đến trang đăng nhập
      return;
    }

    if (selectedSize) {
      dispatch(addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        size: selectedSize,  // Gửi kích thước đã chọn
        imageUrl: product.images?.[0]?.url 
          ? `http://localhost:5000${product.images[0].url}`
          : 'https://via.placeholder.com/50', // Giả sử hình ảnh đầu tiên được chọn
        quantity: 1
      }));

      // Hiển thị thông báo khi thêm sản phẩm vào giỏ hàng thành công
      toast.success('Sản phẩm đã được thêm vào giỏ hàng!');
    } else {
      toast.error('Vui lòng chọn kích thước sản phẩm');
    }
  };

  return (
    <div className="product-detail-container">
      <h2>{product.name}</h2>
      <p className="price">Giá: {product.price?.toLocaleString()} đ</p>
      <p className='description'>Mô Tả: {product.description}</p>

      {/* Tính năng chọn kích thước */}
      <div className="product-size">
        <h3>Kích thước</h3>
        <ul>
          {product.size.map((size, index) => (
            <li key={index}>
              <button
                className={`size-button ${selectedSize === size ? 'active' : ''}`}
                onClick={() => handleSizeClick(size)}
              >
                {size}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Phần hiển thị hình ảnh */}
      <div className="product-images">
        <h3>Hình ảnh</h3>
        <div className="image-gallery">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={`http://localhost:5000${image.url}`}
              alt={`${product.name} - Hình ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Nút thêm vào giỏ hàng */}
      <button className="add-btn-detail" onClick={handleAddToCart}>
        Thêm vào giỏ hàng
      </button>

      {/* Toast Container */}
      <ToastContainer className="custom-toast-container" /> {/* Áp dụng class tùy chỉnh */}
    </div>
  );
}
