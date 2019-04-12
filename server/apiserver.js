// primary module to interact with client
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();
const isLoggedIn = require('./Authentication_Config/isloggedin');
// not using session in this project but good to have incase
app.use(session(
  {
    secret: process.env.SESSION_SECRET,
    // warning in node if this option is not included
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: true,
    saveUninitialized: true,
  },
));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// APIs Start
require('./models/db'); // mongoose required common db
require('./Authentication_Config/authserver')(app);
const pins = require('./models/pins'); // schema for pins

// adds a new pin to the db
app.post('/newpin', isLoggedIn, (req, res) => {
  const addedpin = req.body;
  pins.create(addedpin, (err, pin) => {
    if (err) throw err;
    res.json(pin);
  });
});
// gets pins depending on request type per user or all,
// although I am doing all filtering on client side
app.get('/:user', (req, res) => {
  const userName = req.params.user;
  const query = (userName === 'All') ? {} : { owner: userName };
  pins.find(query, (err, userPins) => {
    if (err) res.json(err);
    res.json(userPins);
  });
});
// deletes a pin by id
app.delete('/:_id', isLoggedIn, (req, res) => {
  const query = { id: req.params._id };
  pins.remove(query, (err, pin) => {
    if (err) throw err;
    res.json(pin);
  });
});

// update pins in db
app.put('/:_id', isLoggedIn, (req, res) => {
  const pinToUpdate = req.body;
  const pinID = req.params._id;
  // comes formatted from client side to only include the array
  // that contains the "pin saved by" property
  // When true returns the updated document
  const update = { $set: { savedBy: pinToUpdate } };
  const modified = { new: true };
  pins.findByIdAndUpdate(pinID, update, modified, (err, pin) => {
    if (err) throw err;
    res.json(pin);
  });
});

// APIs end
app.listen(3001, (err) => {
  if (err) console.log(err);
  else console.log('API Server is listening on port 3001');
});
