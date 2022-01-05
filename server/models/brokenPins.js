// mongoose shcema on what to store fror pins?
const mongoose = require('mongoose');

const brokenPinsSchema = mongoose.Schema({
  broken: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('brokenPin', brokenPinsSchema);
