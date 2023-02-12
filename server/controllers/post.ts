import { Request } from 'express';
import mongoose from 'mongoose';
import { genericResponseType } from '../interfaces';
import {
  getUserProfile, uploadImageToS3,
} from '../utils';
import pins from '../models/pins';
import { UserType } from '../models/user';
import pinLinks from '../models/pinlinks';

export const addPin = async (req: Request, res: genericResponseType) => {
  const { displayName, userId, service } = getUserProfile(req.user as UserType);
  const { imgLink: originalImgLink } = req.body;
  try {
    const newImgLink = await uploadImageToS3({
      originalImgLink, userId, displayName, service,
    });
    const updatedPinInfo = {
      ...req.body,
      owner: mongoose.Types.ObjectId(userId),
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

export const getDuplicateError = async (req: Request, res: genericResponseType) => {
  const { picInPreview } = req.body;
  try {
    const [duplicateFound] = await pinLinks.find({
      $or: [
        { imgLink: picInPreview },
        { originalImgLink: picInPreview },
        { cloudFrontLink: picInPreview },
      ],
    }).exec();
    return res.json({ duplicateError: Boolean(duplicateFound) });
  } catch (error) {
    return res.json(error);
  }
};
