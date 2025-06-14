import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Sửa lại URL endpoint
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Không thể tải sản phẩm');
    }
  }
);

// Fetch sản phẩm theo categoryId
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Không thể tải sản phẩm trong danh mục này');
    }
  }
);

// Fetch chi tiết sản phẩm nếu cần
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.message || 'Không thể tải chi tiết sản phẩm');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selectedProduct: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Xử lý fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Thêm xử lý cho fetchProductsByCategory
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.status = 'loading';
        })
        .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
         state.status = 'succeeded';
         state.items = action.payload;
         state.error = null;
        })
        .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        })
  },
});

export default productSlice.reducer; 