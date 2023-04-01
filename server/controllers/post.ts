import { Request } from 'express';
import mongoose from 'mongoose';
import debugg from 'debug';
import vision from '@google-cloud/vision';
import { genericResponseType, tagType } from '../interfaces';
import {
  getUserProfile, uploadImageToS3,
} from '../utils';
import pins, { Pin } from '../models/pins';
import { UserType } from '../models/user';
import pinLinks from '../models/pinlinks';
import savedTags from '../models/tags';

const debug = debugg('Pinterest-Clone:server');

// run as a side effect after pin has been uploaded
const addVisionApiTags = async (addedpin: Pin) => {
  try {
    // Creates a client
    const client = new vision.ImageAnnotatorClient();
    // Performs label detection on the image file
    const [result] = await client.labelDetection(addedpin.imgLink);
    const labels = result.labelAnnotations;
    if (labels) {
      debug(`Adding tags for new pin -> ${addedpin.imgDescription} from vision api`);
      const descriptions = labels.map((label) => (label.description?.toUpperCase()));
      const tags = descriptions.map((description) => ({ tag: description }));
      const update = { $set: { tags, visionApiTags: descriptions } };
      await pins.findByIdAndUpdate(addedpin._id, update);
      const newSavedTags: Promise<tagType>[] = [];
      tags.forEach((tag) => newSavedTags.push(savedTags.create(tag)));
      await Promise.all(newSavedTags);
    }
  } catch (error) {
    console.log(error);
  }
};

const addPin = async (req: Request, res: genericResponseType) => {
  const { displayName, userId, service } = getUserProfile(req.user as UserType);
  const { imgLink: originalImgLink } = req.body;
  debug(`Creating new pin for userId -> ${userId}`);
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
    addVisionApiTags(addedpin);
    debug(`${displayName} added pin ${addedpin.imgDescription}`);
    res.json(addedpin);
  } catch (error) {
    debug(`Error creating new pin for userId -> ${userId}`);
    res.json(error);
  }
};

export default addPin;
