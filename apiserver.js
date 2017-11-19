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
var pins = require('./models/pins')//schema for pins

app.post('/newpin',function(req,res){//adds a new pin to the db
  var addedpin = req.body;
  pins.create(addedpin,function(err,pin){
    if(err){
      throw err;
    }
    res.json(pin)
  })
})

app.get('/:user',function(req,res){//gets pins depending on request type per user or all books, although I am doing all filtering on client side
  let userName = req.params.user
  let query = (userName==="All") ? {} : {owner: userName};
  pins.find(query,function(err,pins){
    if(err){
      res.json (err) ;
    }
    res.json(pins)
  })
})

app.delete('/:_id', function(req,res){//deletes a pin by id
  var query = {_id: req.params._id};
  pins.remove(query, function(err, pin){
    if(err){
    throw err;
    }
    res.json(pin);
  })
})

//update pins in db
app.put('/:_id', function(req, res){
   var pinToUpdate = req.body;
   var pinID = req.params._id;

   var update = { '$set': {savedBy: pinToUpdate}};//comes formatted from client side to only include the array
   //that contains the "pin saved by" property
   // When true returns the updated document
   var modified = {new: true};
   pins.findByIdAndUpdate(pinID, update, modified, function(err, pin){
       if(err){
         throw err;
       }
       res.json(pin);
   })
})
//APIs end
app.listen(3001,function(err){
  if(err){
    console.log(err)
  }
  console.log("API Server is listening on port 3001")
})
