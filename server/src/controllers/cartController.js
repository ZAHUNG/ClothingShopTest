    // const Cart = require('../models/Cart');
    const Product = require('../models/Product');

    exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
        .populate('items.product', 'name price images');

        if (!cart) {
        cart = new Cart({ user: req.user.id, items: [] });
        await cart.save();
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const formattedCart = {
        items: cart.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images?.[0]?.url ? `${baseUrl}${item.product.images[0].url}` : 'https://via.placeholder.com/150',
            quantity: item.quantity,
            totalPrice: item.product.price * item.quantity
        })),
        totalQuantity: cart.items.reduce((total, item) => total + item.quantity, 0),
        totalAmount: cart.totalAmount
        };

        res.json(formattedCart);
    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).json({ message: 'Lỗi khi lấy giỏ hàng' });
    }
    };

    exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Kiểm tra sản phẩm có tồn tại
        const product = await Product.findById(productId);
        if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
        cart = new Cart({ user: req.user.id, items: [] });
        }

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        const existingItem = cart.items.find(item => 
        item.product.toString() === productId
        );

        if (existingItem) {
        existingItem.quantity += quantity;
        } else {
        cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        await cart.populate('items.product', 'name price images');

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const formattedCart = {
        items: cart.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images?.[0]?.url ? `${baseUrl}${item.product.images[0].url}` : 'https://via.placeholder.com/150',
            quantity: item.quantity,
            totalPrice: item.product.price * item.quantity
        })),
        totalQuantity: cart.items.reduce((total, item) => total + item.quantity, 0),
        totalAmount: cart.totalAmount
        };

        res.json(formattedCart);
    } catch (error) {
        console.error('Error in addToCart:', error);
        res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng' });
    }
    };

    exports.updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (quantity < 1) {
        return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
        return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }

        const cartItem = cart.items.find(item => 
        item.product.toString() === productId
        );

        if (!cartItem) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
        }

        cartItem.quantity = quantity;
        await cart.save();
        await cart.populate('items.product', 'name price images');

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const formattedCart = {
        items: cart.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images?.[0]?.url ? `${baseUrl}${item.product.images[0].url}` : 'https://via.placeholder.com/150',
            quantity: item.quantity,
            totalPrice: item.product.price * item.quantity
        })),
        totalQuantity: cart.items.reduce((total, item) => total + item.quantity, 0),
        totalAmount: cart.totalAmount
        };

        res.json(formattedCart);
    } catch (error) {
        console.error('Error in updateCartItem:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng' });
    }
    };

    exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
        return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }

        cart.items = cart.items.filter(item => 
        item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.product', 'name price images');

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const formattedCart = {
        items: cart.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images?.[0]?.url ? `${baseUrl}${item.product.images[0].url}` : 'https://via.placeholder.com/150',
            quantity: item.quantity,
            totalPrice: item.product.price * item.quantity
        })),
        totalQuantity: cart.items.reduce((total, item) => total + item.quantity, 0),
        totalAmount: cart.totalAmount
        };

        res.json(formattedCart);
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng' });
    }
    };
