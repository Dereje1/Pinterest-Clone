/* eslint-disable import/no-import-module-exports */
import { PassportStatic } from 'passport';
import { Request, Express } from 'express';
import ip from 'ip';
import isLoggedIn from './isloggedin';
import { getUserProfile, getApiKeys } from '../utils';
import { genericResponseType, reqUser } from '../interfaces';

const PROVIDERS = [
  { name: 'twitter', options: {} },
  { name: 'google', options: { scope: ['profile', 'email'] } },
  { name: 'github', options: {} },
];

interface getProfileReq {
  user: reqUser
}

export const getProfile = (req: getProfileReq | Request, res: genericResponseType) => {
  const profile = getUserProfile(req.user);
  res.json({
    ...profile,
    authenticated: true,
    userIp: ip.address(),
  });
};

export const setGuest = (req: Express.Request, res: genericResponseType) => {
  const { apiKeysFound: providers } = getApiKeys();
  res.json({
    authenticated: false,
    userIp: ip.address(),
    username: 'Guest',
    displayName: 'Guest',
    providers,
  });
};

export const logOut = (req: Express.Request, res: genericResponseType) => {
  req.logout(() => {
    res.redirect('/');
  });
};

export const setAuthRoutes = (app: Express, passport: PassportStatic) => {
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
