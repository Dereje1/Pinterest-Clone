"use strict"
//mongoose shcema on what to store fror venue goers?
var mongoose = require('mongoose');
var pinSchema = mongoose.Schema({
  owner: String,
  imgDescription:String,
  imgLink:String,
  timeStamp: Number,
  savedBy: [String]
});

//var venueGoers = mongoose.model('going',goingSchema);
module.exports = mongoose.model('pin',pinSchema);
