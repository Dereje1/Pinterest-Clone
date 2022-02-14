const https = require('https');
const Stream = require('stream').Transform;
const AWS = require('aws-sdk');


/* Isolate auth service used from req.user */
const getUserProfile = (user) => {
  const [service] = ['google', 'twitter'].filter(s => user && Boolean(user[s].id));
  return {
    userId: service && user[service].id,
    displayName: service && user[service].displayName,
    service,
  };
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
const filterPins = (rawPins, user) => rawPins.map((pin) => {
  const {
    _id, imgDescription, imgLink, owner, savedBy, createdAt,
  } = pin;
  const { userId } = getUserProfile(user);
  const savedIds = savedBy.map(s => s.id);
  const { name } = owner;
  const modifiedSavedBy = savedBy.map(pinner => pinner.name);
  return {
    _id,
    imgDescription,
    imgLink,
    owner: name,
    savedBy: modifiedSavedBy,
    owns: userId ? userId === owner.id : null,
    hasSaved: userId ? savedIds.includes(userId) : null,
    createdAt,
  };
});

const isReadyToRun = (lastBackedUp) => {
  const CYCLE_TIME = 6 * 60 * 60 * 1000;
  const timeElapsed = new Date() - new Date(lastBackedUp);
  return timeElapsed > CYCLE_TIME;
};

const getPrevBrokenTimeStamp = (prevBrokenPins, pinId) => {
  const [pinFound] = prevBrokenPins.broken.filter(({ _id }) => _id.toString() === pinId.toString());
  if (pinFound) {
    return pinFound.brokenSince;
  }
  return null;
};

const validateURL = (string) => {
  try {
    const url = new URL(string);
    if (url.protocol === 'data:') return 'data protocol';
    if (url.protocol === 'http:' || url.protocol === 'https:') return string;
  } catch (_) {
    return null;
  }
  return null;
};

const isValidEnpoint = imageInfo => new Promise((resolve) => {
  const url = validateURL(imageInfo.imgLink);
  if (url === 'data protocol') {
    resolve({
      ...imageInfo, statusCode: null, statusMessage: 'data protocol', valid: true,
    });
  }
  if (!url) {
    resolve({
      ...imageInfo, statusCode: null, statusMessage: 'Invalid URL', valid: false,
    });
  }

  const inValidStatusMessages = ['Moved Permanently', 'Moved Temporarily'];
  const request = https.request(url, (response) => {
    const { statusCode, statusMessage } = response;
    if (statusCode < 400 && !inValidStatusMessages.includes(statusMessage)) {
      resolve({
        ...imageInfo, statusCode, statusMessage, valid: true,
      });
    } else {
      resolve({
        ...imageInfo, statusCode, statusMessage, valid: false,
      });
    }
  });

  request.on('error', (error) => {
    resolve({
      ...imageInfo, statusCode: null, statusMessage: error, valid: false,
    });
  });

  request.end();
});

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

const uploadImageToS3 = async ({ originalImgLink }) => {
  try {
    const s3 = configureS3();
    const Body = await processImage(originalImgLink);
    const Key = `${Date.now()}`;
    const params = {
      Bucket: 'pinterest.clone',
      Key,
      Body,
      ContentType: 'image/png',
    };
    const uploadedImage = await s3.upload(params).promise();
    console.log(`Successfully uploaded image ${originalImgLink} to S3`);
    return uploadedImage.Location;
  } catch (error) {
    console.log(`Error uploading img. ${originalImgLink} - ${error}`);
    return null;
  }
};

module.exports = {
  getUserProfile,
  filterPins,
  isReadyToRun,
  isValidEnpoint,
  getPrevBrokenTimeStamp,
  uploadImageToS3,
  configureS3,
};
