/* eslint-disable import/no-import-module-exports */
import { Router, Request } from 'express';
import { reqUser, PinnerType, genericResponseType } from './interfaces';
import { getUserProfile, filterPins, uploadImageToS3 } from './utils';
import isLoggedIn from './auth/isloggedin';
import pins from './models/pins';
import users from './models/user';
import pinLinks from './models/pinlinks';
import savedTags from './models/tags';

interface addPinReq extends Request {
  body:{
    imgLink: string
    description: string
  }
  user: typeof users
}

export const addPin = async (req: addPinReq, res: genericResponseType) => {
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

interface getPinsReq {
  user: reqUser
}
export const getPins = async (req: getPinsReq, res: genericResponseType) => {
  const { userId, isAdmin } = getUserProfile(req.user);
  try {
    const allPins = await pins.find({ isBroken: false }).exec();
    res.json(filterPins({ rawPins: allPins, userId, isAdmin }));
  } catch (error) {
    res.json(error);
  }
};

interface getUserPinsReq {
  user: reqUser
}
export const getUserPins = async (req: getUserPinsReq, res: genericResponseType) => {
  const { userId, isAdmin } = getUserProfile(req.user);
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

interface getProfilePinsReq {
  params: { userid: string }
  user: reqUser
}
export const getProfilePins = async (req: getProfilePinsReq, res: genericResponseType) => {
  const params = req.params.userid;
  const { userId: loggedInUserid } = getUserProfile(req.user);
  // displayNames can contain '-', therefore rejoin if accidentally split
  const [userId, service, ...remainder] = params.split('-');
  const displayName = remainder.join('-');
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

interface getTagsReq {
  user: reqUser
}
export const getTags = async (req: getTagsReq, res: genericResponseType) => {
  try {
    const tags = await savedTags.find().distinct('tag').exec();
    res.json(tags);
  } catch (error) {
    res.json(error);
  }
};

interface pinImageReq {
  params: { _id: string }
  user: reqUser
}
const pinImage = async (req: pinImageReq, res: genericResponseType) => {
  const pinID = req.params._id;
  const {
    userId, displayName, service, isAdmin,
  } = getUserProfile(req.user);

  try {
    const pin = await pins.findById(pinID).exec();
    const alreadyPinned = pin.savedBy.some((p: PinnerType) => p.id === userId);
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

interface unpinImageReq {
  params: { _id: string }
  user: reqUser
}

export const unpin = async (req: unpinImageReq, res: genericResponseType) => {
  const { userId, displayName, isAdmin } = getUserProfile(req.user);
  const pinID = req.params._id;
  try {
    const pin = await pins.findById(pinID).exec();
    const pinToUpdate = pin.savedBy.filter((s: PinnerType) => s.id !== userId);
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

interface addCommentReq {
  params: { _id: string }
  body:{
    comment: string
  }
  user: reqUser
}
export const addComment = async (req: addCommentReq, res: genericResponseType) => {
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

interface updateTagsReq {
  query:{
    pinID: string
    tag: string | undefined
    deleteId: string | undefined
  }
  user: reqUser
}
export const updateTags = async (req: updateTagsReq, res: genericResponseType) => {
  const {
    userId, displayName, isAdmin,
  } = getUserProfile(req.user);
  const { pinID, tag, deleteId } = req.query;
  try {
    const pin = await pins.findById(pinID).exec();
    if (pin.owner.id !== userId && !isAdmin) {
      res.end();
      return;
    }

    let update;
    if (deleteId) {
      const pinToUpdate = pin.tags.filter((t: {_id: () => void}) => t._id.toString() !== deleteId);
      update = { $set: { tags: pinToUpdate } };
    } else {
      update = { $push: { tags: { tag } } };
      await savedTags.create({ tag });
    }
    const updatedPin = await pins.findByIdAndUpdate(pinID, update, { new: true }).exec();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    console.log(`${displayName} ${deleteId ? 'deleted' : `added ${tag}`} tag on ${updatedPin.imgDescription}`);
    res.json(filteredAndUpdatedPin);
  } catch (error) {
    res.json(error);
  }
};

interface updateTagsReq {
  params:{
    _id: string
  }
  user: reqUser
}
export const deletePin = async (req: updateTagsReq, res: genericResponseType) => {
  const { userId, displayName, isAdmin } = getUserProfile(req.user);
  const query = { _id: req.params._id };
  const pinID = req.params._id;
  try {
    const pin = await pins.findById(pinID).exec();
    if (userId === pin.owner.id || isAdmin) {
      const removedPin = await pins.findOneAndRemove(query).exec();
      await pinLinks.findOneAndRemove({ pin_id: pinID }).exec();
      console.log(`${displayName} deleted pin ${removedPin.imgDescription}`);
      res.json(removedPin);
    } else {
      throw new Error(`Pin ID: ${pinID} is not owned by user ID: ${userId} - delete operation cancelled!`);
    }
  } catch (error) {
    res.json(error);
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
