const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const cartController = require('../controllers/cartController');
const { pool } = require('../../db');

exports.getAllOrders = async (userId) => {
    try {
        const orders = await Order.find({ userId: userId });
        return orders;
    } catch (error) {
        console.error(error);
        return [];
    }
}

exports.createOrder = async (userId, customerDetails) => {
    let cartItems = await cartController.getAllItems(userId);
    let products = await Product.find({
        _id: { $in: Object.keys(cartItems) }
    });
    let subtotal = 0;
    let productsWithQuantity = products.map(product => {
        let productObj = product.toObject();
        productObj.quantity = cartItems[productObj._id.toString()];
        subtotal += productObj.price * productObj.quantity;
        return {
            product: productObj._id,
            quantity: productObj.quantity,
            price: productObj.price
        };
    });

    let taxes = subtotal * 0.15;
    let total = subtotal + taxes;

    let order = new Order({
        userId,
        customerDetails,
        products: productsWithQuantity,
        subtotal,
        taxes,
        total
    });

    await order.save();

    const orderCount = await Order.countDocuments({ userId: userId });

    let newCategory;
    if (orderCount >= 5) {
        newCategory = 'top';
    } else if (orderCount >= 3) {
        newCategory = 'medium';
    } else {
        newCategory = 'low';
    }

    await pool.query('UPDATE users SET category = $1 WHERE id = $2', [newCategory, userId]);

    return order;
}

exports.getAllProducts = async (orderId) => {
    const order = await Order.findById(orderId).populate('products.product');
    return order.products;
}