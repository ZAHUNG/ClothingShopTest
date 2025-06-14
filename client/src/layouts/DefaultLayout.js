import React from 'react'
import HeaderComponent from '../components/HeaderComponent';
import FooterComponent from '../components/FooterComponent';

const DefaultLayout = ({children}) => {
  return (
    <div className="layout-container">
    <HeaderComponent/>
    <main className="content-container">{children}</main>
    <FooterComponent/>
    </div>
  )
}

export default DefaultLayout