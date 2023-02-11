// mongoose shcema on what to store fror pins?
import mongoose from 'mongoose';
import { tagType } from '../interfaces';

interface unPopulatedComment {
  _id: mongoose.Types.ObjectId,
  user: mongoose.Types.ObjectId,
  comment: string,
  createdAt: string,
}

export interface Pin {
  _id: string,
  imgDescription: string,
  imgLink: string,
  originalImgLink: string,
  owner: mongoose.Types.ObjectId,
  savedBy: mongoose.Types.ObjectId[],
  createdAt: string,
  comments: unPopulatedComment[],
  tags: tagType[],
}

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: true },
}, {
  timestamps: true,
});

const tagSchema = new mongoose.Schema({
  tag: { type: String, required: true },
});

const pinSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imgDescription: { type: String, required: true },
  imgLink: { type: String, required: true },
  originalImgLink: { type: String, required: true },
  savedBy: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  comments: {
    type: [commentSchema],
    default: [],
  },
  tags: {
    type: [tagSchema],
    default: [],
  },
  isBroken: { type: Boolean },
}, { timestamps: true });

export default mongoose.model<Pin>('pin', pinSchema);
