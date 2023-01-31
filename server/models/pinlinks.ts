import mongoose from 'mongoose';

const pinLinksSchema = new mongoose.Schema({
  pin_id: { type: String, required: true },
  imgLink: { type: String, required: true },
  originalImgLink: { type: String, required: true },
  cloudFrontLink: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('pinLink', pinLinksSchema);
