/* eslint-disable import/no-import-module-exports */
import { Router, Request } from 'express';
import { PinnerType, genericResponseType } from './interfaces';
import { getUserProfile, filterPins, uploadImageToS3 } from './utils';
import isLoggedIn from './auth/isloggedin';
import pins from './models/pins';
import users, { UserType } from './models/user';
import pinLinks from './models/pinlinks';
import savedTags from './models/tags';

export const addPin = async (req: Request, res: genericResponseType) => {
  const { displayName, userId, service } = getUserProfile(req.user as UserType);
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
    // store links information
    await pinLinks.create({
      pin_id: addedpin._id.toString(),
      imgLink: addedpin.imgLink,
      originalImgLink: addedpin.originalImgLink,
      cloudFrontLink: newImgLink ? `https://d1ttxrulihk8wq.cloudfront.net/${newImgLink.split('/')[4]}` : '',
    });
    console.log(`${displayName} added pin ${addedpin.imgDescription}`);
    res.json(addedpin);
  } catch (error) {
    res.json(error);
  }
};

export const getPins = async (req: Request, res: genericResponseType) => {
  const { userId, isAdmin } = getUserProfile(req.user as UserType);
  try {
    const allPins = await pins.find({ isBroken: false }).exec();
    res.json(filterPins({ rawPins: allPins, userId, isAdmin }));
  } catch (error) {
    res.json(error);
  }
};

export const getUserPins = async (req: Request, res: genericResponseType) => {
  const { userId, isAdmin } = getUserProfile(req.user as UserType);
  try {
    const allPinLinks = await pinLinks.find({}).exec();
    if (isAdmin) {
      const allPins = await pins.find({ isBroken: false }).exec();
      res.json({ profilePins: filterPins({ rawPins: allPins, userId, isAdmin }), allPinLinks });
      return;
    }
    const profilePins = await pins.find({ $or: [{ 'owner.id': userId }, { 'savedBy.id': userId }] }).exec();
    res.json({ profilePins: filterPins({ rawPins: profilePins, userId, isAdmin }), allPinLinks });
  } catch (error) {
    res.json(error);
  }
};

export const getProfilePins = async (
  req: Request,
  res: genericResponseType,
) => {
  const params = req.params.userid;
  const { userId: loggedInUserid } = getUserProfile(req.user as UserType);
  // displayNames can contain '-', therefore rejoin if accidentally split
  const [userId, service, ...remainder] = params.split('-');
  let displayName: string | null = remainder.join('-');
  displayName = displayName === 'null' ? null : displayName;
  try {
    const [user] = await users.find({
      $and: [{ userId }, { displayName }, { service }],
    }).exec();

    if (!user) {
      return res.json({ redirect: '/' });
    }
    if (loggedInUserid === userId) {
      return res.json({ redirect: '/pins' });
    }
    const createdPins = await pins.find({ 'owner.id': userId }).exec();
    const savedPins = await pins.find({ 'savedBy.id': userId }).exec();
    return res.json({
      createdPins: filterPins({ rawPins: createdPins, userId: loggedInUserid, isAdmin: false }),
      savedPins: filterPins({ rawPins: savedPins, userId: loggedInUserid, isAdmin: false }),
      user: {
        userId: user.userId,
        service,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    return res.json(error);
  }
};

export const getTags = async (req: Request, res: genericResponseType) => {
  try {
    const tags = await savedTags.find().distinct('tag').exec();
    res.json(tags);
  } catch (error) {
    res.json(error);
  }
};

export const pinImage = async (req: Request, res: genericResponseType) => {
  const pinID = req.params._id;
  const {
    userId, displayName, service, isAdmin,
  } = getUserProfile(req.user as UserType);

  try {
    const pin = await pins.findById(pinID).exec();
    if (!pin) return res.end();
    const alreadyPinned = pin.savedBy.some((p: PinnerType) => p.id === userId);
    if (!alreadyPinned) {
      const newPinnerInfo = {
        name: displayName,
        service,
        id: userId,
      };
      const update = { $set: { savedBy: [...pin.savedBy, newPinnerInfo] } };
      const modified = { new: true };
      // note: can use `updateOne` on retrieved pin but need an updated doc returned
      const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
      if (!updatedPin) return res.end();
      const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
      console.log(`${displayName} pinned ${updatedPin.imgDescription}`);
      return res.json(filteredAndUpdatedPin);
    }
    console.log(`${displayName} has the pin - ${pin.imgDescription} already saved`);
    return res.end();
  } catch (error) {
    return res.json(error);
  }
};

export const unpin = async (req: Request, res: genericResponseType) => {
  const { userId, displayName, isAdmin } = getUserProfile(req.user as UserType);
  const pinID = req.params._id;
  try {
    const pin = await pins.findById(pinID).exec();
    if (!pin) return res.end();
    const pinToUpdate = pin.savedBy.filter((s: PinnerType) => s.id !== userId);
    const update = { $set: { savedBy: pinToUpdate } };
    const modified = { new: true };
    const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified).exec();
    if (!updatedPin) return res.end();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    console.log(`${displayName} unpinned ${updatedPin.imgDescription}`);
    return res.json(filteredAndUpdatedPin);
  } catch (error) {
    return res.json(error);
  }
};

export const addComment = async (req: Request, res: genericResponseType) => {
  const {
    userId, displayName, service, isAdmin,
  } = getUserProfile(req.user as UserType);
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
    if (!updatedPin) return res.end();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    console.log(`${displayName} commented on ${updatedPin.imgDescription}`);
    return res.json(filteredAndUpdatedPin);
  } catch (error) {
    return res.json(error);
  }
};

export const updateTags = async (req: Request, res: genericResponseType) => {
  const {
    userId, displayName, isAdmin,
  } = getUserProfile(req.user as UserType);
  const { pinID, tag, deleteId } = req.query;
  try {
    const pin = await pins.findById(pinID).exec();
    if (!pin) return res.end();
    if (pin.owner.id !== userId && !isAdmin) return res.end();

    let update;
    if (deleteId) {
      const pinToUpdate = pin.tags.filter((t) => t._id.toString() !== deleteId);
      update = { $set: { tags: pinToUpdate } };
    } else {
      update = { $push: { tags: { tag } } };
      await savedTags.create({ tag });
    }
    const updatedPin = await pins.findByIdAndUpdate(pinID, update, { new: true }).exec();
    if (!updatedPin) return res.end();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    console.log(`${displayName} ${deleteId ? 'deleted' : `added ${tag}`} tag on ${updatedPin.imgDescription}`);
    return res.json(filteredAndUpdatedPin);
  } catch (error) {
    return res.json(error);
  }
};

export const deletePin = async (req: Request, res: genericResponseType) => {
  const { userId, displayName, isAdmin } = getUserProfile(req.user as UserType);
  const query = { _id: req.params._id };
  const pinID = req.params._id;
  try {
    const pin = await pins.findById(pinID).exec();
    if (!pin) return res.end();
    if (userId === pin.owner.id || isAdmin) {
      const removedPin = await pins.findOneAndRemove(query).exec();
      await pinLinks.findOneAndRemove({ pin_id: pinID }).exec();
      console.log(`${displayName} deleted pin ${removedPin && removedPin.imgDescription}`);
      return res.json(removedPin);
    }
    throw new Error(`Pin ID: ${pinID} is not owned by user ID: ${userId} - delete operation cancelled!`);
  } catch (error) {
    return res.json(error);
  }
};
export const router = Router();
// adds a new pin to the db
router.post('/api/newpin', isLoggedIn, addPin);

// gets all pins for home page
router.get('/api/home', getPins);

// gets pins for mypins page
router.get('/api/mypins', isLoggedIn, getUserPins);

// gets pins for a single user
router.get('/api/userProfile/:userid', isLoggedIn, getProfilePins);

// gets all used tags
router.get('/api/getTags', isLoggedIn, getTags);

// Adds a user to a pin's savedby list
router.put('/api/pin/:_id', isLoggedIn, pinImage);

// Removes user from a pin's savedby list
router.put('/api/unpin/:_id', isLoggedIn, unpin);

// Adds a comment to a pin
router.put('/api/comment/:_id', isLoggedIn, addComment);

// Adds/removes a tag from a pin
router.put('/api/updateTags/', isLoggedIn, updateTags);

// deletes a pin if owned by user
router.delete('/api/:_id', isLoggedIn, deletePin);
