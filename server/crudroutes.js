const router = require('express').Router();

const pins = require('./models/pins'); // schema for pins
const brokenPins = require('./models/brokenPins'); // schema for pins
const backupPins = require('./models/backupPins'); // schema for pins
const isLoggedIn = require('./Authentication_Config/isloggedin');
const { getUserProfile, filterPins, getExpiredBrokenImages } = require('./utils');

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

// broken image handling and garbage collection
router.post('/api/broken', async (req, res) => {
  const ts = new Date()
  const currentlyBroken = req.body.map(brokenPin => ({ ...brokenPin, brokenSince: ts.toISOString() }))
  try {
    const previouslyBroken = await brokenPins.find({}).exec();

    const brokenUpdate = previouslyBroken.reduce((updatedList, storedBroken) => {
      const currentIndex = currentlyBroken.findIndex(currBroken => storedBroken.pinId === currBroken.pinId)
      // broken image exists - keep
      if (currentIndex > -1) {
        const { pinId, brokenSince, imgDescription } = storedBroken
        return [...updatedList, { pinId, brokenSince, imgDescription }]
      }
      // broken image has become active/fixed - drop
      return [...updatedList]
    }, [])

    // get newly broken pins
    const previouslyBrokenIds = previouslyBroken.map(p => p.pinId);
    const newlyBroken = currentlyBroken.filter(c => !previouslyBrokenIds.includes(c.pinId))

    // clear out and resync broken pins
    await brokenPins.deleteMany({}).exec();
    await brokenPins.insertMany([...newlyBroken, ...brokenUpdate]);

    // run garabage collection 
    const expiredImageIds = getExpiredBrokenImages(brokenUpdate);
    if (expiredImageIds.length) {
      // backup broken pins and delete
      const expiredPins = await pins.find({ _id: { $in: expiredImageIds } }).exec();
      await backupPins.create({ backup: expiredPins });
      await pins.deleteMany({ _id: { $in: expiredImageIds } }).exec();
      console.log(`Deleted Broken Pins, with IDs: ${expiredImageIds.join(',')}`)
    }

    res.end();
  } catch (error) {
    console.log(error)
    res.json(error);
  }

});

module.exports = router;
