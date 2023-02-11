// mongoose shcema on what to store fror pins?
import mongoose from 'mongoose';
import { commentType, tagType } from '../interfaces';

export interface Pin {
  _id: string,
  imgDescription: string,
  imgLink: string,
  originalImgLink: string,
  owner: mongoose.Types.ObjectId,
  savedBy: mongoose.Types.ObjectId[],
  createdAt: string,
  comments: commentType[],
  tags: tagType[],
}

const commentSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  service: { type: String, required: true },
  userId: { type: String, required: true },
  comment: { type: String, required: true },
}, {
  timestamps: true, // timestamps options for subfields
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
