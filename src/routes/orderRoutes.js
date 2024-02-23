const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', async (req, res) => {
    let userId = req.user.id;
    let orders = await orderController.getAllOrders(userId);
    res.render('orders', { orders });
});

router.get('/:orderId/products', async (req, res) => {
    try {
        const products = await orderController.getAllProducts(req.params.orderId);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;