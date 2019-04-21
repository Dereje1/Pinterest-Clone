// Index for authentication
const passport = require('passport');

// configuration  for authentication===============================================================
const passportConfig = require('./passport');
const authRoutes = require('./routes');

const configEntry = (app) => {
  passportConfig(passport); // pass passport for configuration
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  // routes ======================================================================
  authRoutes(app, passport); // load our routes and pass in our app and fully configured passport
  // end authentication
};

module.exports = configEntry;
