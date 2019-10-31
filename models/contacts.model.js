const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactsSchema = new Schema({
    user: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    number: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('contacts', contactsSchema, 'contacts');
