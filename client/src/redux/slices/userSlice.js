// src/redux/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Hàm lấy user từ localStorage khi khởi động
const getUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('Loading user from storage:', storedUser);
    if (storedUser && token) {
      const user = JSON.parse(storedUser);
      console.log('Parsed user:', user);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log('Setting user:', action.payload);
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      
      if (action.payload) {
        console.log('Saving user to storage:', action.payload);
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
