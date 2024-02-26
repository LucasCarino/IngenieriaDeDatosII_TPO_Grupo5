const mongoose = require('mongoose');
const Product = require('../models/Product');

exports.updateProduct = async (req, res) => {
    const { id, name, description, url, price } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        if (name !== undefined) {
            product.name = name;
        }
        if (description !== undefined) {
            product.description = description;
        }
        if (url !== undefined) {
            product.url = url;
        }
        if (price !== undefined) {
            product.price = price;
        }

        await product.save();

        res.send('Producto actualizado correctamente');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno del servidor');
    }
}