const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Counter = require('../models/Counter');

exports.createBill = async (orderId) => {
    let counter = await Counter.findByIdAndUpdate('billNumber', {$inc: { seq: 1} }, {new: true, upsert: true});
    let billNumber = counter.seq.toString().padStart(8, '0');
    let formattedBillNumber = billNumber.slice(0, 4) + '-' + billNumber.slice(4);
    let bill = new Bill({
        order: orderId,
        billNumber: formattedBillNumber
    });
    await bill.save();
}