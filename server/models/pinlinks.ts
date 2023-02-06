import mongoose from 'mongoose';

export interface allPinLinksType extends mongoose.Document{
  imgLink: string,
  originalImgLink: string
  cloudFrontLink: string
}

const pinLinksSchema = new mongoose.Schema({
  pin_id: { type: String, required: true },
  imgLink: { type: String, required: true },
  originalImgLink: { type: String, required: true },
  cloudFrontLink: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<allPinLinksType>('pinLink', pinLinksSchema);
