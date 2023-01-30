/* eslint-disable import/no-import-module-exports */
import { Express } from 'express';
// Index for authentication
const passport = require('passport');
const { setAuthRoutes } = require('./routes');
const { passportConfig } = require('./passportConfig');

const configEntry = (app: Express) => {
  passportConfig(passport); // pass passport for configuration
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  // routes ======================================================================
  setAuthRoutes(app, passport);
};

module.exports = configEntry;
