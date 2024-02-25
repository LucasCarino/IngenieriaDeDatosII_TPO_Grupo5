const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { pool } = require('../../db');
const cartController = require('../controllers/cartController');
const billController = require('../controllers/billController');
const orderController = require('../controllers/orderController');

router.get('/', async (req, res) => {
    let userId = req.user && req.user.id;
    if (!userId) {
        return res.redirect('/user/login');
    }
    let cartItems = await cartController.getAllItems(userId);

    let products = await Product.find({
        _id: { $in: Object.keys(cartItems) }
    });

    let total = 0;
    products = products.map(product => {
        let productObj = product.toObject();
        productObj.quantity = cartItems[productObj._id.toString()];
        total += productObj.price * productObj.quantity;
        return productObj;
    });

    res.render('cart', { products, total });
});

router.post('/add', async (req, res) => {

    if (!req.user) {
        req.flash('error', 'Debes iniciar sesión para comprar');
        return res.redirect('/user/login');
    }

    let userId = req.user.id;
    let itemId = req.body.itemId;
    try {
        await cartController.addItem(itemId, userId);
        req.flash('success', 'Producto agregado al carrito correctamente');
    } catch (error) {
        req.flash('error', 'Hubo un error al agregar el producto al carrito');
    }
    res.redirect('/products/' + itemId);
});

router.post('/delete/:itemId', async (req, res) => {
    let userId = req.user.id;
    let itemId = req.params.itemId;
    try {
        await cartController.removeItem(itemId, userId);
        req.flash('success', 'Producto eliminado del carrito correctamente');
    } catch (err) {
        req.flash('error', 'Hubo un error al eliminar el producto del carrito');
    }
    res.redirect('/cart');
});

router.get('/checkout', async (req, res) => {
    let userId = req.user && req.user.id;
    if (!userId) {
        return res.redirect('/user/login');
    }
    let cartItems = await cartController.getAllItems(userId);

    if(Object.keys(cartItems).length === 0) {
        req.flash('error', 'No hay productos en el carrito');
        return res.redirect('/products');
    }

    if(cartItems.length === 0) {
        req.flash('error', 'No hay productos en el carrito');
        return res.redirect('/products');
    }

    const userQuery = `SELECT category FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);

    let category = userResult.rows[0].category;


    let products = await Product.find({
        _id: { $in: Object.keys(cartItems) }
    });

    let total = 0;
    products = products.map(product => {
        let productObj = product.toObject();
        productObj.quantity = cartItems[productObj._id.toString()];
        total += productObj.price * productObj.quantity;
        return productObj;
    });

    res.render('checkout', { products, total, category });
});

router.post('/checkout', async (req, res) => {
    let userId = req.user.id;
    let customerDetails = req.body;
    try {
        let order = await orderController.createOrder(userId, customerDetails);
        await billController.createBill(order._id);
        await cartController.clearCart(userId);
        req.flash('success', 'Pedido confirmado, gracias por tu compra!');
    } catch (error) {
        req.flash('error', 'Hubo un error al confirmar tu compra');
    }
    res.redirect('/');
});


module.exports = router;