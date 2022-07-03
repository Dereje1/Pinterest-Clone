const router = require('express').Router();
const pins = require('./models/pins'); // schema for pins
const isLoggedIn = require('./auth/isloggedin');
const {
  getUserProfile, filterPins, uploadImageToS3,
} = require('./utils');

const addPin = async (req, res) => {
  const { displayName, userId, service } = getUserProfile(req.user);
  const { imgLink: originalImgLink } = req.body;
  try {
    const newImgLink = await uploadImageToS3({
      originalImgLink, userId, displayName, service,
    });
    const updatedPinInfo = {
      ...req.body,
      imgLink: newImgLink || originalImgLink,
      originalImgLink,
    };
    const addedpin = await pins.create({ ...updatedPinInfo, isBroken: false });
    console.log(`${displayName} added pin ${addedpin.imgDescription}`);
    res.json(addedpin);
  } catch (error) {
    res.json(error);
  }
};

const getPins = async (req, res) => {
  const { userId, isAdmin } = getUserProfile(req.user);
  try {
    const allPins = await pins.find({ isBroken: false }).exec();
    let allPinLinks = [];
    allPins.forEach(({ imgLink, originalImgLink }) => {
      allPinLinks = [...allPinLinks, { imgLink, originalImgLink }];
    });
    if (req.query.type === 'profile') {
      if (isAdmin) {
        res.json({ profilePins: filterPins(allPins, req.user), allPinLinks });
        return;
      }
      const profilePins = await pins.find({ $or: [{ 'owner.id': userId }, { 'savedBy.id': userId }] }).exec();
      res.json({ profilePins: filterPins(profilePins, req.user), allPinLinks });
    } else {
      res.json(filterPins(allPins, req.user));
    }
  } catch (error) {
    res.json(error);
  }
};

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
};

const removePin = async (req, res) => {
  const { userId, displayName, isAdmin } = getUserProfile(req.user);
  const query = { _id: req.params._id };
  const pinID = req.params._id;
  try {
    const pin = await pins.findById(pinID).exec();
    if (userId === pin.owner.id || isAdmin) {
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
};

// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, addPin);

// gets pins: all or just user's saved and owned pins,
router.get('/api/', getPins);

// Adds a user to a pin's savedby list
router.put('/api/:_id', isLoggedIn, pinImage);

// deletes a pin if owned by user or removes user from savedby List
router.delete('/api/:_id', isLoggedIn, removePin);

module.exports = {
  router, addPin, getPins, pinImage, removePin,
};
