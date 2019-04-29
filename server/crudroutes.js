const router = require('express').Router();

const pins = require('./models/pins'); // schema for pins
const isLoggedIn = require('./Authentication_Config/isloggedin');


const filterPins = rawPins => rawPins.map((pin) => {
  const {
    _id, imgDescription, imgLink, owner, savedBy,
  } = pin;
  const { name } = owner;
  const modifiedSavedBy = savedBy.map(pinner => pinner.name);
  return {
    _id,
    imgDescription,
    imgLink,
    owner: name,
    savedBy: modifiedSavedBy,
  };
});
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
router.get('/api/', async (req, res) => {
  if (req.query.type === 'profile') {
    try {
      const ownPins = await pins.find({ 'owner.id': req.user.twitter.id }).exec();
      const savedPins = await pins.find({ 'savedBy.id': req.user.twitter.id }).exec();
      res.json(filterPins([...ownPins, ...savedPins]));
    } catch (error) {
      res.json(error);
    }
  } else {
    try {
      const allPins = await pins.find({ }).exec();
      res.json(filterPins(allPins));
    } catch (error) {
      res.json(error);
    }
  }
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
