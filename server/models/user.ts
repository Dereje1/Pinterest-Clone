import mongoose from 'mongoose';

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

export default mongoose.model('User', userSchema);
