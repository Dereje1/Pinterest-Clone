/* eslint-disable import/no-import-module-exports */
import { Express } from 'express';
// Index for authentication
import passport from 'passport';
import { setAuthRoutes } from './routes';
import { passportConfig } from './passportConfig';

const configEntry = (app: Express) => {
  passportConfig(passport); // pass passport for configuration
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  // routes ======================================================================
  setAuthRoutes(app, passport);
};

export default configEntry;
