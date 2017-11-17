"use strict"//primary module to interact with client
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var axios = require('axios')
var queryString = require('query-string');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);



var app = express();
//not using session in this project but good to have incase
app.use(session(
  { secret: process.env.SESSION_SECRET,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),//warning in node if this option is not included
    resave: true,
    saveUninitialized: true
  }
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//APIs Start
var db = require('./models/db') //mongoose required common db
var pins = require('./models/pins')//schema for books

app.post('/newpin',function(req,res){//adds a new book to the db
  var addedpin = req.body;
  pins.create(addedpin,function(err,pin){
    if(err){
      throw err;
    }
    res.json(pin)
  })
})

app.get('/:user',function(req,res){//gets books depending on request type per user or all books
  let userName = req.params.user
  let query = (userName==="All") ? {} : {owner: userName};
  pins.find(query,function(err,pins){
    if(err){
      res.json (err) ;
    }
    res.json(pins)
  })
})
//APIs end
app.listen(3001,function(err){
  if(err){
    console.log(err)
  }
  console.log("API Server is listening on port 3001")
})
