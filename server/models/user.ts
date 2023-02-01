import mongoose from 'mongoose';

export interface UserType extends mongoose.Document {
  displayName: string,
  username: string,
  id: string
}

// define the schema for our user model
const userSchema = new mongoose.Schema({
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String,
  },
  google: {
    id: String,
    token: String,
    displayName: String,
    username: String,
  },
  github: {
    id: String,
    token: String,
    displayName: String,
    username: String,
  },
});

export default mongoose.model<UserType>('User', userSchema);
