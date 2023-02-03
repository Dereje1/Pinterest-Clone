import mongoose from 'mongoose';

export interface UserTypeV2 extends mongoose.Document {
    userId: string,
    token: string,
    displayName: string,
    username: string,
    service: string,
}

// define the schema for our user model
const userSchema = new mongoose.Schema({
  userId: String,
  token: String,
  displayName: String,
  username: String,
  service: String,
}, { timestamps: true });

export default mongoose.model<UserTypeV2>('UserV2', userSchema);
