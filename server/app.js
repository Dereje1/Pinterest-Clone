const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const { router } = require('./crudroutes');

const app = express();

app.use(logger('dev')); // log every request to the console
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieSession({
  maxAge: 21 * 24 * 60 * 60 * 1000,
  keys: [process.env.SESSION_SECRET],
}));

/*
TODO; temp patch for passport 0.6.0 upgrade error, remove after passport resolves issue
see: https://github.com/jaredhanson/passport/issues/904#issuecomment-1307558283
register regenerate & save after the cookieSession middleware initialization
*/
/* istanbul ignore next */
app.use((request, response, next) => {
  if (request.session && !request.session.regenerate) {
    // eslint-disable-next-line no-param-reassign
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    // eslint-disable-next-line no-param-reassign
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(express.static(path.join(__dirname, '../client/public')));

require('./models/db'); // mongoose required common db
require('./auth/index')(app);

app.use(router);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
