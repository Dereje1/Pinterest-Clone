const router = require('express').Router();

const pins = require('./models/pins'); // schema for pins
const isLoggedIn = require('./Authentication_Config/isloggedin');

/* CRUD utilities */
/* Isolate auth service used from req.user */
const getAuthService = (user) => {
  if (!user) return null;
  let service = Object.keys(user._doc).filter(s => s !== '__v' && s !== '_id');
  [service] = service.filter(s => Object.keys(user._doc[s]).length);
  return service;
};
/* filterPins return only required pin info to the client */
/*
returns
{
    _id, // send full
    imgDescription, // send full
    imgLink, // send full
    owner: name, // send only display name
    savedBy: modifiedSavedBy, // send only display names of pinners
    owns: // need for displaying action button on pin
    hasSaved: // need for displaying action button on pin
};
*/
const filterPins = (rawPins, user) => rawPins.map((pin) => {
  const {
    _id, imgDescription, imgLink, owner, savedBy,
  } = pin;
  const authService = getAuthService(user);
  const savedIds = savedBy.map(s => s.id);
  const { name } = owner;
  const modifiedSavedBy = savedBy.map(pinner => pinner.name);
  return {
    _id,
    imgDescription,
    imgLink,
    owner: name,
    savedBy: modifiedSavedBy,
    owns: user ? user[authService].id === owner.id : null,
    hasSaved: user ? savedIds.includes(user[authService].id) : null,
  };
});
/* Checks if A pin has already been saved by the user
   If it hasn't return the savedBy Array for the pin
*/
const hasSavedPin = async (pinID, userInfo) => {
  const authService = getAuthService(userInfo);
  try {
    const pin = await pins.findById(pinID).exec();
    const savedIds = pin.savedBy.map(s => s.id);
    return savedIds.includes(userInfo[authService].id) ? [true, null] : [false, [...pin.savedBy]];
  } catch (error) {
    throw error;
  }
};
/* Checks if A pin is owned by the user
   If it is not returns the savedBy Array for the pin
*/
const isOwner = async (pinID, userInfo) => {
  const authService = getAuthService(userInfo);
  try {
    const pin = await pins.findById(pinID).exec();
    return userInfo[authService].id === pin.owner.id ? [true, null] : [false, [...pin.savedBy]];
  } catch (error) {
    throw error;
  }
};

/* Crud Routes */
// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, async (req, res) => {
  const authService = getAuthService(req.user);
  try {
    const addedpin = await pins.create(req.body);
    console.log(`${req.user[authService].displayName} added pin ${addedpin.imgDescription}`);
    res.json(addedpin);
  } catch (error) {
    res.json(error);
  }
});
// gets pins: all or just user's saved and owned pins,
router.get('/api/', async (req, res) => {
  const authService = getAuthService(req.user);
  if (req.query.type === 'profile') {
    try {
      const ownPins = await pins.find({ 'owner.id': req.user[authService].id }).exec();
      const savedPins = await pins.find({ 'savedBy.id': req.user[authService].id }).exec();
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
  const authService = getAuthService(req.user);
  const query = { _id: req.params._id };
  try {
    const [ownsPin, savedBy] = await isOwner(req.params._id, req.user);
    if (ownsPin) {
      const removedPin = await pins.findOneAndRemove(query).exec();
      console.log(`${req.user[authService].displayName} deleted pin ${removedPin.imgDescription}`);
      res.json(removedPin);
    } else {
      const indexOfDeletion = savedBy.findIndex(s => s.id === req.user[authService].id);
      const pinToUpdate = [...savedBy.slice(0, indexOfDeletion),
        ...savedBy.slice(indexOfDeletion + 1)];
      const update = { $set: { savedBy: pinToUpdate } };
      const modified = { new: true };
      const updatedPin = await pins.findByIdAndUpdate(req.params._id, update, modified).exec();
      console.log(`${req.user[authService].displayName} unpinned ${updatedPin.imgDescription}`);
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
  const authService = getAuthService(req.user);
  try {
    const [savedPin, savedBy] = await hasSavedPin(pinID, req.user);
    if (!savedPin) {
      const pinToUpdate = [...savedBy, newPinner];
      const update = { $set: { savedBy: pinToUpdate } };
      const modified = { new: true };
      const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
      console.log(`${req.user[authService].displayName} pinned ${updatedPin.imgDescription}`);
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
