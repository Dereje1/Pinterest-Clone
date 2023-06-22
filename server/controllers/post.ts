import { Request } from 'express';
import mongoose from 'mongoose';
import debugg from 'debug';
import vision from '@google-cloud/vision';
import { Configuration, OpenAIApi } from 'openai';
import { genericResponseType, tagType } from '../interfaces';
import {
  getUserProfile, uploadImageToS3,
} from '../utils';
import pins, { Pin } from '../models/pins';
import { UserType } from '../models/user';
import pinLinks from '../models/pinlinks';
import savedTags from '../models/tags';
import aiGenerated from '../models/AI_generated';

const debug = debugg('Pinterest-Clone:server');

// run as a side effect after pin has been uploaded
const addVisionApiTags = async (addedpin: Pin) => {
  try {
    // Creates a client
    const client = new vision.ImageAnnotatorClient();
    // Performs label detection on the image file
    const [result] = await client.labelDetection(addedpin.imgLink);
    const { labelAnnotations: labels } = result;
    if (labels) {
      const descriptions = labels.map((label) => (label.description?.toUpperCase()));
      const tags = descriptions.map((description) => ({ tag: description }));
      const update = { $set: { tags, visionApiTags: descriptions } };
      debug(`Adding tags -> ${descriptions} for new pin -> ${addedpin.imgDescription} from vision api`);
      await pins.findByIdAndUpdate(addedpin._id, update);
      const newSavedTags: Promise<tagType>[] = [];
      tags.forEach((tag) => newSavedTags.push(savedTags.create(tag)));
      await Promise.all(newSavedTags);
    }
  } catch (error) {
    console.log(error);
  }
};

export const addPin = async (req: Request, res: genericResponseType) => {
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

export const generateAIimage = async (req: Request, res: genericResponseType) => {
  const { userId } = getUserProfile(req.user as UserType);
  const configuration = new Configuration({
    organization: 'org-FtyC0IxZJnaJkvNlnh84eOBJ',
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { description } = req.body;
  try {
    const aiGeneratedByUser = await aiGenerated.find({ userId });
    if (!description.trim().length || aiGeneratedByUser.length >= 5) {
      res.end();
      return;
    }
    const openai = new OpenAIApi(configuration);
    debug(`UserId -> ${userId} Generating AI image and title for -> ${description} from openAI`);
    const { data: imageResponse } = await openai.createImage({
      prompt: description,
      n: 1,
      size: '1024x1024',
    });
    const { data: titleResponse } = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Create a concise and engaging title, consisting of one or two words, for the given description: ${description}`,
      max_tokens: 10,
    });

    const { _id } = await aiGenerated.create({
      userId,
      description,
      response: { imageResponse, titleResponse },
    });
    const [linkObject] = imageResponse.data;
    const [titleObject] = titleResponse.choices;
    res.json({ imgURL: linkObject.url, title: titleObject.text?.trim().replace(/[".]/g, ''), _id });
  } catch (error) {
    res.json(error);
  }
};
