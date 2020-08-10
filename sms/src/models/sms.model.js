const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// username, password, fname, lname,
const SmsSchema = new Schema({
    date: { type: Date, default: Date.now },
    text: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('Sms', SmsSchema);


