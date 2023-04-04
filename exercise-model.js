const mongoose = require('mongoose')

const ExerciseSchema = new mongoose.Schema({
    idUser: {
        type: String,
        required: true
    },
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
})

module.exports = mongoose.model('exercise', ExerciseSchema)