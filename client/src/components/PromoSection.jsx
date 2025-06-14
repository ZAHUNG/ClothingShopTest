import React from 'react';
import '../styles/PromoSection.css';

const PromoSection = ({ sections }) => {
  return (
    <div className="promo-section">
      {sections.map((section, index) => (
        <div key={index} className="promo-image-container">
          <img src={section.image} alt="Promo" className="promo-image" />
          <button
            className="promo-button"
            onClick={() => window.location.href = section.buttonLink}
          >
            {section.buttonText}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PromoSection;
