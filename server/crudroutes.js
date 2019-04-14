const router = require('express').Router();

const pins = require('./models/pins'); // schema for pins
const isLoggedIn = require('./Authentication_Config/isloggedin');
/* Crud Routes */
// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, (req, res) => {
  const addedpin = req.body;
  pins.create(addedpin, (err, pin) => {
    if (err) throw err;
    res.json(pin);
  });
});
// gets pins depending on request type per user or all,
// although I am doing all filtering on client side
router.get('/api/:user', (req, res) => {
  const userName = req.params.user;
  const query = (userName === 'All') ? {} : { owner: userName };
  pins.find(query, (err, userPins) => {
    if (err) res.json(err);
    res.json(userPins);
  });
});
// deletes a pin by id
router.delete('/api/:_id', isLoggedIn, (req, res) => {
  const query = { _id: req.params._id };
  pins.remove(query, (err, pin) => {
    if (err) throw err;
    res.json(pin);
  });
});

// update pins in db
router.put('/api/:_id', isLoggedIn, (req, res) => {
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

module.exports = router;
