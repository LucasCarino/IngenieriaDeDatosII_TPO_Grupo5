const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Bill = require('../models/Bill');
const adminController = require('../controllers/adminController');

router.get('/products', async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.redirect('/');
    }
    const products = await Product.find();
    res.render('adminProducts', { products });
})

module.exports = router;

router.get('/bills', async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.redirect('/');
    }
    const bills = await Bill.find();
    res.render('adminBills', { bills });
});

router.get('/bills/:id', async (req, res) => {
    const billId = req.params.id;

    // Busca la factura en la base de datos
    const bill = await Bill.findById(billId).populate('order');

    // Envía los detalles de la factura como respuesta
    console.log(bill);
    res.json(bill);
});

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