const nock = require('nock');
const {
  addPin, getPins, pinImage, removePin,
} = require('../../server/crudroutes');
const pins = require('../../server/models/pins'); // schema for pins
const {
  user, rawPinsStub, allPinsResponse,
} = require('./stub');

/* AWS S3 mocks */
const mockS3Instance = {
  upload: jest.fn(() => ({
    promise: jest.fn(() => ({ Location: 'https://s3-uploaded-location-stub-4' })),
  })),
};

jest.mock('aws-sdk', () => ({ S3: jest.fn(() => mockS3Instance) }));

/* Mongoose mocks */
const setupMocks = (response = rawPinsStub) => {
  pins.find = jest.fn().mockImplementation(
    () => ({
      exec: jest.fn().mockResolvedValue(response),
    }),
  );
  pins.create = jest.fn().mockResolvedValue(response);
  pins.findById = jest.fn().mockImplementation(
    () => ({
      exec: jest.fn().mockResolvedValue(response),
    }),
  );
};

describe('Retrieving pins', () => {
  let res;
  const req = {
    query: {
      type: 'all',
    },
    user,
  };
  beforeEach(() => {
    res = { json: jest.fn() };
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'xxx',
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will retrieve all pins for the home page', async () => {
    setupMocks();
    await getPins(req, res);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledWith({ isBroken: false });
    expect(res.json).toHaveBeenCalledWith(allPinsResponse);
  });

  test('will retrieve pins for the profile page', async () => {
    const profilePinsRaw = rawPinsStub.filter(p => p.owner.id === user.twitter.id
            || p.savedBy.map(s => s.id).includes(user.twitter.id));

    setupMocks(profilePinsRaw);
    req.query.type = 'profile';
    await getPins(req, res);
    expect(pins.find).toHaveBeenCalledTimes(2);
    expect(pins.find).toHaveBeenCalledWith({ $or: [{ 'owner.id': user.twitter.id }, { 'savedBy.id': user.twitter.id }] });
    expect(res.json).toHaveBeenCalledWith({
      profilePins: allPinsResponse.filter(p => p.owns || p.hasSaved),
      allPinLinks: profilePinsRaw.reduce(
        (acc, { imgLink, originalImgLink }) => [
          ...acc,
          { imgLink, originalImgLink, cloudFrontLink: imgLink },
        ],
        [],
      ),
    });
  });

  test('will retrieve all pins for the profile page of an admin', async () => {
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'twitter test id',
    };
    setupMocks();
    req.query.type = 'profile';
    await getPins(req, res);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledWith({ isBroken: false });
    expect(res.json).toHaveBeenCalledWith({
      profilePins: allPinsResponse.map(pin => ({ ...pin, owns: true })),
      allPinLinks: rawPinsStub.reduce(
        (acc, { imgLink, originalImgLink }) => [
          ...acc,
          {
            imgLink,
            originalImgLink,
            cloudFrontLink: imgLink,
          },
        ],
        [],
      ),
    });
  });

  test('will respond with error if GET is rejected', async () => {
    pins.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    const reqUpdate = {
      query: {
        type: 'profile',
      },
      user,
    };
    await getPins(reqUpdate, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Adding a pin', () => {
  let res;
  beforeEach(() => {
    process.env = {
      ...process.env,
      S3_BUCKET_NAME: 'pinterest.clone',
    };
    res = { json: jest.fn() };
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
          id: user.twitter.id,
        },
        imgDescription: 'description-4',
        imgLink: 'https://stub-4',
      },
    };

    nock('https://stub-4')
      .get('/')
      .reply(200, 'Processed Image data');


    setupMocks({ ...req.body });
    await addPin(req, res);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
      originalImgLink: req.body.imgLink,
      imgLink: 'https://s3-uploaded-location-stub-4',
      isBroken: false,
    });
    expect(res.json).toHaveBeenCalledWith({ ...req.body });
    expect(mockS3Instance.upload).toHaveBeenCalledWith({
      Bucket: 'pinterest.clone',
      Key: expect.any(String),
      Body: Buffer.from('Processed Image data'),
      ContentType: 'image/png',
      Tagging: 'userId=twitter test id&name=tester-twitter&service=twitter',
    });
  });

  test('will create a new pin after uploading to S3 for data:image/ protocol', async () => {
    const req = {
      user,
      body: {
        owner: {
          name: 'tester-twitter',
          service: 'twitter',
          id: user.twitter.id,
        },
        imgDescription: 'description-4',
        imgLink: 'data:image/jpeg;base64,/stub-4-data-protocol/',
      },
    };
    mockS3Instance.upload.mockClear();
    setupMocks({ ...req.body });
    await addPin(req, res);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
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
      Tagging: 'userId=twitter test id&name=tester-twitter&service=twitter',
    });
  });

  test('will keep original link on pin but not upload to S3 for an invalid url', async () => {
    const req = {
      user,
      body: {
        owner: {
          name: 'tester-twitter',
          service: 'twitter',
          id: user.twitter.id,
        },
        imgDescription: 'description-4',
        imgLink: 'htt://stub-4',
      },
    };
    mockS3Instance.upload.mockClear();
    setupMocks({ ...req.body });
    await addPin(req, res);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
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
          id: user.twitter.id,
        },
        imgDescription: 'description-4',
        imgLink: 'https://stub-4',
      },
    };

    setupMocks({ ...req.body });
    await addPin(req, res);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body, originalImgLink: req.body.imgLink, isBroken: false,
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
          id: user.twitter.id,
        },
        imgDescription: 'description-4',
        imgLink: 'https://stub-4',
      },
    };
    await addPin(req, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Pinning an image', () => {
  let res;
  const req = {
    user,
    body: {
      name: 'tester-twitter',
      service: 'twitter',
      id: user.twitter.id,
    },
    params: { _id: 3 },
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will pin an image', async () => {
    const newSavedBy = [...rawPinsStub[2].savedBy, { id: req.body.id, name: req.body.name }];
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ ...rawPinsStub[2], savedBy: newSavedBy }),
      }),
    );

    setupMocks(rawPinsStub[2]);
    await pinImage(req, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(3);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      3,
      {
        $set:
                {
                  savedBy: [
                    { id: 'another test id', name: 'tester-another' },
                    { id: 'twitter test id', name: 'tester-twitter', service: 'twitter' },
                  ],
                },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({ ...rawPinsStub[2], savedBy: newSavedBy });
    expect(res.end).toHaveBeenCalledTimes(0);
  });

  test('will not pin an image if user has already pinned', async () => {
    const newSavedBy = [...rawPinsStub[2].savedBy, { id: req.body.id, name: req.body.name }];
    setupMocks({ ...rawPinsStub[2], savedBy: newSavedBy });
    await pinImage(req, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(3);
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  test('will respond with error if PUT is rejected', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await pinImage(req, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Deleting/unpinning an image', () => {
  let res;
  const req = {
    user,
    params: { _id: 1 },
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will delete an image if the user is an owner', async () => {
    pins.findOneAndRemove = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(rawPinsStub[0]),
      }),
    );

    setupMocks(rawPinsStub[0]);
    await removePin(req, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(1);
    expect(pins.findOneAndRemove).toHaveBeenCalledTimes(1);
    expect(pins.findOneAndRemove).toHaveBeenCalledWith({ _id: 1 });
    expect(res.json).toHaveBeenCalledWith(rawPinsStub[0]);
  });

  test('will unpin an image if user is not an owner', async () => {
    const updatedReq = { ...req, params: { _id: 2 } };
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1], savedBy: [] }),
      }),
    );

    setupMocks(rawPinsStub[1]);
    await removePin(updatedReq, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(2);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      2,
      {
        $set:
                {
                  savedBy: [],
                },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({ ...rawPinsStub[1], savedBy: [] });
  });

  test('will delete any image if the user is an admin', async () => {
    const updatedReq = { ...req, params: { _id: 2 } };
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'twitter test id',
    };
    pins.findOneAndRemove = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(rawPinsStub[1]),
      }),
    );

    setupMocks(rawPinsStub[1]);
    await removePin(updatedReq, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(2);
    expect(pins.findOneAndRemove).toHaveBeenCalledTimes(1);
    expect(pins.findOneAndRemove).toHaveBeenCalledWith({ _id: 2 });
    expect(res.json).toHaveBeenCalledWith(rawPinsStub[1]);
  });

  test('will respond with error if DELETE is rejected', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await removePin(req, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});
