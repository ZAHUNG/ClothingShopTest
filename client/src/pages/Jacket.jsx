import React from 'react'
import ProductListByCategory from '../components/ProductListByCategory';
import SearchComponent from '../components/SearchComponent';

const Jacket = () => {
  return (
    <div>
        <div style={{ marginTop: '30px' }}> 
        <SearchComponent />
      </div>
        <ProductListByCategory categoryId="6730b7a15b6fb5d9c615f145" />
    </div>
  )
}

export default Jacket