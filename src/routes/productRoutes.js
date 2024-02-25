const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/:id/remove', async (req, res) => {
    let userId = req.user.id;
    let itemId = req.params.id;
    try {
        await productController.removeItem(itemId, userId);
        req.flash('success', 'Producto eliminado del carrito correctamente');
    } catch (err) {
        req.flash('error', 'Hubo un error al eliminar el producto del carrito');
    }
    res.redirect(`/products/${itemId}`);
});

module.exports = router;