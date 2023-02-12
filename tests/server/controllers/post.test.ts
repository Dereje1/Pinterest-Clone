import nock from 'nock';
import { Types } from 'mongoose';
import {
  addPin,
  getDuplicateError,
} from '../../../server/controllers/post';
import pins from '../../../server/models/pins'; // schema for pins
import pinLinks from '../../../server/models/pinlinks'; // schema for pins
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

/* Mongoose mocks */
const setupMocks = (response: PopulatedPinType[] | unknown = rawPinsStub) => {
  pins.create = jest.fn().mockResolvedValue(response);
};

describe('Adding a pin', () => {
  let res;
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
    await addPin(req as genericRequest, res);
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
    await addPin(req as genericRequest, res);
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
    await addPin(req as genericRequest, res);
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
    await addPin(req as genericRequest, res);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      originalImgLink: req.body.imgLink,
      isBroken: false,
    });
    expect(res.json).toHaveBeenCalledWith({ ...req.body });
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
    await addPin(req as genericRequest, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Getting duplicate errors on new pin', () => {
  let res;
  const req = {
    body: {
      picInPreview: 'duplicate-link',
    },
  };
  beforeEach(() => {
    res = { json: jest.fn() };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will respond if duplicate found', async () => {
    pinLinks.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([{
          imgLink: 'duplicate-link',
        }]),
      }),
    );
    await getDuplicateError(req as genericRequest, res);
    expect(pinLinks.find).toHaveBeenCalledTimes(1);
    expect(pinLinks.find).toHaveBeenCalledWith({
      $or: [
        { imgLink: 'duplicate-link' },
        { originalImgLink: 'duplicate-link' },
        { cloudFrontLink: 'duplicate-link' },
      ],
    });
    expect(res.json).toHaveBeenCalledWith({ duplicateError: true });
  });

  test('will respond if duplicate is not found', async () => {
    pinLinks.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([]),
      }),
    );
    await getDuplicateError(req as genericRequest, res);
    expect(pinLinks.find).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ duplicateError: false });
  });

  test('will respond with error if post is rejected', async () => {
    pinLinks.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await getDuplicateError(req as genericRequest, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});
