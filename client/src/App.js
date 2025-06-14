import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './redux/store';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import DefaultLayout from './layouts/DefaultLayout';
import NoHeaderFooterLayout from './layouts/NoHeaderFooterLayout';
import SearchResults from './pages/SearchResults';
import Cart from './pages/Cart'
import Tshirt from './pages/Tshirt';
import Jacket from './pages/Jacket';
import Shorts from './pages/Shorts';
import Trouse from './pages/Trouse';
import Aboutus from './pages/Aboutus';
import AllProductsPage from './pages/AllProductsPage';
import ProductDetail from './components/ProductDetail';
import OrderHistory from './pages/OrderHistory';
import VNPayReturn from './pages/VNPayReturn';

import { initializeCart } from './redux/slices/cartSlice';

import '../src/styles/Header.css';
import '../src/styles/Footer.css';
import '../src/App.css';


// AppContent component to handle Redux hooks
const AppContent = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    // Initialize cart when component mounts or user changes
    if (user?.id) {
      dispatch(initializeCart(user.id));
    }
  }, [dispatch, user]);

  return (
    <Router>
      <Routes>

      <Route path="/" element={<DefaultLayout><Home /></DefaultLayout>} />
      <Route path="/search" element={<DefaultLayout><SearchResults /></DefaultLayout>} />
      <Route path="/cart" element={<DefaultLayout><Cart /></DefaultLayout>} />
      <Route path="/checkout" element={<DefaultLayout><Checkout /></DefaultLayout>} />
      <Route path="/order-history" element={<DefaultLayout><OrderHistory /></DefaultLayout>} />
      <Route path="/product/:id" element={<DefaultLayout><ProductDetail /></DefaultLayout>} />
      <Route path="/tshirt" element={<DefaultLayout><Tshirt /></DefaultLayout>} />
      <Route path="/jacket" element={<DefaultLayout><Jacket /></DefaultLayout>} />
      <Route path="/shorts" element={<DefaultLayout><Shorts /></DefaultLayout>} />
      <Route path="/trouse" element={<DefaultLayout><Trouse /></DefaultLayout>} />
      <Route path="/aboutus" element={<DefaultLayout><Aboutus /></DefaultLayout>} />
      <Route path="/allproductspage" element={<DefaultLayout><AllProductsPage /></DefaultLayout>} />
      <Route path="/vnpay-return" element={<VNPayReturn />} />
      
      <Route path="/login" element={<NoHeaderFooterLayout><Login /></NoHeaderFooterLayout>} />
      <Route path="/register" element={<NoHeaderFooterLayout><Register /></NoHeaderFooterLayout>} />
      </Routes>
    </Router>
  );
};

// Main App component
const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
