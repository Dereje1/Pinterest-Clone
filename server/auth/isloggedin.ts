/* eslint-disable import/no-import-module-exports */
import { Request, Response, NextFunction } from 'express';
import ip from 'ip';

// middleware to verify a logged in user.
import { getApiKeys } from '../utils';

export default (req: Request, res:Response, next: NextFunction) => {
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
