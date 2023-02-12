import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieSession from 'cookie-session';
import bodyParser from 'body-parser';
import logger from 'morgan';
import connectToDB from './models/db';
import auth from './auth/index';
import router from './crudroutes';

interface Error {
  status?: number;
  message?: string
}

const App = express();
App.use(logger('dev')); // log every request to the console
App.use(bodyParser.json({ limit: '50mb' }));
App.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
App.use(cookieSession({
  maxAge: 21 * 24 * 60 * 60 * 1000,
  keys: [process.env.SESSION_SECRET || 'any secret'],
}));
/*
TODO; temp patch for passport 0.6.0 upgrade error, remove after passport resolves issue
see: https://github.com/jaredhanson/passport/issues/904#issuecomment-1307558283
register regenerate & save after the cookieSession middleware initialization
*/
/* istanbul ignore next */
App.use((request: Request, response: Response, next: NextFunction) => {
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
connectToDB();
auth(App);
// get crud routes
App.use(router);
// serve webpack build client
App.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
});

// catch 404 and forward to error handler
App.use((req: Request, res: Response, next: NextFunction) => {
  const err: Error = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
App.use((err: Error, req: Request, res: Response) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  if (req.app.get('env') === 'development') {
    res.locals.error = err;
  }
  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

export default App;
