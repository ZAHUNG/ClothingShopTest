import React from 'react'
import ProductListByCategory from '../components/ProductListByCategory'
import SearchComponent from '../components/SearchComponent';
const Tshirt = () => {
  return (
    <div>
        <div style={{ marginTop: '30px' }}> 
        <SearchComponent />
      </div>
        <ProductListByCategory categoryId="6730b7ac5b6fb5d9c615f149"/>
    </div>
  )
}

export default Tshirt