/* eslint-disable import/no-import-module-exports */
import * as https from 'https';
import { Transform as Stream } from 'stream';
import AWS from 'aws-sdk';
import {
  apiKeys,
  reqUser,
  PinType,
  services,
} from './interfaces';

export const getApiKeys = ():({
  keys: apiKeys
  apiKeysFound: {
    twitter: boolean
    google: boolean
    github: boolean
  }
}) => {
  const {
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    TWITTER_CALLBACK,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK,
  } = process.env;

  const keys: apiKeys = {
    twitterApiKeys: null,
    googleApiKeys: null,
    githubApiKeys: null,
  };

  if (TWITTER_CONSUMER_KEY && TWITTER_CONSUMER_SECRET && TWITTER_CALLBACK) {
    keys.twitterApiKeys = {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: TWITTER_CALLBACK,
    };
  }
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK) {
    keys.googleApiKeys = {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK,
    };
  }

  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && GITHUB_CALLBACK) {
    keys.githubApiKeys = {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK,
    };
  }
  const apiKeysFound = {
    twitter: Boolean(keys.twitterApiKeys),
    google: Boolean(keys.googleApiKeys),
    github: Boolean(keys.githubApiKeys),
  };
  console.log({ apiKeysFound });

  return { keys, apiKeysFound };
};

/* Isolate auth service used from req.user and generate proffile */
export const getUserProfile = (user: reqUser | undefined):({
  service: string | undefined,
  userId: string | undefined,
  displayName: string | undefined,
  username: string |undefined,
  isAdmin: boolean,
}) => {
  if (!user) {
    return {
      service: undefined,
      userId: undefined,
      displayName: undefined,
      username: undefined,
      isAdmin: false,
    };
  }
  const { _doc } = user;
  if (!_doc) {
    return {
      service: undefined,
      userId: undefined,
      displayName: undefined,
      username: undefined,
      isAdmin: false,
    };
  }
  let service;
  let userId;
  let displayName;
  let username;
  Object.keys(_doc).forEach((key) => {
    const foundservice = Object.keys(_doc[key as keyof services]).length;
    if (foundservice && key !== '_id') {
      const servObj = _doc[key as keyof services];
      service = key;
      userId = servObj.id;
      displayName = servObj.displayName;
      username = servObj.username;
    }
  });
  const isAdmin = Boolean(
    process.env.ADMIN_USER_ID
    && userId === process.env.ADMIN_USER_ID,
  );
  return {
    service,
    userId,
    displayName,
    username,
    isAdmin,
  };
};

export const getCloudFrontLink = (link: string) => {
  try {
    const [, , , bucketName, imgName] = link.split('/');
    return process.env.ENABLE_CLOUDFRONT === 'true' && bucketName === 'pinterest.clone' ? `https://d1ttxrulihk8wq.cloudfront.net/${imgName}` : link;
  } catch (error) {
    return link;
  }
};

/* filterPins return only required pin info to the client */
/*
returns
{
    _id, // send full
    imgDescription, // send full
    imgLink, // send full
    owner: // send display name, userId and service
    savedBy: // send display name, userId and service
    owns: // boolean
    hasSaved: // boolean
    comments: // send comment id, display comment, and creation date
    createdDate: send full pin creation time stamp
};
*/
interface filterTypes {
  rawPins: PinType[]
   userId: string | undefined
   isAdmin: boolean
}
export const filterPins = ({ rawPins, userId, isAdmin }: filterTypes) => rawPins.map((pin) => {
  const {
    _id: pinId,
    imgDescription,
    imgLink,
    owner,
    savedBy,
    createdAt: pinCreatedAt,
    comments,
    tags,
  } = pin;
  const savedIds = savedBy.map((s) => s.id);
  const savedNames = savedBy.map(({ name, id, service }) => ({ name, userId: id, service }));
  const modifiedComments = comments.map(
    ({
      _id, displayName, comment, createdAt,
    }) => ({
      _id, displayName, comment, createdAt,
    }),
  );
  return {
    _id: pinId,
    imgDescription,
    imgLink: getCloudFrontLink(imgLink),
    owner: { name: owner.name, userId: owner.id, service: owner.service },
    savedBy: savedNames,
    owns: Boolean(userId && (userId === owner.id || isAdmin)),
    hasSaved: Boolean(userId && savedIds.includes(userId)),
    comments: modifiedComments,
    createdAt: pinCreatedAt,
    tags,
  };
});

const validateURL = (string: string) => {
  try {
    const url = new URL(string);
    if (url.protocol === 'data:') return 'data protocol';
    if (url.protocol === 'http:' || url.protocol === 'https:') return string;
    throw new Error(`${string} can not be parsed into a valid URL`);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const processImage = (url: string):Promise<string|ArrayBuffer|undefined> => new
Promise((resolve, reject) => {
  const urlType = validateURL(url);
  if (!urlType) {
    reject(new Error('Invalid URL type'));
  }

  if (urlType === 'data protocol') {
    const base64Image = url.split(';base64,').pop();
    if (base64Image) {
      resolve(Buffer.from(base64Image, 'base64'));
    } else {
      reject(new Error('Invalid Array buffer type'));
    }
  }

  const request = https.request(url, (response) => {
    const data = new Stream();
    response.on('data', (chunk: ArrayBuffer) => {
      data.push(chunk);
    });

    response.on('end', () => {
      resolve(data.read());
    });
  });

  request.on('error', (err: string) => {
    reject(err);
  });
  request.end();
});

export const configureS3 = () => new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

export const uploadImageToS3 = async ({
  originalImgLink, userId, displayName, service,
}:{
  originalImgLink: string,
  userId: string | undefined,
  displayName: string | undefined,
  service: string | undefined
}) => {
  // unwanted characters (non ASCII) rejected by AWS tagging
  const ASCIIdisplayName = displayName && displayName.replace(/[^\x20-\x7E]+/g, '');
  try {
    const s3 = configureS3();
    const Body = await processImage(originalImgLink);
    const Key = `${Date.now()}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key,
      Body,
      ContentType: 'image/png',
      Tagging: `userId=${userId}&name=${ASCIIdisplayName}&service=${service}`,
    };
    const uploadedImage = await s3.upload(params).promise();
    console.log(`Successfully uploaded image ${originalImgLink.slice(0, 50)}... to S3 with id: ${Key}`);
    return uploadedImage.Location;
  } catch (error) {
    console.log(`Error uploading img. ${originalImgLink.slice(0, 50)}... - ${error}`);
    return null;
  }
};
