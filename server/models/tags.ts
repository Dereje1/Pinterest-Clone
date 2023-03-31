import mongoose from 'mongoose';
import { tagType } from '../interfaces';

const savedTagsSchema = new mongoose.Schema({
  tag: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<tagType>('savedTags', savedTagsSchema);
