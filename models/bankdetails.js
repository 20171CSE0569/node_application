const mongoose = require('mongoose');

var bankData = mongoose.model('bankData', {
    bankName: { type: String },
    comments: { type: String },
    accountNumber: { type: String },
    routingNumber: { type: Number },
    swiftCode: { type: Number },
    commentedDate: { type: Date },
    
});


module.exports = { bankData };
