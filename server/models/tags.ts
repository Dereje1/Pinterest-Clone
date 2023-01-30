const mongoose = require('mongoose');

const savedTagsSchema = mongoose.Schema({
  tag: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('savedTags', savedTagsSchema);

export {};
