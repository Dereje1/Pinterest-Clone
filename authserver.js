"use strict"//uses twitter to authenticate via passport see also /Authentication_Config/ folder
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//authentication additional requirements
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash    = require('connect-flash');

var app = require('./app');
// configuration  for authentication===============================================================

require('./Authentication_Config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(logger('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms


// required for passport
app.use(session(
  { secret: process.env.SESSION_SECRET,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),//warning in node if this option is not included
    resave: true,
    saveUninitialized: true
  }
)); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());
// routes ======================================================================
require('./Authentication_Config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
//end authentication
