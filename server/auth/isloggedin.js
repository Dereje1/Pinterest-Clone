// middleware to verify a logged in user.
const ip = require('ip');

module.exports = (req, res, next) => {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  // if they aren't populate the profile page accordingly
  res.json({
    authenticated: false,
    userIp: ip.address(),
    username: null,
    displayname: null,
  });
  return false;
};
