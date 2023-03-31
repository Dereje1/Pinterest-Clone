import { Response } from 'express';
import nock from 'nock';
import { Types } from 'mongoose';
import addPin from '../../../server/controllers/post';
import pins from '../../../server/models/pins'; // schema for pins
import pinLinks from '../../../server/models/pinlinks';
import savedTags from '../../../server/models/tags';
import {
  user, rawPinsStub,
} from '../stub';
import { genericRequest } from '../interfaces';
import { PopulatedPinType } from '../../../server/interfaces';

/* AWS S3 mocks */
const mockS3Instance = {
  upload: jest.fn(() => ({
    promise: jest.fn(() => ({ Location: 'https://s3-uploaded-location-stub-4' })),
  })),
};

jest.mock('aws-sdk', () => ({ S3: jest.fn(() => mockS3Instance) }));

/* Mock cloud vision api */
const mockGvisionInstance = {
  labelDetection: jest.fn(() => Promise.resolve([
    { labelAnnotations: [{ description: 'Test-label-A' }, { description: 'Test-label-B' }] },
  ])),
};

jest.mock('@google-cloud/vision', () => ({ ImageAnnotatorClient: jest.fn(() => mockGvisionInstance) }));

/* Mongoose mocks */
const setupMocks = (response: PopulatedPinType[] | unknown = rawPinsStub) => {
  pins.create = jest.fn().mockResolvedValue(response);
  pins.findByIdAndUpdate = jest.fn().mockResolvedValue([]);
  savedTags.create = jest.fn().mockResolvedValue([]);
};

describe('Adding a pin', () => {
  let res:{
    json: jest.Mock,
  };
  beforeEach(() => {
    process.env = {
      ...process.env,
      S3_BUCKET_NAME: 'pinterest.clone',
    };
    res = { json: jest.fn() };
    pinLinks.create = jest.fn().mockResolvedValue({});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will create a new pin after uploading to S3 for https:// protocol', async () => {
    const req = {
      user,
      body: {
        owner: {
          name: 'tester-twitter',
          service: 'twitter',
          id: user._id,
        },
        imgDescription: 'description-4',
        imgLink: 'https://stub-4',
        _id: 123,
      },
    };

    nock('https://stub-4')
      .get('/')
      .reply(200, 'Processed Image data');

    setupMocks({
      owner: {
        name: 'tester-twitter',
        service: 'twitter',
        id: user._id,
      },
      imgDescription: 'description-4',
      imgLink: 'https://stub-4',
      _id: 123,
    });
    await addPin(req as genericRequest, res as unknown as Response);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      originalImgLink: req.body.imgLink,
      imgLink: 'https://s3-uploaded-location-stub-4',
      isBroken: false,
    });
    expect(pinLinks.create).toHaveBeenCalledWith({
      cloudFrontLink: expect.any(String),
      imgLink: expect.any(String),
      pin_id: '123',
    });
    expect(res.json).toHaveBeenCalledWith({ ...req.body });
    expect(mockS3Instance.upload).toHaveBeenCalledWith({
      Bucket: 'pinterest.clone',
      Key: expect.any(String),
      Body: Buffer.from('Processed Image data'),
      ContentType: 'image/png',
      Tagging: 'userId=5cad310f7672ca00146485a8&name=tester-twitter&service=twitter',
    });
    // assert for cloud vision api labeling
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      123,
      { $set: { tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }] } },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will create a new pin after uploading to S3 for data:image/ protocol', async () => {
    const req = {
      user,
      body: {
        owner: {
          name: 'tester-twitter',
          service: 'twitter',
          id: user._id,
        },
        imgDescription: 'description-4',
        imgLink: 'data:image/jpeg;base64,/stub-4-data-protocol/',
        _id: 123,
      },
    };
    mockS3Instance.upload.mockClear();
    setupMocks({ ...req.body });
    await addPin(req as genericRequest, res as unknown as Response);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      originalImgLink: req.body.imgLink,
      imgLink: 'https://s3-uploaded-location-stub-4',
      isBroken: false,
    });
    expect(res.json).toHaveBeenCalledWith({ ...req.body });
    expect(mockS3Instance.upload).toHaveBeenCalledWith({
      Bucket: 'pinterest.clone',
      Key: expect.any(String),
      Body: Buffer.from('/stub-4-data-protocol/', 'base64'),
      ContentType: 'image/png',
      Tagging: 'userId=5cad310f7672ca00146485a8&name=tester-twitter&service=twitter',
    });
    // assert for cloud vision api labeling
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      123,
      { $set: { tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }] } },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will keep original link on pin but not upload to S3 for an invalid url', async () => {
    const req = {
      user,
      body: {
        owner: {
          name: 'tester-twitter',
          service: 'twitter',
          id: user._id,
        },
        imgDescription: 'description-4',
        imgLink: 'htt://stub-4',
        _id: 123,
      },
    };
    mockS3Instance.upload.mockClear();
    setupMocks({ ...req.body });
    await addPin(req as genericRequest, res as unknown as Response);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      originalImgLink: req.body.imgLink,
      imgLink: 'htt://stub-4',
      isBroken: false,
    });
    expect(res.json).toHaveBeenCalledWith({ ...req.body });
    expect(mockS3Instance.upload).not.toHaveBeenCalled();
    // assert for cloud vision api labeling
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      123,
      { $set: { tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }] } },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will create a new pin from original link if S3 upload fails', async () => {
    const req = {
      user,
      body: {
        owner: {
          name: 'tester-twitter',
          service: 'twitter',
          id: user._id,
        },
        imgDescription: 'description-4',
        imgLink: 'https://stub-4',
        _id: 123,
      },
    };

    setupMocks({ ...req.body });
    await addPin(req as genericRequest, res as unknown as Response);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      originalImgLink: req.body.imgLink,
      isBroken: false,
    });
    expect(res.json).toHaveBeenCalledWith({ ...req.body });
    // assert for cloud vision api labeling
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      123,
      { $set: { tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }] } },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will respond with error if POST is rejected', async () => {
    pins.create = jest.fn().mockRejectedValue(new Error('Mocked rejection'));
    const req = {
      user,
      body: {
        owner: {
          name: 'tester-twitter',
          service: 'twitter',
          id: user._id,
        },
        imgDescription: 'description-4',
        imgLink: 'https://stub-4',
      },
    };
    await addPin(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});
