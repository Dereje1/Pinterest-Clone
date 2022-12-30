const router = require('express').Router();
const pins = require('./models/pins'); // schema for pins
const users = require('./models/user');
const isLoggedIn = require('./auth/isloggedin');
const {
  getUserProfile, filterPins, uploadImageToS3, getCloudFrontLink,
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
      owner: {
        name: displayName,
        service,
        id: userId,
      },
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
    if (req.query.type === 'profile') {
      let allPinLinks = [];
      allPins.forEach(({ imgLink, originalImgLink }) => {
        allPinLinks = [
          ...allPinLinks,
          {
            imgLink,
            originalImgLink,
            cloudFrontLink: getCloudFrontLink(imgLink),
          },
        ];
      });
      if (isAdmin) {
        res.json({ profilePins: filterPins({ rawPins: allPins, userId, isAdmin }), allPinLinks });
        return;
      }
      const profilePins = await pins.find({ $or: [{ 'owner.id': userId }, { 'savedBy.id': userId }] }).exec();
      res.json({ profilePins: filterPins({ rawPins: profilePins, userId, isAdmin }), allPinLinks });
    } else {
      res.json(filterPins({ rawPins: allPins, userId, isAdmin }));
    }
  } catch (error) {
    res.json(error);
  }
};

const pinImage = async (req, res) => {
  const pinID = req.params._id;
  const {
    userId, displayName, service, isAdmin,
  } = getUserProfile(req.user);

  try {
    const pin = await pins.findById(pinID).exec();
    const alreadyPinned = pin.savedBy.some(p => p.id === userId);
    if (!alreadyPinned) {
      const newPinnerInfo = {
        name: displayName,
        service,
        id: userId,
      };
      const update = { $set: { savedBy: [...pin.savedBy, newPinnerInfo] } };
      const modified = { new: true };
      const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
      const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
      console.log(`${displayName} pinned ${updatedPin.imgDescription}`);
      res.json(filteredAndUpdatedPin);
    } else {
      console.log(`${displayName} has the pin - ${pin.imgDescription} already saved`);
      res.end();
    }
  } catch (error) {
    res.json(error);
  }
};

const unpin = async (req, res) => {
  const { userId, displayName, isAdmin } = getUserProfile(req.user);
  const pinID = req.params._id;
  try {
    const pin = await pins.findById(pinID).exec();
    const pinToUpdate = pin.savedBy.filter(s => s.id !== userId);
    const update = { $set: { savedBy: pinToUpdate } };
    const modified = { new: true };
    const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    console.log(`${displayName} unpinned ${updatedPin.imgDescription}`);
    res.json(filteredAndUpdatedPin);
  } catch (error) {
    res.json(error);
  }
};

const addComment = async (req, res) => {
  const {
    userId, displayName, service, isAdmin,
  } = getUserProfile(req.user);
  const pinID = req.params._id;
  const { comment } = req.body;
  try {
    const commentPayload = {
      userId,
      displayName,
      service,
      comment,
    };
    const update = { $push: { comments: { ...commentPayload } } };
    const modified = { new: true };
    const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    console.log(`${displayName} commented on ${updatedPin.imgDescription}`);
    res.json(filteredAndUpdatedPin);
  } catch (error) {
    res.json(error);
  }
};

const getProfilePins = async (req, res) => {
  const params = req.params.userid;
  const [userId, service, displayName] = params.split('-');
  const { userId: loggedInUserid } = getUserProfile(req.user);

  try {
    const [user] = await users.find({
      $and: [{ [`${service}.id`]: userId }, { [`${service}.displayName`]: displayName }],
    }).exec();

    if (!user) {
      res.json({ redirect: '/' });
      return;
    }
    if (loggedInUserid === userId) {
      res.json({ redirect: '/pins' });
      return;
    }
    const createdPins = await pins.find({ 'owner.id': userId }).exec();
    const savedPins = await pins.find({ 'savedBy.id': userId }).exec();
    res.json({
      createdPins: filterPins({ rawPins: createdPins, userId: loggedInUserid, isAdmin: false }),
      savedPins: filterPins({ rawPins: savedPins, userId: loggedInUserid, isAdmin: false }),
      user: { userId: user[service].id, service, displayName: user[service].displayName },
    });
  } catch (error) {
    res.json(error);
  }
};

const deletePin = async (req, res) => {
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
      throw new Error(`Pin ID: ${pinID} is not owned by user ID: ${userId} - delete operation cancelled!`);
    }
  } catch (error) {
    res.json(error);
  }
};

// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, addPin);

// gets pins: all or just logged in user's saved and owned pins,
router.get('/api/', getPins);

// gets pins for a single user
router.get('/api/userProfile/:userid', isLoggedIn, getProfilePins);

// Adds a user to a pin's savedby list
router.put('/api/pin/:_id', isLoggedIn, pinImage);

// Removes user from a pin's savedby list
router.put('/api/unpin/:_id', isLoggedIn, unpin);

// Adds a comment to a pin
router.put('/api/comment/:_id', isLoggedIn, addComment);

// deletes a pin if owned by user
router.delete('/api/:_id', isLoggedIn, deletePin);

module.exports = {
  router, addPin, getPins, pinImage, unpin, deletePin, addComment, getProfilePins,
};
