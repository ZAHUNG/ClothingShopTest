import React from 'react';
import SliderComponent from '../components/SliderComponent';
import slider1 from '../assets/images/slider1.jpg';
import slider4 from '../assets/images/slider4.jpg';
import slider5 from '../assets/images/slider5.jpg';
import ProductList4 from '../components/ProductList4';
import PromoSection from '../components/PromoSection';
import promoImage1 from '../assets/images/gioithieu4.jpg';
import promoImage2 from '../assets/images/gioithieu2.webp';
import SearchComponent from '../components/SearchComponent';

const Home = () => {
  return (
    <div>
      <SliderComponent arrImages={[slider1, slider4, slider5]} />
      <SearchComponent/>
      <ProductList4 />
      <PromoSection
        sections={[
          {
            image: promoImage1,
            buttonText: 'Mua ngay',
            buttonLink: '/allproductspage',
          },
          {
            image: promoImage2,
            buttonText: 'Thông tin thêm',
            buttonLink: '/aboutus',
          },
        ]}
      />
    </div>
  );
};

export default Home;
