// mongoose shcema on what to store fror pins?
const mongoose = require('mongoose');

const pinSchema = mongoose.Schema({
  owner: String,
  imgDescription: String,
  imgLink: String,
  timeStamp: Number,
  savedBy: [String],
});

module.exports = mongoose.model('pin', pinSchema);
