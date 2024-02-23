const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const cartController = require('../controllers/cartController');

router.get('/', async (req, res) => {
    let userId = req.user.id;
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
    let userId = req.user.id;
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

    res.render('checkout', { products, total });
});

router.post('/checkout', async (req, res) => {
    let userId = req.user.id;
    let customerDetails = req.body;
    try {
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

        await cartController.clearCart(userId);
        req.flash('success', 'Pedido confirmado, gracias por tu compra!');
    } catch (error) {
        req.flash('error', 'Hubo un error al confirmar tu compra');
    }
    res.redirect('/');
});


module.exports = router;