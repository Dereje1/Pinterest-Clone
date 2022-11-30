// config/passport.js for twitter
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const { getApiKeys } = require('../utils');
// load up the user model
const User = require('../models/user');

const processLogin = async (token, tokenSecret, profile, done) => {
  const {
    provider, id, username, displayName, emails,
  } = profile;
  try {
    const user = await User.findOne({ [`${provider}.id`]: id }).exec();
    if (user) {
      return done(null, user);
    }
    const newUser = await User.create({
      [provider]: {
        id,
        token,
        username: username || emails[0].value,
        displayName,
      },
    });
    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
};

const passportConfig = (passport) => {
  const { keys: { twitterApiKeys, googleApiKeys, githubApiKeys } } = getApiKeys();
  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  if (twitterApiKeys) {
    passport.use(new TwitterStrategy(twitterApiKeys, processLogin));
  }

  if (googleApiKeys) {
    passport.use(new GoogleStrategy(googleApiKeys, processLogin));
  }

  if (githubApiKeys) {
    passport.use(new GitHubStrategy(githubApiKeys, processLogin));
  }
};
module.exports = { passportConfig, processLogin };
