import mongoose from 'mongoose';

const savedTagsSchema = new mongoose.Schema({
  tag: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('savedTags', savedTagsSchema);
