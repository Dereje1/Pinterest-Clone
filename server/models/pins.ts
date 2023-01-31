// mongoose shcema on what to store fror pins?
import mongoose from 'mongoose';

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
  owner: {
    name: { type: String, required: true },
    service: { type: String, required: true },
    id: { type: String, required: true },
  },
  imgDescription: { type: String, required: true },
  imgLink: { type: String, required: true },
  originalImgLink: { type: String, required: true },
  savedBy: {
    type: [{
      name: { type: String, required: true },
      service: { type: String, required: true },
      id: { type: String, required: true },
    }],
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

export default mongoose.model('pin', pinSchema);
