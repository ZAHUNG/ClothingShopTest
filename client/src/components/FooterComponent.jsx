// src/components/FooterComponent.js

import React from 'react';
import '../styles/Footer.css';

const FooterComponent = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2024 ShopLogo. All rights reserved.</p>
        <div className="footer-links">
          <a href="/terms" className="footer-link">Terms of Service</a>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
