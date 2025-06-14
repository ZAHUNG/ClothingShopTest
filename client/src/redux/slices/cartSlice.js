import { createSlice } from '@reduxjs/toolkit';

// Lấy dữ liệu giỏ hàng từ LocalStorage dựa trên userId
const getCartFromLocalStorage = (userId) => {
  try {
    const cartData = localStorage.getItem(`cart_${userId}`);
    if (!cartData) return [];
    
    const parsedCart = JSON.parse(cartData);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Lưu giỏ hàng vào LocalStorage
const saveCartToLocalStorage = (userId, cartItems) => {
  try {
    localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Tính toán tổng số lượng và tổng tiền
const calculateTotals = (cartItems) => {
  return cartItems.reduce(
    (totals, item) => ({
      totalQuantity: totals.totalQuantity + item.quantity,
      totalAmount: totals.totalAmount + (item.price * item.quantity),
    }),
    { totalQuantity: 0, totalAmount: 0 }
  );
};

// Lấy userId từ localStorage nếu có
const getUserIdFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id;
    }
    return null;
  } catch {
    return null;
  }
};

// Khởi tạo state với dữ liệu từ localStorage nếu có
const getInitialState = () => {
  const userId = getUserIdFromStorage();
  if (userId) {
    const cartItems = getCartFromLocalStorage(userId);
    const totals = calculateTotals(cartItems);
    return {
      cartItems,
      totalQuantity: totals.totalQuantity,
      totalAmount: totals.totalAmount,
      userId,
      error: null,
    };
  }
  return {
    cartItems: [],
    totalQuantity: 0,
    totalAmount: 0,
    userId: null,
    error: null,
  };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: getInitialState(),
  reducers: {
    // Khởi tạo giỏ hàng dựa trên userId
    initializeCart: (state, action) => {
      const userId = action.payload;
      if (!userId) {
        state.error = 'User ID is required to initialize cart';
        return;
      }

      state.userId = userId;
      state.cartItems = getCartFromLocalStorage(userId);
      const totals = calculateTotals(state.cartItems);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      state.error = null;
    },

    // Thêm sản phẩm vào giỏ
    addToCart: (state, action) => {
      if (!state.userId) {
        state.error = 'User must be logged in to add items to cart';
        return;
      }

      const newItem = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.id === newItem.id && item.size === newItem.size
      );

      if (existingItem) {
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.quantity * existingItem.price;
      } else {
        state.cartItems.push({
          ...newItem,
          quantity: 1,
          totalPrice: newItem.price,
        });
      }

      const totals = calculateTotals(state.cartItems);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      state.error = null;

      saveCartToLocalStorage(state.userId, state.cartItems);
    },

    // Xóa sản phẩm khỏi giỏ
    removeFromCart: (state, action) => {
      if (!state.userId) {
        state.error = 'User must be logged in to remove items from cart';
        return;
      }

      const { id, size } = action.payload;
      state.cartItems = state.cartItems.filter(
        item => !(item.id === id && item.size === size)
      );

      const totals = calculateTotals(state.cartItems);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;

      saveCartToLocalStorage(state.userId, state.cartItems);
    },

    // Cập nhật số lượng sản phẩm
    updateQuantity: (state, action) => {
      if (!state.userId) {
        state.error = 'User must be logged in to update cart';
        return;
      }

      const { id, size, quantity } = action.payload;
      const item = state.cartItems.find(
        item => item.id === id && item.size === size
      );

      if (item) {
        item.quantity = Math.max(1, quantity);
        item.totalPrice = item.quantity * item.price;

        const totals = calculateTotals(state.cartItems);
        state.totalQuantity = totals.totalQuantity;
        state.totalAmount = totals.totalAmount;

        saveCartToLocalStorage(state.userId, state.cartItems);
      }
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: (state) => {
      if (!state.userId) {
        state.error = 'User must be logged in to clear cart';
        return;
      }

      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;

      saveCartToLocalStorage(state.userId, []);
    },

    // Đặt lại giỏ hàng khi người dùng đăng xuất
    resetCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.userId = null;
      state.error = null;
    },
  },
});

export const {
  initializeCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
