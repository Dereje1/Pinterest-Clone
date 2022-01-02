// mongoose shcema on what to store fror pins?
const mongoose = require('mongoose');

const brokenPinSchema = mongoose.Schema({
  pinId: { type: String, required: true },
  brokenSince: { type: String, required: true },
  imgDescription: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('brokenPin', brokenPinSchema);
