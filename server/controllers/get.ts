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
import aiGenerated from '../models/AI_generated';

const debug = debugg('Pinterest-Clone:server');

export const getPins = async (req: Request, res: genericResponseType) => {
  const { userId, isAdmin } = getUserProfile(req.user as UserType);
  debug(`Getting all pins for userId -> ${userId}`);
  try {
    const allPins = await pins.find({ isBroken: false })
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    res.json(filterPins({ rawPins: allPins, userId, isAdmin }));
  } catch (error) {
    debug(`Error getting all pins for userId -> ${userId}`);
    res.json(error);
  }
};

export const getUserPins = async (req: Request, res: genericResponseType) => {
  const { userId, isAdmin } = getUserProfile(req.user as UserType);
  const mongooseUserId = mongoose.Types.ObjectId(userId);
  debug(`Getting user pins for userId -> ${userId}`);
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

    const aiGeneratedByUser = await aiGenerated.find({ userId });

    return res.json({
      profilePins: filterPins({ rawPins: profilePins, userId, isAdmin }),
      totalAiGenratedImages: aiGeneratedByUser.length,
    });
  } catch (error) {
    debug(`Error getting user pins for userId -> ${userId}`);
    return res.json(error);
  }
};

export const getProfilePins = async (
  req: Request,
  res: genericResponseType,
) => {
  const { userId: loggedInUserid } = getUserProfile(req.user as UserType);
  const requestedProfileId = req.params.userid;
  try {
    if (!loggedInUserid) {
      debug(`Not authenticated : -> ${requestedProfileId} profile can not be retrieved, redirecting...`);
      return res.json({ redirect: '/' });
    }
    const requestedProfileObjectId = mongoose.Types.ObjectId(requestedProfileId);
    const user = await users.findById(requestedProfileObjectId).exec();
    if (!user) {
      debug(`No user found for profile search -> ${requestedProfileId} by user -> ${loggedInUserid}, redirecting...`);
      return res.json({ redirect: '/' });
    }
    if (loggedInUserid === requestedProfileId) {
      return res.json({ redirect: '/pins' });
    }
    const createdPins = await pins.find({ owner: requestedProfileObjectId })
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    const savedPins = await pins.find({ savedBy: requestedProfileObjectId })
      .populate(['owner', 'savedBy', 'comments.user'])
      .exec();
    debug(`Retrieved profile pins for profile -> ${requestedProfileId} by user -> ${loggedInUserid}`);
    return res.json({
      createdPins: filterPins({ rawPins: createdPins, userId: loggedInUserid, isAdmin: false }),
      savedPins: filterPins({ rawPins: savedPins, userId: loggedInUserid, isAdmin: false }),
      user: {
        service: user.service,
        displayName: user.displayName || '🚫',
        joined: user.createdAt,
      },
    });
  } catch (error) {
    debug(`Error getting profile pins for profile -> ${requestedProfileId} by user -> ${loggedInUserid}`);
    console.log(error);
    // mongoose errors out on invalid ObjectIds sent -> redirect also in that case
    return res.json({ redirect: '/' });
  }
};

export const getTags = async (req: Request, res: genericResponseType) => {
  try {
    debug('Getting all distinct tags');
    const tags = await savedTags.find().distinct('tag').exec();
    res.json(tags);
  } catch (error) {
    debug('Error getting all distinct tags');
    res.json(error);
  }
};

export const searchUsers = async (req: Request, res: genericResponseType) => {
  const searchVal = req.params.search;
  const re = new RegExp(searchVal, 'gi');
  try {
    debug(`Searching user displayNames with query -> ${re}`);
    const foundUsers = await users.find({ displayName: re }).exec();
    const results = foundUsers.map(
      ({ _id, displayName, service }) => ({ _id, displayName, service }),
    );
    res.json(results);
  } catch (error) {
    debug(`Error searching users --> ${error}`);
    res.json(error);
  }
};
