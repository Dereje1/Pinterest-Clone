// config/passport.js for twitter
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { getApiKeys } = require('./utils')
// load up the user model
const User = require('../models/user');

const configMain = (passport) => {
  const twitterApiKeys = getApiKeys('twitter');
  const googleApiKeys = getApiKeys('google');
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

  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  if (twitterApiKeys) {
    passport.use(new TwitterStrategy(twitterApiKeys, ((token, tokenSecret, profile, done) => {
      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Twitter
      process.nextTick(() => {
        User.findOne({ 'twitter.id': profile.id }, (err, user) => {
          // if there is an error, stop everything and return that
          if (err) return done(err);

          // if the user is found then log them in
          if (user) return done(null, user);

          // if there is no user, create them
          const { id, username, displayName } = profile;
          // set all of the user data that we need
          const newUser = new User({
            twitter: {
              id,
              token,
              username,
              displayName,
            },
          });
          // save our user into the database
          newUser.save((saveErr) => {
            if (saveErr) throw saveErr;
            return done(null, newUser);
          });
          return null;
        });
      });
    })));
  }
  // =========================================================================
  // GOOGLE =================================================================
  // =========================================================================
  if (googleApiKeys) {
    passport.use(new GoogleStrategy(googleApiKeys, (token, tokenSecret, profile, done) => {
      User.findOne({ 'google.id': profile.id }, (err, user) => {
        if (err) return done(err);
        if (user) return done(null, user);
        // create new user
        const { id, emails, displayName } = profile;
        const newUser = new User({
          google: {
            id,
            token,
            displayName,
            username: emails[0].value,
          },
        });
        newUser.save((saveErr) => {
          if (saveErr) throw saveErr;
          return done(null, newUser);
        });
        return false; // eslint needs return
      });
    }));
  };
}
module.exports = configMain;
