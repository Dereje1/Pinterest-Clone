"use strict"
//mongoose shcema on what to store fror venue goers?
var mongoose = require('mongoose');
var goingSchema = mongoose.Schema({
   yelpID: String,
   userName: String,
   timeStamp: Number
});

//var venueGoers = mongoose.model('going',goingSchema);
module.exports = mongoose.model('going',goingSchema);
