import React from 'react'
import ProductListByCategory from '../components/ProductListByCategory';
import SearchComponent from '../components/SearchComponent';
const Trouse = () => {
  return (
    <div>
        <div style={{ marginTop: '30px' }}> 
        <SearchComponent />
      </div>
        <ProductListByCategory categoryId="6730b7ca5b6fb5d9c615f151" />
    </div>
  )
}

export default Trouse