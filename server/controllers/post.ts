import { Request } from 'express';
import mongoose from 'mongoose';
import debugg from 'debug';
import OpenAI from 'openai';
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

const isAppS3Url = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:'
      && parsedUrl.hostname === 's3.amazonaws.com'
      && parsedUrl.pathname.split('/')[1] === process.env.S3_BUCKET_NAME;
  } catch (error) {
    return false;
  }
};

const getReusableAIImageUrl = async ({
  AIgeneratedId,
  originalImgLink,
  userId,
}: {
  AIgeneratedId: string | null | undefined,
  originalImgLink: string,
  userId: string | undefined,
}) => {
  if (!AIgeneratedId || !isAppS3Url(originalImgLink)) return null;
  const AIgeneratedRecord = await aiGenerated.findOne({ _id: AIgeneratedId, userId });
  const generatedImgURL = AIgeneratedRecord?.response?.imageResponse?.generatedImgURL;
  return generatedImgURL === originalImgLink ? generatedImgURL : null;
};

// run as a side effect after pin has been uploaded
const tagWithOpenAI = async (addedpin: Pin) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const tagsResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please provide 10 unique, single-word tags for the image in a pure JSON array format. The tags should accurately and specifically describe the image. Do not number the tags. Your response should only include a single JSON array and must NOT be wrapped in JSON markdown markers.',
            },
            {
              type: 'image_url',
              image_url: {
                url: addedpin.imgLink,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
    });
    const [tagsObject] = tagsResponse.choices;
    const rawTags = tagsObject.message?.content?.trim();
    let tagsArray = rawTags ? JSON.parse(rawTags) : [];
    if (tagsArray.length) {
      tagsArray = tagsArray.map((tag: string) => tag.toUpperCase());
      const tags = tagsArray.map((tag: string) => ({ tag }));
      const update = { $set: { tags, visionApiTags: tagsArray } };
      debug(`Adding tags -> ${tagsArray} for new pin -> ${addedpin.imgDescription} from OpenAI vision api`);
      await pins.findByIdAndUpdate(addedpin._id, update);
      const newSavedTags: Promise<tagType>[] = [];
      tags.forEach((tag: string) => newSavedTags.push(savedTags.create(tag)));
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
    // check if pin limit has been reached
    const createdPins = await pins.find({ owner: userId }).exec();
    if (createdPins.length >= 10) {
      throw new Error(`UserID: ${userId} has reached the pin creation limit - aborted!`);
    }
    const reusableAIImageUrl = await getReusableAIImageUrl({
      AIgeneratedId: req.body.AIgeneratedId,
      originalImgLink,
      userId,
    });
    const newImgLink = reusableAIImageUrl || await uploadImageToS3({
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
    tagWithOpenAI(addedpin);
    debug(`${displayName} added pin ${addedpin.imgDescription}`);
    res.json(addedpin);
  } catch (error) {
    debug(`Error creating new pin for userId -> ${userId} Error: ${error}`);
    res.json(error);
  }
};

export const generateAIimage = async (req: Request, res: genericResponseType) => {
  const { userId, displayName, service } = getUserProfile(req.user as UserType);
  const { description } = req.body;
  const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';
  try {
    const aiGeneratedByUser = await aiGenerated.find({ userId });
    if (!description.trim().length || aiGeneratedByUser.length >= 5) {
      res.end();
      return;
    }
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    debug(`UserId -> ${userId} Generating AI image and title for -> ${description} from openAI`);
    const imageResponse = await openai.images.generate({
      model: OPENAI_IMAGE_MODEL,
      prompt: description,
      n: 1,
      size: '1024x1024',
    });
    const titleResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Create a concise and engaging title, consisting of one or two words, for the given description: ${description}`,
      }],
      max_tokens: 10,
    });
    const [imageData] = imageResponse.data;
    let imgURL = imageData?.url;
    if (imageData?.b64_json) {
      const generatedS3Url = await uploadImageToS3({
        originalImgLink: `data:image/png;base64,${imageData.b64_json}`,
        userId,
        displayName,
        service,
      });
      if (!generatedS3Url) {
        throw new Error('Unable to upload OpenAI image to S3');
      }
      imgURL = generatedS3Url;
    }
    if (!imgURL) {
      throw new Error('OpenAI returned no image data');
    }
    const { _id } = await aiGenerated.create({
      userId,
      description,
      response: {
        imageResponse: {
          created: imageResponse.created,
          hasUrl: Boolean(imageData?.url),
          hasB64Json: Boolean(imageData?.b64_json),
          model: OPENAI_IMAGE_MODEL,
          generatedImgURL: imgURL,
        },
        titleResponse,
      },
    });
    const [titleObject] = titleResponse.choices;

    res.json({ imgURL, title: titleObject.message?.content?.trim().replace(/[".]/g, ''), _id });
  } catch (error) {
    debug(`Error Generating AI image and title for -> UserId -> ${userId} and description: ${description}, Error: ${error}`);
    res.json({ imgURL: '', title: '', _id: null });
  }
};
