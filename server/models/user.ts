import mongoose from 'mongoose';

export interface UserType {
    _id: string,
    userId: string,
    token: string,
    displayName: string | null,
    username: string,
    service: string,
    createdAt: string,
}

// define the schema for our user model
const userSchema = new mongoose.Schema({
  userId: String,
  token: String,
  displayName: String,
  username: String,
  service: String,
}, { timestamps: true });

export default mongoose.model<UserType>('User', userSchema);
