const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const adminController = require('../controllers/adminController');
const { pool } = require('../../db');

router.get('/', async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.redirect('/');
    }
    const products = await Product.find();
    res.render('admin', { products });
})

module.exports = router;

router.put('/:id', async (req, res) => {
    console.log("estoy en el router")
    console.log(req.user.isAdmin)
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).send('Unauthorized');
    }

    try {
        adminController.updateProduct(req, res);
        req.flash('success', 'Producto actualizado correctamente');
    } catch (err) {
        req.flash('error', 'Hubo un error al actualizar el producto');
    }
});

router.delete('/:id', function(req, res) {
    console.log("estoy en el route")
    Product.findByIdAndDelete(req.params.id)
    .then(() => {
        res.status(200).send('Product deleted.');
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.post('/newProduct', function(req, res) {
    var newProduct = new Product(req.body);
    newProduct.save()
        .then(() => {
            res.status(200).send('Product created.');
        })
        .catch((err) => {
            res.status(500).send(err);
        });
});