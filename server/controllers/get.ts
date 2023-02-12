import { Request } from 'express';
import mongoose from 'mongoose';
import { genericResponseType } from '../interfaces';
import {
  getUserProfile, filterPins,
} from '../utils';
import pins from '../models/pins';
import users, { UserType } from '../models/user';
import savedTags from '../models/tags';

export const getPins = async (req: Request, res: genericResponseType) => {
  const { userId, isAdmin } = getUserProfile(req.user as UserType);
  try {
    const allPins = await pins.find({ isBroken: false })
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    res.json(filterPins({ rawPins: allPins, userId, isAdmin }));
  } catch (error) {
    res.json(error);
  }
};

export const getUserPins = async (req: Request, res: genericResponseType) => {
  const { userId, isAdmin } = getUserProfile(req.user as UserType);
  const mongooseUserId = mongoose.Types.ObjectId(userId);
  try {
    if (isAdmin) {
      const allPins = await pins.find({ isBroken: false }).populate(['owner', 'savedBy', 'comments.user']).exec();
      return res.json({ profilePins: filterPins({ rawPins: allPins, userId, isAdmin }) });
    }
    const profilePins = await pins.find({
      $or: [{ owner: mongooseUserId }, { savedBy: mongooseUserId }],
    })
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    return res.json({ profilePins: filterPins({ rawPins: profilePins, userId, isAdmin }) });
  } catch (error) {
    return res.json(error);
  }
};

export const getProfilePins = async (
  req: Request,
  res: genericResponseType,
) => {
  const userId = req.params.userid;
  const mongooseUserId = mongoose.Types.ObjectId(userId);
  const { userId: loggedInUserid } = getUserProfile(req.user as UserType);
  try {
    const user = await users.findById(userId).exec();
    if (!user) {
      return res.json({ redirect: '/' });
    }
    if (loggedInUserid === userId) {
      return res.json({ redirect: '/pins' });
    }
    const createdPins = await pins.find({ owner: mongooseUserId })
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    const savedPins = await pins.find({ savedBy: mongooseUserId })
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    return res.json({
      createdPins: filterPins({ rawPins: createdPins, userId: loggedInUserid, isAdmin: false }),
      savedPins: filterPins({ rawPins: savedPins, userId: loggedInUserid, isAdmin: false }),
      user: {
        service: user.service,
        displayName: user.displayName || '🚫',
      },
    });
  } catch (error) {
    // mongoose errors out on invalid ObjectIds sent -> redirect also in that case
    return res.json({ redirect: '/' });
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
