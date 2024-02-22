const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: Number,
    customerDetails: {
        name: String,
        lastname: String,
        address: String,
        email: String,
        payment: String,
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        price: Number
    }],
    subtotal: Number,
    taxes: Number,
    total: Number
});

module.exports = mongoose.model('Order', OrderSchema);