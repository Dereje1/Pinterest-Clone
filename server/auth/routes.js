const ip = require('ip');
const isLoggedIn = require('./isloggedin');
const { getUserProfile, getApiKeys } = require('../utils');


const PROVIDERS = [
  { name: 'twitter', options: {} },
  { name: 'google', options: { scope: ['profile', 'email'] } },
  { name: 'github', options: {} },
];

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
