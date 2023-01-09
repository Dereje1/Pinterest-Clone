const mongoose = require('mongoose');

const pinLinksSchema = mongoose.Schema({
  pin_id: { type: String, required: true },
  imgLink: { type: String, required: true },
  originalImgLink: { type: String, required: true },
  cloudFrontLink: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('pinLink', pinLinksSchema);
