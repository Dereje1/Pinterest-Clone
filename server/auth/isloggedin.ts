/* eslint-disable import/no-import-module-exports */
import { genericResponseType } from '../interfaces';

// middleware to verify a logged in user.
const ip = require('ip');
const { getApiKeys } = require('../utils');

module.exports = (req:Express.Request, res:genericResponseType, next: ()=> void) => {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  // if they aren't populate the profile page accordingly
  const { apiKeysFound: providers } = getApiKeys();
  res.json({
    authenticated: false,
    userIp: ip.address(),
    username: null,
    displayName: null,
    providers,
  });
  return false;
};
