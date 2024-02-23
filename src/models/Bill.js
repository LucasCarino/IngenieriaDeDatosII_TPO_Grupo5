const mongoose = require('mongoose');
const Counter = require('./Counter');

const BillSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: { type: Date, required: true, default: Date.now }, 
    billNumber: { type: String, required: true }
});

module.exports = mongoose.model('Bill', BillSchema);