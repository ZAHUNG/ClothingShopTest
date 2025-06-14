import React from 'react'
import ProductListByCategory from '../components/ProductListByCategory';
import SearchComponent from '../components/SearchComponent';
const Shorts = () => {
  return (
    <div>
        <div style={{ marginTop: '30px' }}> 
        <SearchComponent />
      </div>
        <ProductListByCategory categoryId="6730b7bd5b6fb5d9c615f14d" />
    </div>
  )
}

export default Shorts