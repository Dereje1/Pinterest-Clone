// main authentication router
// route middleware, the main function that checks if a user is logged in
const isLoggedIn = (req, res, next) => {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  // if they aren't populate the profile page accordingly
  const headerObject = req.headers;
  // the x-forwarded-for property of the header does not appear
  // for local host so add an alternative or will
  // error out locally on split to get the ip address
  // the rest of the requests are common to loacl and remote
  let ip = (headerObject['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
  ip = (ip === '::1') ? 'local' : ip;
  res.json({
    authenticated: false,
    userip: ip,
    username: null,
    displayname: null,
  });
  return null;
};

const authRoutes = (app, passport) => {
// wether a user is logged in or not json data will show up on the profile page
  app.get('/profile', isLoggedIn, (req, res) => {
    const headerObject = req.headers; // need for ip
    let ip = (headerObject['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    ip = (ip === '::1') ? 'local' : ip;
    res.json({
      authenticated: true,
      userip: ip,
      username: req.user.twitter.username,
      displayname: req.user.twitter.displayName, // only expose username and displayname
    });
  });
  // wether a user is logged in or not json data will show up on the profile page

  // guest login path -- fake authentication to provide
  // semi/persistence instaed of doing it on client side
  app.get('/guest', (req, res) => {
    const headerObject = req.headers; // need for ip
    let ip = (headerObject['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0];
    ip = (ip === '::1') ? 'local' : ip;
    res.json({
      authenticated: false,
      userip: ip,
      username: 'Guest',
      displayname: 'Guest',
    });
  });
  // route for logging out
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // =====================================
  // TWITTER ROUTES ======================
  // =====================================
  // route for twitter authentication and login
  app.get('/auth/twitter', passport.authenticate('twitter'));

  // handle the callback after twitter has authenticated the user, just go back to home in my case
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/',
    }));
};

module.exports = authRoutes;
