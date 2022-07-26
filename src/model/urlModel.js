const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        required: [true, 'url code is required'],
        lowercase: true,
        trim: true
    },
    longUrl: {
        type: String,
        required: [true, 'url must be provided']
    },
    shortUrl: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model("URL", urlSchema)