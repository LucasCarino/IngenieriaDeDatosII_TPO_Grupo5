const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', async (req, res) => {
    const userId = req.user.id;
    console.log(userId);
    const items = await cartController.getAllItems(userId);
    res.render('cart', { items });
});

router.post('/add', async (req, res) => {
    const userId = req.user.id;
    const itemId = req.body.itemId;
    console.log(userId)
    console.log(itemId)
    cartController.addItem(itemId, userId);
    // res.redirect('/cart');
});

module.exports = router;