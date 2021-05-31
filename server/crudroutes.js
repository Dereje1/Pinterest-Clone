const router = require('express').Router();

const pins = require('./models/pins'); // schema for pins
const isLoggedIn = require('./Authentication_Config/isloggedin');

/* CRUD utilities */
/* Isolate auth service used from req.user */
const getUserProfile = (user) => {
  const [service] = ['google', 'twitter'].filter(s => user && Boolean(user[s].id));
  return {
    userId: service && user[service].id,
    displayName: service && user[service].displayName,
    service,
  };
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
  const { userId } = getUserProfile(user);
  const savedIds = savedBy.map(s => s.id);
  const { name } = owner;
  const modifiedSavedBy = savedBy.map(pinner => pinner.name);
  return {
    _id,
    imgDescription,
    imgLink,
    owner: name,
    savedBy: modifiedSavedBy,
    owns: userId ? userId === owner.id : null,
    hasSaved: userId ? savedIds.includes(userId) : null,
  };
});

/* Crud Routes */
// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, async (req, res) => {
  const { displayName } = getUserProfile(req.user);
  try {
    const addedpin = await pins.create(req.body);
    console.log(`${displayName} added pin ${addedpin.imgDescription}`);
    res.json(addedpin);
  } catch (error) {
    res.json(error);
  }
});
// gets pins: all or just user's saved and owned pins,
router.get('/api/', async (req, res) => {
  const { userId } = getUserProfile(req.user);
  try {
    if (req.query.type === 'profile') {
      const ownPins = await pins.find({ 'owner.id': userId }).exec();
      const savedPins = await pins.find({ 'savedBy.id': userId }).exec();
      res.json(filterPins([...ownPins, ...savedPins], req.user));
    } else {
      const allPins = await pins.find({}).exec();
      res.json(filterPins(allPins, req.user));
    }
  } catch (error) {
    res.json(error);
  }
});
// deletes a pin if owned by user or removes user from savedby List
router.delete('/api/:_id', isLoggedIn, async (req, res) => {
  const { userId, displayName } = getUserProfile(req.user);
  const query = { _id: req.params._id };
  const pinID = req.params._id;
  try {
    const pin = await pins.findById(pinID).exec();
    if (userId === pin.owner.id) {
      const removedPin = await pins.findOneAndRemove(query).exec();
      console.log(`${displayName} deleted pin ${removedPin.imgDescription}`);
      res.json(removedPin);
    } else {
      const indexOfDeletion = pin.savedBy.findIndex(s => s.id === userId);
      const pinToUpdate = [...pin.savedBy.slice(0, indexOfDeletion),
        ...pin.savedBy.slice(indexOfDeletion + 1)];
      const update = { $set: { savedBy: pinToUpdate } };
      const modified = { new: true };
      const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
      console.log(`${displayName} unpinned ${updatedPin.imgDescription}`);
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
  const { userId, displayName } = getUserProfile(req.user);
  try {
    const pin = await pins.findById(pinID).exec();
    const indexOfNewPinner = pin.savedBy.findIndex(p => userId === p.id);
    if (indexOfNewPinner < 0) {
      const pinToUpdate = [...pin.savedBy, newPinner];
      const update = { $set: { savedBy: pinToUpdate } };
      const modified = { new: true };
      const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
      console.log(`${displayName} pinned ${updatedPin.imgDescription}`);
      res.json(updatedPin);
    } else {
      console.log(`${displayName} has the pin - ${pin.imgDescription} already saved`);
      res.end();
    }
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
