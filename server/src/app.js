require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./configs/db');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:3001','http://localhost:3000'],
    credentials: true
  }));
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Thêm vào sau các middleware hiện có
app.use('/uploads', express.static('public/uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});