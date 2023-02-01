import mongoose from 'mongoose';

export interface UserType extends mongoose.Document {
  twitter: {
    id: string,
    token: string,
    displayName: string,
    username: string,
  },
  google: {
    id: string,
    token: string,
    displayName: string,
    username: string,
  },
  github: {
    id: string,
    token: string,
    displayName: string,
    username: string,
  }
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
