// uses twitter to authenticate via passport see also /Authentication_Config/ folder
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// authentication additional requirements
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);


// configuration  for authentication===============================================================
const passportConfig = require('./Authentication_Config/passport');
const authRoutes = require('./Authentication_Config/routes.js');

const configEntry = (app) => {
  passportConfig(passport); // pass passport for configuration

  // set up our express application
  app.use(logger('dev')); // log every request to the console
  app.use(cookieParser()); // read cookies (needed for auth)
  app.use(bodyParser.json()); // get information from html forms


  // required for passport
  app.use(session(
    {
      secret: process.env.SESSION_SECRET,
      // warning in node if this option is not included
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
      resave: true,
      saveUninitialized: true,
    },
  )); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  // routes ======================================================================
  authRoutes(app, passport); // load our routes and pass in our app and fully configured passport
  // end authentication
};

module.exports = configEntry;
