const ip = require('ip');
const isLoggedIn = require('./isloggedin');
const { getUserProfile, getApiKeys } = require('../utils');

const getProfile = (req, res) => {
  const profile = getUserProfile(req.user);
  res.json({
    ...profile,
    authenticated: true,
    userIp: ip.address(),
  });
};

const setGuest = (req, res) => {
  const { apiKeysFound: providers } = getApiKeys();
  res.json({
    authenticated: false,
    userIp: ip.address(),
    username: 'Guest',
    displayName: 'Guest',
    providers,
  });
};

const logOut = (req, res) => {
  req.logout();
  res.redirect('/');
};

const setAuthRoutes = (app, passport) => {
  app.get('/auth/profile', isLoggedIn, getProfile);
  app.get('/auth/guest', setGuest);
  app.get('/auth/logout', logOut);
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/auth/github', passport.authenticate('github'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/',
  }));
  app.get('/auth/google/redirect', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/',
  }));
  app.get('/auth/github/redirect', passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/',
  }));
};

module.exports = {
  setAuthRoutes, getProfile, logOut, setGuest,
};
