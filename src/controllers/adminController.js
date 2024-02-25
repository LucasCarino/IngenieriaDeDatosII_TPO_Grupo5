const mongoose = require('mongoose');
const Product = require('../models/Product');

exports.updateProduct = async (req, res) => {
    console.log("estoy en el controller")
    const { name, description, url, price } = req.body;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        product.name = name;
        product.description = description;
        product.url = url;
        product.price = price;

        await product.save();

        res.send('Product updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}