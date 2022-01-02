// mongoose shcema on what to store fror pins?
const mongoose = require('mongoose');

const backupPinsSchema = mongoose.Schema({
  backup: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('backupPin', backupPinsSchema);
