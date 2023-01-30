/* eslint-disable import/no-import-module-exports */
import { PassportStatic } from 'passport';
import { Express } from 'express';
import { genericResponseType } from '../interfaces';

const ip = require('ip');
const isLoggedIn = require('./isloggedin');
const { getUserProfile, getApiKeys } = require('../utils');

const PROVIDERS = [
  { name: 'twitter', options: {} },
  { name: 'google', options: { scope: ['profile', 'email'] } },
  { name: 'github', options: {} },
];

const getProfile = (req: Express.Request, res: genericResponseType) => {
  const profile = getUserProfile(req.user);
  res.json({
    ...profile,
    authenticated: true,
    userIp: ip.address(),
  });
};

const setGuest = (req: Express.Request, res: genericResponseType) => {
  const { apiKeysFound: providers } = getApiKeys();
  res.json({
    authenticated: false,
    userIp: ip.address(),
    username: 'Guest',
    displayName: 'Guest',
    providers,
  });
};

const logOut = (req: Express.Request, res: genericResponseType) => {
  req.logout(() => {
    res.redirect('/');
  });
};

const setAuthRoutes = (app: Express, passport: PassportStatic) => {
  app.get('/auth/profile', isLoggedIn, getProfile);
  app.get('/auth/guest', setGuest);
  app.get('/auth/logout', logOut);
  // set authentication routes
  PROVIDERS.forEach(({ name, options }) => {
    app.get(`/auth/${name}`, passport.authenticate(name, options));
  });
  // set redirect routes
  PROVIDERS.forEach(({ name }) => {
    app.get(`/auth/${name}/redirect`, passport.authenticate(name, {
      successRedirect: '/pins',
      failureRedirect: '/',
    }));
  });
};

module.exports = {
  setAuthRoutes, getProfile, logOut, setGuest,
};
