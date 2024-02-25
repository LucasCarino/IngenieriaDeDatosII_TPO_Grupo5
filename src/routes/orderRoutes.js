const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');

router.get('/', async (req, res) => {
    let userId = req.user && req.user.id;
    if (!userId) {
        return res.redirect('/user/login');
    }
    let orders = await orderController.getAllOrders(userId);
    let category = await userController.getUserCategory(userId);
    res.render('orders', { orders, category });
});

router.get('/:orderId/products', async (req, res) => {
    let userId = req.user && req.user.id;
    if (!userId) {
        return res.redirect('/user/login');
    }
    try {
        const products = await orderController.getAllProducts(req.params.orderId);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;