const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    number: {type: String, required: true},
    progress: {
        math: {type: Number, default: 0},
        english : {type: Number, default: 0}
    },
    status: {type: String, default: "registering"},
    currentQ: {type: String}
});

// Export the model
module.exports = mongoose.model('User', UserSchema);