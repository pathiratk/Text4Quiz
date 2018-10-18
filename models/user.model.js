const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    number: {type: String, required: true},
    status: {type: String, default: "registering"},
    currentQ: {type: String},
    progress: {
        math: {
            correct: {type: Number, default: 0},
            current: {type: Number, default: 0}
        },
        english: {
            correct: {type: Number, default: 0},
            current: {type: Number, default: 0}
        }
    }
});

// Export the model
module.exports = mongoose.model('User', UserSchema);