const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ route yêu cầu đăng nhập
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Kiểm tra header Authorization
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Nếu không có token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để truy cập'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin user từ token
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Token không hợp lệ'
                });
            }

            // Thêm thông tin user vào request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực',
            error: error.message
        });
    }
};

// Middleware kiểm tra quyền admin
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập'
        });
    }
};
