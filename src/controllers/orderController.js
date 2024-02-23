const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const cartController = require('../controllers/cartController');

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
    return order;
}

exports.getAllProducts = async (orderId) => {
    // Buscar el pedido en la base de datos
    const order = await Order.findById(orderId).populate('products.product');
    // Devolver los productos asociados con el pedido
    return order.products;
}