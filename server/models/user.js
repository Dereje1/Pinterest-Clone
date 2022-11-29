//  for new users
// load the things we need
const mongoose = require('mongoose');

// define the schema for our user model
const userSchema = mongoose.Schema({
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

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
