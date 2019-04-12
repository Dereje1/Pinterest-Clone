// middleware to verify a logged in user.
module.exports = (req, res, next) => {
  const headerObject = req.headers;
  /*
      the x-forwarded-for property of the header does not appear
      for local host so add an alternative or will
      error out locally on split to get the ip address the rest
      of the requests are common to loacl and remote
    */
  let ip = (headerObject['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
  ip = (ip === '::1') ? 'local' : ip;
  req.userip = ip; // attach ip to request
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  // if they aren't populate the profile page accordingly
  res.json({
    authenticated: false,
    userip: ip,
    username: null,
    displayname: null,
  });
  return false;
};
