const mongoose = require('mongoose')

const uri = process.env.URI

const db = mongoose.connect(uri)

module.exports = db; 