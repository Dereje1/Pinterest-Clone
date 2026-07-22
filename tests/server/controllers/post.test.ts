import { Response } from 'express';
import nock from 'nock';
import { Types } from 'mongoose';
import { addPin, generateAIimage } from '../../../server/controllers/post';
import pins from '../../../server/models/pins'; // schema for pins
import pinLinks from '../../../server/models/pinlinks';
import savedTags from '../../../server/models/tags';
import aiGenerated from '../../../server/models/AI_generated';
import {
  user, rawPinsStub,
} from '../stub';
import { genericRequest } from '../interfaces';
import { PopulatedPinType } from '../../../server/interfaces';

/* AWS S3 mocks */
const mockS3Instance = {
  send: jest.fn(() => Promise.resolve()),
};
let mockPutObjectCommand: ()=>void;
jest.mock('@aws-sdk/client-s3', () => {
  mockPutObjectCommand = jest.fn();
  return {
    S3Client: jest.fn(() => mockS3Instance),
    PutObjectCommand: mockPutObjectCommand,
  };
});

/* Mock open ai api */
const mockOpenAiInstance = {
  images: {
    generate: jest.fn<Promise<unknown>, unknown[]>(() => Promise.resolve({ data: [{ url: 'http:/stub-ai-image-url' }] })),
  },
  chat: {
    completions: {
      create: jest.fn<Promise<unknown>, unknown[]>(() => Promise.resolve({ choices: [{ message: { content: '["TEST-LABEL-A", "TEST-LABEL-B"]' } }] })),
    },
  },
};

jest.mock('openai', () => jest.fn(() => mockOpenAiInstance));

/* Mongoose mocks */
const setupMocks = (response: PopulatedPinType[] | unknown = rawPinsStub) => {
  pins.find = jest.fn().mockImplementation(
    () => ({
      exec: jest.fn().mockResolvedValue([]),
    }),
  );
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
      AWS_ACCESS_KEY_ID: 'stub_Id',
      AWS_SECRET_KEY: 'stub key',
    };
    res = { json: jest.fn() };
    mockS3Instance.send.mockClear();
    (mockPutObjectCommand as jest.Mock).mockClear();
    pinLinks.create = jest.fn().mockResolvedValue({});
    aiGenerated.findOne = jest.fn().mockResolvedValue(null);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will keep normal non-AI web URL pin creation on the original S3 upload path', async () => {
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

    setupMocks({ ...req.body });
    pins.create = jest.fn().mockImplementation((pin) => Promise.resolve({ ...pin, _id: 123 }));
    await addPin(req as unknown as genericRequest, res as unknown as Response);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      originalImgLink: req.body.imgLink,
      imgLink: expect.stringContaining('https://s3.amazonaws.com/pinterest.clone/'),
      isBroken: false,
    });
    const persistedWebPin = (pins.create as jest.Mock).mock.calls[0][0];
    expect(aiGenerated.findOne).not.toHaveBeenCalled();
    expect(mockS3Instance.send).toHaveBeenCalledTimes(1);
    expect(pinLinks.create).toHaveBeenCalledWith({
      cloudFrontLink: `https://d1ttxrulihk8wq.cloudfront.net/${persistedWebPin.imgLink.split('/')[4]}`,
      imgLink: persistedWebPin.imgLink,
      originalImgLink: req.body.imgLink,
      pin_id: '123',
    });
    expect(res.json).toHaveBeenCalledWith({ ...persistedWebPin, _id: 123 });
    expect(mockPutObjectCommand).toHaveBeenCalledWith({
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
      {
        $set: {
          tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }],
          visionApiTags: ['TEST-LABEL-A', 'TEST-LABEL-B'],
        },
      },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will keep normal non-AI file upload data URI pin creation on the original S3 upload path', async () => {
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
    setupMocks({ ...req.body });
    pins.create = jest.fn().mockImplementation((pin) => Promise.resolve({ ...pin, _id: 123 }));
    await addPin(req as genericRequest, res as unknown as Response);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      originalImgLink: req.body.imgLink,
      imgLink: expect.stringContaining('https://s3.amazonaws.com/pinterest.clone/'),
      isBroken: false,
    });
    const persistedUploadPin = (pins.create as jest.Mock).mock.calls[0][0];
    expect(aiGenerated.findOne).not.toHaveBeenCalled();
    expect(mockS3Instance.send).toHaveBeenCalledTimes(1);
    expect(pinLinks.create).toHaveBeenCalledWith({
      cloudFrontLink: `https://d1ttxrulihk8wq.cloudfront.net/${persistedUploadPin.imgLink.split('/')[4]}`,
      imgLink: persistedUploadPin.imgLink,
      originalImgLink: req.body.imgLink,
      pin_id: '123',
    });
    expect(res.json).toHaveBeenCalledWith({ ...persistedUploadPin, _id: 123 });
    expect(mockPutObjectCommand).toHaveBeenCalledWith({
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
      {
        $set: {
          tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }],
          visionApiTags: ['TEST-LABEL-A', 'TEST-LABEL-B'],
        },
      },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will reuse an already uploaded AI generated S3 image without uploading it again', async () => {
    const generatedImgURL = 'https://s3.amazonaws.com/pinterest.clone/generated-ai-image';
    const req = {
      user,
      body: {
        owner: {
          name: 'tester-twitter',
          service: 'twitter',
          id: user._id,
        },
        imgDescription: 'description-4',
        imgLink: generatedImgURL,
        AIgeneratedId: 'stub_ai_mongoose_storage_ID',
        _id: 123,
      },
    };
    mockS3Instance.send.mockClear();
    aiGenerated.findOne = jest.fn().mockResolvedValue({
      response: {
        imageResponse: {
          generatedImgURL,
        },
      },
    });
    setupMocks({ ...req.body, imgLink: generatedImgURL, originalImgLink: generatedImgURL });
    await addPin(req as unknown as genericRequest, res as unknown as Response);
    expect(aiGenerated.findOne).toHaveBeenCalledWith({
      _id: 'stub_ai_mongoose_storage_ID',
      userId: user._id,
    });
    expect(mockS3Instance.send).not.toHaveBeenCalled();
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      imgLink: generatedImgURL,
      originalImgLink: generatedImgURL,
      isBroken: false,
    });
    expect(pinLinks.create).toHaveBeenCalledWith({
      pin_id: '123',
      imgLink: generatedImgURL,
      originalImgLink: generatedImgURL,
      cloudFrontLink: 'https://d1ttxrulihk8wq.cloudfront.net/generated-ai-image',
    });
    const persistedPin = JSON.stringify((pins.create as jest.Mock).mock.calls[0][0]);
    const persistedPinLink = JSON.stringify((pinLinks.create as jest.Mock).mock.calls[0][0]);
    expect(persistedPin).not.toContain('data:image');
    expect(persistedPinLink).not.toContain('data:image');
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
    mockS3Instance.send.mockClear();
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
    expect(mockS3Instance.send).not.toHaveBeenCalled();
    // assert for cloud vision api labeling
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      123,
      {
        $set: {
          tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }],
          visionApiTags: ['TEST-LABEL-A', 'TEST-LABEL-B'],
        },
      },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will keep original link on pin if invalid AWS credentials used to upload', async () => {
    process.env = {
      ...process.env,
      AWS_ACCESS_KEY_ID: undefined,
      AWS_SECRET_KEY: 'stub key',
    };
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
    mockS3Instance.send.mockClear();
    setupMocks({ ...req.body });
    await addPin(req as genericRequest, res as unknown as Response);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      owner: Types.ObjectId(user._id),
      originalImgLink: req.body.imgLink,
      imgLink: 'https://stub-4',
      isBroken: false,
    });
    expect(res.json).toHaveBeenCalledWith({ ...req.body });
    expect(mockS3Instance.send).not.toHaveBeenCalled();
    // assert for cloud vision api labeling
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      123,
      {
        $set: {
          tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }],
          visionApiTags: ['TEST-LABEL-A', 'TEST-LABEL-B'],
        },
      },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will create a new pin from original link if S3 upload fails for any other reason', async () => {
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
      {
        $set: {
          tags: [{ tag: 'TEST-LABEL-A' }, { tag: 'TEST-LABEL-B' }],
          visionApiTags: ['TEST-LABEL-A', 'TEST-LABEL-B'],
        },
      },
    );
    // assert for saving new labels
    await Promise.resolve();
    expect(savedTags.create).toHaveBeenCalledTimes(2);
    expect(savedTags.create).toHaveBeenNthCalledWith(1, { tag: 'TEST-LABEL-A' });
    expect(savedTags.create).toHaveBeenNthCalledWith(2, { tag: 'TEST-LABEL-B' });
  });

  test('will respond with error if pin creation limit has been reached', async () => {
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
    jest.clearAllMocks();
    pins.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      }),
    );
    await addPin(req as genericRequest, res as unknown as Response);
    expect(pins.create).toHaveBeenCalledTimes(0);
    expect(res.json).toHaveBeenCalledWith(Error('UserID: 5cad310f7672ca00146485a8 has reached the pin creation limit - aborted!'));
  });

  test('will respond with error if POST is rejected', async () => {
    pins.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([]),
      }),
    );
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

describe('generating an AI image', () => {
  let res:{
    json: jest.Mock,
    end: jest.Mock
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
    mockOpenAiInstance.images.generate.mockResolvedValue({ data: [{ url: 'http:/stub-ai-image-url' }] });
    mockOpenAiInstance.chat.completions.create.mockResolvedValue({ choices: [{ message: { content: '["TEST-LABEL-A", "TEST-LABEL-B"]' } }] });
    aiGenerated.create = jest.fn().mockResolvedValue({ _id: 'stub_ai_mongoose_storage_ID' });
    aiGenerated.find = jest.fn().mockResolvedValue([1, 2, 3]);
    delete process.env.OPENAI_IMAGE_MODEL;
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will make request to openAI to generate a new image with the configured GPT Image model', async () => {
    process.env.OPENAI_IMAGE_MODEL = 'stub-image-model';
    const req = {
      user,
      body: {
        description: 'open ai image creation prompt',
      },
    };
    await generateAIimage(req as genericRequest, res as unknown as Response);
    expect(mockOpenAiInstance.images.generate).toHaveBeenCalledWith({
      model: 'stub-image-model',
      n: 1,
      prompt: 'open ai image creation prompt',
      size: '1024x1024',
    });
    expect(mockOpenAiInstance.chat.completions.create).toHaveBeenCalledWith({
      max_tokens: 10,
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: 'Create a concise and engaging title, consisting of one or two words, for the given description: open ai image creation prompt',
      }],
    });
    expect(res.json).toHaveBeenCalledWith({
      imgURL: 'http:/stub-ai-image-url',
      title: '[TEST-LABEL-A, TEST-LABEL-B]', // Not really the title but easier to mock just the tags since both use chat completions
      _id: 'stub_ai_mongoose_storage_ID',
    });
  });

  test('will upload a GPT Image base64 response to S3 and return a URL without persisting the payload', async () => {
    const stubImage = Buffer.from('stub-image').toString('base64');
    mockOpenAiInstance.images.generate.mockResolvedValue({ data: [{ b64_json: stubImage }] });
    const req = {
      user,
      body: {
        description: 'open ai image creation prompt',
      },
    };
    await generateAIimage(req as genericRequest, res as unknown as Response);
    expect(mockOpenAiInstance.images.generate).toHaveBeenCalledWith({
      model: 'gpt-image-1',
      n: 1,
      prompt: 'open ai image creation prompt',
      size: '1024x1024',
    });
    expect(res.json).toHaveBeenCalledWith({
      imgURL: expect.stringContaining('https://s3.amazonaws.com/pinterest.clone/'),
      title: '[TEST-LABEL-A, TEST-LABEL-B]',
      _id: 'stub_ai_mongoose_storage_ID',
    });
    const responsePayload = (res.json as jest.Mock).mock.calls[0][0];
    expect(responsePayload.imgURL).not.toContain(stubImage);
    expect(responsePayload.imgURL).not.toContain('data:image/png;base64');
    expect(mockPutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'pinterest.clone',
      Key: expect.any(String),
      Body: Buffer.from(stubImage, 'base64'),
      ContentType: 'image/png',
      Tagging: 'userId=5cad310f7672ca00146485a8&name=tester-twitter&service=twitter',
    });
    expect(aiGenerated.create).toHaveBeenCalledWith({
      userId: user._id,
      description: 'open ai image creation prompt',
      response: {
        imageResponse: {
          created: undefined,
          hasUrl: false,
          hasB64Json: true,
          model: 'gpt-image-1',
          generatedImgURL: expect.stringContaining('https://s3.amazonaws.com/pinterest.clone/'),
        },
        titleResponse: { choices: [{ message: { content: '["TEST-LABEL-A", "TEST-LABEL-B"]' } }] },
      },
    });
    const persistedAIRecord = JSON.stringify((aiGenerated.create as jest.Mock).mock.calls[0][0]);
    expect(persistedAIRecord).not.toContain(stubImage);
  });

  test('will return an existing image URL if OpenAI provides a URL fallback', async () => {
    const req = {
      user,
      body: {
        description: 'open ai image creation prompt',
      },
    };
    await generateAIimage(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith({
      imgURL: 'http:/stub-ai-image-url',
      title: '[TEST-LABEL-A, TEST-LABEL-B]',
      _id: 'stub_ai_mongoose_storage_ID',
    });
  });

  test('will respond with error if OpenAI returns no image payload', async () => {
    mockOpenAiInstance.images.generate.mockResolvedValue({ data: [{}] });
    const req = {
      user,
      body: {
        description: 'open ai image creation prompt',
      },
    };
    await generateAIimage(req as genericRequest, res as unknown as Response);
    expect(aiGenerated.create).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      imgURL: '',
      title: '',
      _id: null,
    });
  });

  test('will end response if no prompt provided', async () => {
    const req = {
      user,
      body: {
        description: '',
      },
    };
    await generateAIimage(req as genericRequest, res as unknown as Response);
    expect(res.end).toHaveBeenCalled();
  });

  test('will end response if 5 or more AI generated images have been created by the user', async () => {
    aiGenerated.find = jest.fn().mockResolvedValue([1, 2, 3, 4, 5]);
    const req = {
      user,
      body: {
        description: 'open ai image creation prompt',
      },
    };
    await generateAIimage(req as genericRequest, res as unknown as Response);
    expect(res.end).toHaveBeenCalled();
  });

  test('will respond with error if POST is rejected', async () => {
    aiGenerated.create = jest.fn().mockRejectedValue(new Error('Mocked rejection'));
    const req = {
      user,
      body: {
        description: 'open ai image creation prompt',
      },
    };
    await generateAIimage(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith({
      imgURL: '',
      title: '',
      _id: null,
    });
  });
});
