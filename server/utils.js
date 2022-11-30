const https = require('https');
const Stream = require('stream').Transform;
const AWS = require('aws-sdk');

const getApiKeys = () => {
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

  const keys = {
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
const getUserProfile = (user) => {
  const [service] = ['google', 'twitter', 'github'].filter(s => user && Boolean(user[s].id));
  const userId = service && user[service].id;
  const displayName = service && user[service].displayName;
  const username = service && user[service].username;
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

const getCloudFrontLink = (link) => {
  try {
    const [, , , bucketName, imgName] = link.split('/');
    return bucketName === 'pinterest.clone' ? `https://d1ttxrulihk8wq.cloudfront.net/${imgName}` : link;
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
    owner: name, // send only display name
    savedBy: modifiedSavedBy, // send only display names of pinners
    owns: // need for displaying action button on pin
    hasSaved: // need for displaying action button on pin
    createdDate: send full
};
*/
const filterPins = ({ rawPins, userId, isAdmin }) => rawPins.map((pin) => {
  const {
    _id, imgDescription, imgLink, owner, savedBy, createdAt,
  } = pin;
  const savedIds = savedBy.map(s => s.id);
  const savedNames = savedBy.map(pinner => pinner.name);
  return {
    _id,
    imgDescription,
    imgLink: getCloudFrontLink(imgLink),
    owner: owner.name,
    savedBy: savedNames,
    owns: Boolean(userId && (userId === owner.id || isAdmin)),
    hasSaved: Boolean(userId && savedIds.includes(userId)),
    createdAt,
  };
});

const validateURL = (string) => {
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

const processImage = url => new Promise((resolve, reject) => {
  const urlType = validateURL(url);
  if (!urlType) {
    reject(new Error('Invalid URL type'));
  }

  if (urlType === 'data protocol') {
    const base64Image = url.split(';base64,').pop();
    resolve(Buffer.from(base64Image, 'base64'));
  }

  const request = https.request(url, (response) => {
    const data = new Stream();
    response.on('data', (chunk) => {
      data.push(chunk);
    });

    response.on('end', () => {
      resolve(data.read());
    });
  });

  request.on('error', (err) => {
    reject(err);
  });
  request.end();
});

const configureS3 = () => new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const uploadImageToS3 = async ({
  originalImgLink, userId, displayName, service,
}) => {
  // unwanted characters (non ASCII) rejected by AWS tagging
  const ASCIIdisplayName = displayName.replace(/[^\x20-\x7E]+/g, '');
  try {
    const s3 = configureS3();
    const Body = await processImage(originalImgLink);
    const Key = `${Date.now()}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key,
      Body,
      ContentType: 'image/png',
      Tagging: `userId=${userId}&name=${ASCIIdisplayName}&service=${service}`,
    };
    const uploadedImage = await s3.upload(params).promise();
    console.log(`Successfully uploaded image ${originalImgLink} to S3 with id: ${Key}`);
    return uploadedImage.Location;
  } catch (error) {
    console.log(`Error uploading img. ${originalImgLink} - ${error}`);
    return null;
  }
};

module.exports = {
  getUserProfile,
  filterPins,
  uploadImageToS3,
  configureS3,
  getCloudFrontLink,
  getApiKeys,
};
