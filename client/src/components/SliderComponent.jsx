import {Image} from 'antd'
import React from 'react'
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/Slider.css';

const SliderComponent = ({arrImages}) => {
   const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    className: "slider-wrapper"
  };
  
  return (
    <div className="slider-container">
      <Slider {...settings}>
        {arrImages.map((image, index) => {
          return (
            <div key={index} className="slide-item">
              <Image 
                src={image} 
                alt={`slider-${index}`}
                preview={false}
              />
            </div>
          )
        })}
      </Slider>
    </div>
  )
}

export default SliderComponent