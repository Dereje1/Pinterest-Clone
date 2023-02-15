import { Request } from 'express';
import mongoose from 'mongoose';
import debugg from 'debug';
import { genericResponseType } from '../interfaces';
import {
  getUserProfile, filterPins,
} from '../utils';
import pins from '../models/pins';
import users, { UserType } from '../models/user';
import savedTags from '../models/tags';

const debug = debugg('Pinterest-Clone:server');

export const pinImage = async (req: Request, res: genericResponseType) => {
  const pinID = req.params._id;
  const {
    userId, displayName, isAdmin,
  } = getUserProfile(req.user as UserType);
  debug(`Pinning image with id -> ${pinID} by userId -> ${userId}`);
  try {
    const pin = await pins.findById(pinID).exec();
    if (!pin) return res.end();
    const alreadyPinned = pin.savedBy.some((p) => p.toString() === userId);
    if (!alreadyPinned) {
      const update = { $set: { savedBy: [...pin.savedBy, mongoose.Types.ObjectId(userId)] } };
      const modified = { new: true };
      // note: can use `updateOne` on retrieved pin but need an updated doc returned
      const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified)
        .populate(['owner', 'savedBy', 'comments.user'])
        .exec();
      if (!updatedPin) return res.end();
      const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
      debug(`${displayName} pinned ${updatedPin.imgDescription}`);
      return res.json(filteredAndUpdatedPin);
    }
    debug(`${displayName} has the pin - ${pin.imgDescription} already saved`);
    return res.end();
  } catch (error) {
    debug(`Error pinning image with id -> ${pinID} by userId -> ${userId}`);
    return res.json(error);
  }
};

export const unpin = async (req: Request, res: genericResponseType) => {
  const { userId, displayName, isAdmin } = getUserProfile(req.user as UserType);
  const pinID = req.params._id;
  debug(`Unpinning image with id -> ${pinID} by userId -> ${userId}`);
  try {
    const pin = await pins.findById(pinID).exec();
    if (!pin) return res.end();
    const pinToUpdate = pin.savedBy.filter((s) => s.toString() !== userId);
    const update = { $set: { savedBy: pinToUpdate } };
    const modified = { new: true };
    const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified)
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    if (!updatedPin) return res.end();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    debug(`${displayName} unpinned ${updatedPin.imgDescription}`);
    return res.json(filteredAndUpdatedPin);
  } catch (error) {
    debug(`Error unpinning image with id -> ${pinID} by userId -> ${userId}`);
    return res.json(error);
  }
};

export const addComment = async (req: Request, res: genericResponseType) => {
  const {
    userId, displayName, isAdmin,
  } = getUserProfile(req.user as UserType);
  const pinID = req.params._id;
  const { comment } = req.body;
  debug(`Adding comment for pin with id -> ${pinID} by userId -> ${userId}`);
  try {
    const update = { $push: { comments: { comment, user: mongoose.Types.ObjectId(userId) } } };
    const modified = { new: true };
    const updatedPin = await pins.findByIdAndUpdate(pinID, update, modified)
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    if (!updatedPin) return res.end();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    debug(`${displayName} commented on ${updatedPin.imgDescription}`);
    return res.json(filteredAndUpdatedPin);
  } catch (error) {
    debug(`Error adding comment for pin with id -> ${pinID} by userId -> ${userId}`);
    return res.json(error);
  }
};

export const updateTags = async (req: Request, res: genericResponseType) => {
  const {
    userId, displayName, isAdmin,
  } = getUserProfile(req.user as UserType);
  const { pinID, tag, deleteId } = req.query;
  debug(`Updating tags for pin with id -> ${pinID} by userId -> ${userId}`);
  try {
    const pin = await pins.findById(pinID).exec();
    if (!pin) return res.end();
    if (pin.owner.toString() !== userId && !isAdmin) return res.end();
    let update;
    if (deleteId) {
      const pinToUpdate = pin.tags.filter((t) => t._id.toString() !== deleteId);
      update = { $set: { tags: pinToUpdate } };
    } else {
      update = { $push: { tags: { tag } } };
      await savedTags.create({ tag });
    }
    const updatedPin = await pins.findByIdAndUpdate(pinID, update, { new: true })
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    if (!updatedPin) return res.end();
    const [filteredAndUpdatedPin] = filterPins({ rawPins: [updatedPin], userId, isAdmin });
    debug(`${displayName} ${deleteId ? 'deleted' : `added ${tag}`} tag on ${updatedPin.imgDescription}`);
    return res.json(filteredAndUpdatedPin);
  } catch (error) {
    debug(`Error updating tags for pin with id -> ${pinID} by userId -> ${userId}`);
    return res.json(error);
  }
};

export const updateDisplayName = async (req: Request, res: genericResponseType) => {
  const {
    userId, displayName,
  } = getUserProfile(req.user as UserType);
  const { newDisplayName } = req.body;
  debug(`Updating Display name for userId -> ${userId}`);
  try {
    const user = await users.findById(userId).exec();
    const update = { $set: { displayName: newDisplayName } };
    await user?.updateOne(update);
    debug(`${displayName} changed to ${newDisplayName}`);
    return res.end();
  } catch (error) {
    debug(`Error updating Display name for userId -> ${userId}`);
    return res.json(error);
  }
};
