const router = require('express').Router();

const pins = require('./models/pins'); // schema for pins
const isLoggedIn = require('./Authentication_Config/isloggedin');

/* CRUD utilities */
/* return only required pin info to the client */
const filterPins = (rawPins, user) => rawPins.map((pin) => {
  const {
    _id, imgDescription, imgLink, owner, savedBy,
  } = pin;
  const savedIds = savedBy.map(s => s.id);
  const { name } = owner;
  const modifiedSavedBy = savedBy.map(pinner => pinner.name);
  return {
    _id,
    imgDescription,
    imgLink,
    owner: name,
    savedBy: modifiedSavedBy,
    owns: user ? user.twitter.id === owner.id : null,
    hasSaved: user ? savedIds.includes(user.twitter.id) : null,
  };
});
/* Checks if A pin has already been saved by the user
   If it hasn't return the savedBy Array for the pin
*/
const hasSavedPin = async (pinID, userInfo) => {
  try {
    const pin = await pins.findById(pinID).exec();
    const savedIds = pin.savedBy.map(s => s.id);
    return savedIds.includes(userInfo.twitter.id) ? [true, null] : [false, [...pin.savedBy]];
  } catch (error) {
    throw error;
  }
};
/* Checks if A pin is owned by the user
   If it is not returns the savedBy Array for the pin
*/
const isOwner = async (pinID, userInfo) => {
  try {
    const pin = await pins.findById(pinID).exec();
    return userInfo.twitter.id === pin.owner.id ? [true, null] : [false, [...pin.savedBy]];
  } catch (error) {
    throw error;
  }
};

/* Crud Routes */
// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, async (req, res) => {
  try {
    const addedpin = await pins.create(req.body);
    res.json(addedpin);
  } catch (error) {
    res.json(error);
  }
});
// gets pins: all or just user's saved and owned pins,
router.get('/api/', async (req, res) => {
  if (req.query.type === 'profile') {
    try {
      const ownPins = await pins.find({ 'owner.id': req.user.twitter.id }).exec();
      const savedPins = await pins.find({ 'savedBy.id': req.user.twitter.id }).exec();
      res.json(filterPins([...ownPins, ...savedPins], req.user));
    } catch (error) {
      res.json(error);
    }
  } else {
    try {
      const allPins = await pins.find({}).exec();
      res.json(filterPins(allPins, req.user));
    } catch (error) {
      res.json(error);
    }
  }
});
// deletes a pin if owned by user or removes user from savedby List
router.delete('/api/:_id', isLoggedIn, async (req, res) => {
  const query = { _id: req.params._id };
  try {
    const [ownsPin, savedBy] = await isOwner(req.params._id, req.user);
    if (ownsPin) {
      console.log('Removing Pin');
      const removedPin = await pins.remove(query);
      res.json(removedPin);
    } else {
      console.log('Removing Pinner');
      const indexOfDeletion = savedBy.findIndex(s => s.id === req.user.twitter.id);
      const pinToUpdate = [...savedBy.slice(0, indexOfDeletion),
        ...savedBy.slice(indexOfDeletion + 1)];
      const update = { $set: { savedBy: pinToUpdate } };
      const modified = { new: true };
      const updatedPin = await pins.findByIdAndUpdate(req.params._id, update, modified).exec();
      res.json(updatedPin);
    }
  } catch (error) {
    res.json(error);
  }
});

// Adds a user to a pin's savedby list
router.put('/api/:_id', isLoggedIn, async (req, res) => {
  const newPinner = req.body;
  const pinID = req.params._id;
  try {
    const [savedPin, savedBy] = await hasSavedPin(pinID, req.user);
    if (!savedPin) {
      const pinToUpdate = [...savedBy, newPinner];
      const update = { $set: { savedBy: pinToUpdate } };
      const modified = { new: true };
      const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
      res.json(updatedPin);
    } else {
      console.log('This user has the pin already saved');
      res.end();
    }
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
