const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const { router } = require('./crudroutes');

interface reqType {
  session:{
    regenerate: (cb: () => void) => void
    save: (cb: () => void) => void
  }
  App: {
    get: (s: string) => string
  }
}

interface Error {
  status?: number;
}

interface resType {
  sendFile: (f: string)=> void
  json: (p: unknown) => void
  status: (p: unknown) => void
  locals:{
    message: string
    error: Error
  } | Record<string, never>
}

const App = express();

App.use(logger('dev')); // log every request to the console
App.use(bodyParser.json({ limit: '50mb' }));
App.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
App.use(cookieSession({
  maxAge: 21 * 24 * 60 * 60 * 1000,
  keys: [process.env.SESSION_SECRET],
}));
/*
TODO; temp patch for passport 0.6.0 upgrade error, remove after passport resolves issue
see: https://github.com/jaredhanson/passport/issues/904#issuecomment-1307558283
register regenerate & save after the cookieSession middleware initialization
*/
/* istanbul ignore next */
App.use((request: reqType, response: Record<string, never>, next: ()=> void) => {
  if (request.session && !request.session.regenerate) {
    // eslint-disable-next-line no-param-reassign
    request.session.regenerate = (cb:()=> void) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    // eslint-disable-next-line no-param-reassign
    request.session.save = (cb:()=> void) => {
      cb();
    };
  }
  next();
});
// serve webpack build client
App.use(express.static(path.join(__dirname, '../client/public')));
// connect to db and setup authentication / passport
require('./models/db');
require('./auth/index')(App);
// get crud routes
App.use(router);
// serve webpack build client
App.get('*', (req: Record<string, never>, res: resType) => {
  res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
});

// catch 404 and forward to error handler
App.use((req: Record<string, never>, res: Record<string, never>, next: (e: unknown) => void) => {
  const err: Error = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
App.use((err: Error, req: reqType, res: resType) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  if (req.App.get('env') === 'development') {
    res.locals.error = err;
  }
  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = App;
