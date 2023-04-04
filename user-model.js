const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    exercises: [{
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            require: true
        },
        date: {
            type: String,
            required: true,
        }
    }]
})

module.exports = mongoose.model('user', UserSchema)