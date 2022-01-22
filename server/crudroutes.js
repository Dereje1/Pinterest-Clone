const router = require('express').Router();

const pins = require('./models/pins'); // schema for pins
const brokenPins = require('./models/brokenPins');
const isLoggedIn = require('./Authentication_Config/isloggedin');
const { getUserProfile, filterPins, isReadyToRun, isValidEnpoint, getPrevBrokenTimeStamp } = require('./utils');

const addPin = async (req, res) => {
  const { displayName } = getUserProfile(req.user);
  try {
    const addedpin = await pins.create({ ...req.body, isBroken: false });
    console.log(`${displayName} added pin ${addedpin.imgDescription}`);
    res.json(addedpin);
  } catch (error) {
    res.json(error);
  }
}

const getPins = async (req, res) => {
  const { userId } = getUserProfile(req.user);
  try {
    if (req.query.type === 'profile') {
      const profilePins = await pins.find({ $or: [{ 'owner.id': userId }, { 'savedBy.id': userId }] }).exec();
      res.json(filterPins(profilePins, req.user));
    } else {
      const allPins = await pins.find({ isBroken: false }).exec();
      res.json(filterPins(allPins, req.user));
    }
  } catch (error) {
    res.json(error);
  }
}

const pinImage = async (req, res) => {
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
}

const removePin = async (req, res) => {
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
}

const runScan = async () => {
  try {
      const [backup] = await brokenPins.find({}).exec();
      if (backup && !isReadyToRun(backup.createdAt)) {
          return null
      }
      console.log(`Started scan : ${new Date().toISOString()}...`)
      const allPins = await pins.find({}).exec();
      const allInvalid = []
      const allValid = []
      for (const pin of allPins) {
          const { _id, imgLink, imgDescription } = pin;
          const { statusCode, statusMessage, valid } = await isValidEnpoint(imgLink)
          if (valid) {
              allValid.push({ statusCode, statusMessage, _id, imgLink, imgDescription })
          } else {
              allInvalid.push({ statusCode, statusMessage, _id, imgLink, imgDescription })
          }
      }
      await pins.updateMany({ _id: { $in: allValid } }, { isBroken: false }).exec();
      await pins.updateMany({ _id: { $in: allInvalid } }, { isBroken: true }).exec();
      if (allInvalid.length) {
          const currentTimeStamp = new Date().toISOString();
          const updatedInvalid = allInvalid.map(pin => {
              const prevBrokenTimeStamp = backup ? getPrevBrokenTimeStamp(backup, pin._id) : null
              return {
                  ...pin,
                  brokenSince: prevBrokenTimeStamp || currentTimeStamp
              }
          })
          await brokenPins.deleteMany({}).exec();
          await brokenPins.create({ broken: updatedInvalid });
      }
      console.log(`Finished scan : ${new Date().toISOString()}`)
  } catch (error) {
      console.info(error)
  }
}
// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, addPin);

// gets pins: all or just user's saved and owned pins,
router.get('/api/', getPins);

// Adds a user to a pin's savedby list
router.put('/api/:_id', isLoggedIn, pinImage);

// deletes a pin if owned by user or removes user from savedby List
router.delete('/api/:_id', isLoggedIn, removePin);

// broken image handling and garbage collection
router.get('/api/broken', runScan);

module.exports = { router, addPin, getPins, pinImage, removePin, runScan };
