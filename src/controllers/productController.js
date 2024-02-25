const Product = require('../models/Product');
const cartController = require('../controllers/cartController');
const { redis } = require('../../db');

let client = redis;

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('products', { products: products });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProductById = async (req, res) => {
    let userId = req.user && req.user.id;
    if (!userId) {
        return res.redirect('/user/login');
    }
    const itemId = req.params.id;
    try {
        const product = await Product.findById(itemId);
        const cart = await cartController.getAllItems(userId);

        if (product) {
            res.render('productDetail', { product, cart });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while trying to find the product');
    }
};

exports.removeItem = async (itemId, userId) => {
    return new Promise((resolve, reject) => {
        client.hincrby(`cart:${userId}`, itemId, -1, (err, res) => {
            if(err) {
                return reject(err);
            }
            if (res <= 0) {
                client.hdel(`cart:${userId}`, itemId, (err, res) => {
                    if(err) {
                        return reject(err);
                    }
                    resolve(res);
                });
            } else {
                resolve(res);
            }
        });
    });
};