// src/components/AboutUs.js
import React from 'react';
import '../styles/AboutUs.css';  // Import file CSS
import logo from '../assets/images/logo2.jpg';  // Đảm bảo đường dẫn đúng

const AboutusDetail = () => {
  return (
    <div className="about-us-container">
      <h2 className="about-us-title">About Us</h2>
      <div className="about-us-content-container">
        <div className="about-us-text-content">
          <p className="about-us-paragraph">
            Welcome to <strong>ClothesShop</strong>! Chúng tôi là một cửa hàng quần áo hàng đầu cung cấp nhiều mặt hàng thời trang hợp thời trang và chất lượng cao.
            Sứ mệnh của chúng tôi là cung cấp quần áo thời trang giúp mọi người cảm thấy tự tin và thời trang.
          </p>
          <p className="about-us-paragraph">
            Tại ClothesShop, Chúng tôi tin vào tính bền vững và chất lượng. Đội ngũ của chúng tôi tuyển chọn cẩn thận từng sản phẩm quần áo để đảm bảo bạn có được trải nghiệm mua sắm tốt nhất.
          </p>
          <p className="about-us-paragraph">
          Cho dù bạn đang tìm kiếm trang phục thường ngày, trang phục công sở hay trang phục cho những dịp đặc biệt, chúng tôi đều có. Khám phá bộ sưu tập của chúng tôi và tìm phong cách hoàn hảo cho bạn ngay hôm nay!
          </p>
          
          <h3 className="about-us-subtitle">Our Values</h3>
          <ul className="about-us-values-list">
            <li>Quality: Chúng tôi tập trung vào việc cung cấp các sản phẩm chất lượng cao.</li>
            <li>Style: Chúng tôi luôn theo kịp xu hướng thời trang mới nhất.</li>
            <li>Sustainability: Chúng tôi quan tâm đến môi trường và tính bền vững trong thời trang.</li>
            <li>Customer Care: Chúng tôi ưu tiên sự hài lòng của khách hàng.</li>
          </ul>
        </div>

        <div className="about-us-image-container">
          <img 
            src={logo}
            alt="Fashion Store" 
            className="about-us-image" 
          />
        </div>
      </div>
    </div>
  );
};

export default AboutusDetail;
