"use strict"
var express = require('express');
var path = require('path');

var app = module.exports = express();

var httpProxy = require('http-proxy');
// Set up PROXY server with the module from above
const apiProxy = httpProxy.createProxyServer(
  {target:"http://localhost:3001"}
)
//apply middleware that intercepts all requests to the /api and retrieves the resources from the prxy

app.use('/api',function(req,res){
  apiProxy.web(req,res)
})

//end proxy setup
var db = require('./models/db')

require('./authserver')//add authentication

//server primary route
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res){
   res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
