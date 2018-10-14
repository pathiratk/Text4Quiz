const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MessageSchema = new Schema({
    number: {type: String, required: true},
    content: {type: String, required: true, max: 100},
    timestamp: {type: Date, default: Date.now},
});

// Export the model
module.exports = mongoose.model('Message', MessageSchema);