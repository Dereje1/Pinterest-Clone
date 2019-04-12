const express = require('express');
const path = require('path');

const app = express();

const httpProxy = require('http-proxy');

// Set up PROXY server with the module from above
const apiProxy = httpProxy.createProxyServer(
  { target: 'http://localhost:3001' },
);
// apply middleware that intercepts all requests to the
// api and retrieves the resources from the prxy

app.use('/api', (req, res) => {
  apiProxy.web(req, res);
});

// server primary route
app.use(express.static(path.join(__dirname, '../client/public')));
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
