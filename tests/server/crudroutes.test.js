const nock = require('nock');
const {
  addPin,
  getPins,
  pinImage,
  unpin,
  deletePin,
  addComment,
  getProfilePins,
  getUserPins,
  updateTags,
} = require('../../server/crudroutes');
const pins = require('../../server/models/pins'); // schema for pins
const users = require('../../server/models/user'); // schema for pins
const pinLinks = require('../../server/models/pinlinks'); // schema for pins
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
  users.find = jest.fn().mockImplementation(
    () => ({
      exec: jest.fn().mockResolvedValue([{ twitter: { id: 'requestUserId', displayName: 'requestDisplayName' } }]),
    }),
  );
};

describe('Retrieving pins for home page', () => {
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

describe('Retrieving pins for user page', () => {
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
    pinLinks.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([
          {
            pin_id: 'stub pin_id',
            imgLink: 'stub imgLink',
            originalImgLink: 'stub originalImgLink',
            cloudFrontLink: 'stub originalImgLink',
          },
        ]),
      }),
    );
  });
  afterEach(() => {
    jest.restoreAllMocks();
    pinLinks.find.mockClear();
  });

  test('will retrieve pins for the profile page', async () => {
    const profilePinsRaw = rawPinsStub.filter((p) => p.owner.id === user.twitter.id
            || p.savedBy.map((s) => s.id).includes(user.twitter.id));

    setupMocks(profilePinsRaw);
    await getUserPins(req, res);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledWith({ $or: [{ 'owner.id': user.twitter.id }, { 'savedBy.id': user.twitter.id }] });
    expect(res.json).toHaveBeenCalledWith({
      profilePins: allPinsResponse.filter((p) => p.owns || p.hasSaved),
      allPinLinks: [
        {
          pin_id: 'stub pin_id',
          imgLink: 'stub imgLink',
          originalImgLink: 'stub originalImgLink',
          cloudFrontLink: 'stub originalImgLink',
        },
      ],
    });
  });

  test('will retrieve all pins for the profile page of an admin', async () => {
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'twitter test id',
    };
    setupMocks();
    await getUserPins(req, res);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledWith({ isBroken: false });
    expect(res.json).toHaveBeenCalledWith({
      profilePins: allPinsResponse.map((pin) => ({ ...pin, owns: true })),
      allPinLinks: [
        {
          pin_id: 'stub pin_id',
          imgLink: 'stub imgLink',
          originalImgLink: 'stub originalImgLink',
          cloudFrontLink: 'stub originalImgLink',
        },
      ],
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
    await getUserPins(reqUpdate, res);
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
          id: user.twitter.id,
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
    await addPin(req, res);
    expect(pins.create).toHaveBeenCalledTimes(1);
    expect(pins.create).toHaveBeenCalledWith({
      ...req.body,
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
        _id: 123,
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
        _id: 123,
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
        _id: 123,
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
                    { id: 'another test id', name: 'tester-another', service: 'other-service' },
                    { id: 'twitter test id', name: 'tester-twitter', service: 'twitter' },
                  ],
                },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({
      ...allPinsResponse[2],
      savedBy: newSavedBy.map(({ name, id, service }) => ({ name, userId: id, service })),
      hasSaved: true,
    });
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

describe('Deleting an image', () => {
  let res;
  const req = {
    user,
    params: { _id: 1 },
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
    pinLinks.findOneAndRemove = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([]),
      }),
    );
  });
  afterEach(() => {
    jest.restoreAllMocks();
    pinLinks.findOneAndRemove.mockClear();
  });

  test('will delete an image if the user is an owner', async () => {
    pins.findOneAndRemove = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(rawPinsStub[0]),
      }),
    );

    setupMocks(rawPinsStub[0]);
    await deletePin(req, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(1);
    expect(pins.findOneAndRemove).toHaveBeenCalledTimes(1);
    expect(pins.findOneAndRemove).toHaveBeenCalledWith({ _id: 1 });
    expect(pinLinks.findOneAndRemove).toHaveBeenCalledWith({ pin_id: 1 });
    expect(res.json).toHaveBeenCalledWith(rawPinsStub[0]);
  });

  test('will throw an error if user is not an owner', async () => {
    const updatedReq = { ...req, params: { _id: 2 } };
    setupMocks(rawPinsStub[1]);
    await deletePin(updatedReq, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith(Error('Pin ID: 2 is not owned by user ID: twitter test id - delete operation cancelled!'));
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
    await deletePin(updatedReq, res);
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
    await deletePin(req, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Unpinning an image', () => {
  let res;
  const req = {
    user,
    params: { _id: 1 },
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'xxx',
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will unpin an image', async () => {
    const updatedReq = { ...req, params: { _id: 2 } };
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1], savedBy: [] }),
      }),
    );

    setupMocks(rawPinsStub[1]);
    await unpin(updatedReq, res);
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
    expect(res.json).toHaveBeenCalledWith({ ...allPinsResponse[1], savedBy: [], hasSaved: false });
  });

  test('will respond with error if PUT is rejected', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await unpin(req, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Adding a comment', () => {
  let res;
  const req = {
    user,
    body: {
      comment: 'a new comment',
    },
    params: { _id: 3 },
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will add a comment to a pin', async () => {
    const newCommentResponseStub = {
      _id: 'comment-Id-2',
      userId: 'twitter test id',
      displayName: 'tester-twitter',
      createdAt: 'today',
      comment: 'a new comment',
    };
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(
          {
            ...rawPinsStub[2],
            comments: [...rawPinsStub[2].comments, newCommentResponseStub],
          },
        ),
      }),
    );

    setupMocks(rawPinsStub[2]);
    await addComment(req, res);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      3,
      {
        $push:
                {
                  comments: {
                    userId: 'twitter test id',
                    displayName: 'tester-twitter',
                    comment: 'a new comment',
                    service: 'twitter',
                  },
                },
      },
      { new: true },
    );

    expect(res.json).toHaveBeenCalledWith({
      _id: '3',
      imgDescription: 'description-3',
      imgLink: 'https://stub-3',
      owner: { userId: 'another test id', name: 'tester-another', service: 'other-service' },
      savedBy: [{ userId: 'another test id', name: 'tester-another', service: 'other-service' }],
      owns: false,
      hasSaved: false,
      comments: [
        {
          _id: 'comment-Id-1',
          displayName: 'tester-google',
          comment: 'unit tests',
          createdAt: 'today',
        },
        {
          _id: 'comment-Id-2',
          displayName: 'tester-twitter',
          comment: 'a new comment',
          createdAt: 'today',
        },
      ],
      tags: [],
    });
    expect(res.end).toHaveBeenCalledTimes(0);
  });

  test('will respond with error if PUT is rejected', async () => {
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await addComment(req, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Retrieving pins for a profile page', () => {
  let res;
  let req;
  beforeEach(() => {
    req = {
      params: {
        userid: 'requestUserId-twitter-request-DisplayName',
      },
      user,
    };
    res = { json: jest.fn() };
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'xxx',
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will retrieve pins for the profile page', async () => {
    setupMocks([]);
    await getProfilePins(req, res);
    expect(pins.find).toHaveBeenCalledTimes(2);
    expect(pins.find).toHaveBeenNthCalledWith(1, { 'owner.id': 'requestUserId' });
    expect(pins.find).toHaveBeenNthCalledWith(2, { 'savedBy.id': 'requestUserId' });
    expect(users.find).toHaveBeenCalledWith({
      $and:
      [
        { 'twitter.id': 'requestUserId' },
        { 'twitter.displayName': 'request-DisplayName' },
      ],
    });
    expect(res.json).toHaveBeenCalledWith({
      createdPins: [],
      savedPins: [],
      user: {
        displayName: 'requestDisplayName',
        service: 'twitter',
        userId: 'requestUserId',
      },
    });
  });

  test('will redirect to home page, if requested profile can not be found', async () => {
    req = {
      ...req,
      user: {
        ...user,
        twitter: {
          id: 'requestUserId',
          displayName: 'tester-twitter',
        },
      },
    };
    users.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([]),
      }),
    );
    await getProfilePins(req, res);
    expect(res.json).toHaveBeenCalledWith({
      redirect: '/',
    });
  });

  test('will redirect to logged in user profile, if requested profile is same as logged in', async () => {
    req = {
      ...req,
      user: {
        ...user,
        twitter: {
          id: 'requestUserId',
          displayName: 'tester-twitter',
        },
      },
    };
    setupMocks([]);
    await getProfilePins(req, res);
    expect(res.json).toHaveBeenCalledWith({
      redirect: '/pins',
    });
  });

  test('will respond with error if GET is rejected', async () => {
    pins.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await getProfilePins(req, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Updating tags for a pin', () => {
  let res;
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'xxx',
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will add a tag to a pin', async () => {
    const req = {
      user,
      query: { pinID: 1, tag: 'a new tag' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ owner: { id: 'twitter test id' } }),
      }),
    );
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1] }),
      }),
    );
    await updateTags(req, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      1,
      {
        $push:
                {
                  tags: { tag: 'a new tag' },
                },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({ ...allPinsResponse[1] });
  });

  test('will remove a tag from a pin', async () => {
    const req = {
      user,
      query: { pinID: 1, deleteId: '12345' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({
          owner: { id: 'twitter test id' },
          tags: [{ _id: 12345 }, { _id: 123456 }],
        }),
      }),
    );
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1] }),
      }),
    );
    await updateTags(req, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      1,
      {
        $set:
                {
                  tags: [{ _id: 123456 }],
                },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({ ...allPinsResponse[1] });
  });

  test('will end response if user is not owner of the pin', async () => {
    const req = {
      user,
      query: { pinID: 1, tag: 'a new tag' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ owner: { id: 'another id' } }),
      }),
    );
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1] }),
      }),
    );
    await updateTags(req, res);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith(1);
    expect(pins.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
  });

  test('will respond with error if PUT is rejected', async () => {
    const req = {
      user,
      query: { pinID: 1, tag: 'a new tag' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await updateTags(req, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});
