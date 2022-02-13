const nock = require('nock');
const {
  addPin, getPins, pinImage, removePin, runScan,
} = require('../../server/crudroutes');
const pins = require('../../server/models/pins'); // schema for pins
const brokenPins = require('../../server/models/brokenPins');
const {
  user, rawPinsStub, allPinsResponse, badPinTemplate, scanStub,
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

  test('will retrieve all pins for the profile page', async () => {
    const profilePinsRaw = rawPinsStub.filter(p => p.owner.id === user.twitter.id
            || p.savedBy.map(s => s.id).includes(user.twitter.id));

    setupMocks(profilePinsRaw);
    req.query.type = 'profile';
    await getPins(req, res);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledWith({ $or: [{ 'owner.id': user.twitter.id }, { 'savedBy.id': user.twitter.id }] });
    expect(res.json).toHaveBeenCalledWith(allPinsResponse.filter(p => p.owns || p.hasSaved));
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
    res = { json: jest.fn() };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will create a new pin after uploading to S3', async () => {
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
    });
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

  test('will pin an image if user has not pinned', async () => {
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
    body: {
      name: 'tester-twitter',
      service: 'twitter',
      id: user.twitter.id,
    },
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

describe('running the scan to find broken images', () => {
  let res;
  const setupScanMocks = ({
    createdAt = new Date('01/16/2022').toISOString(),
    broken = [],
    mockHTTPSrequest = true,
    pinsReturnType,
  }) => {
    brokenPins.find = jest.fn().mockImplementationOnce(
      () => ({
        exec: jest.fn().mockResolvedValueOnce([{
          createdAt,
          broken,
        }]),
      }),
    );
    pins.find = jest.fn().mockImplementationOnce(
      () => ({
        exec: jest.fn().mockResolvedValueOnce(scanStub.retrievedPinsModel[pinsReturnType]),
      }),
    );
    pins.updateMany = jest.fn().mockImplementation(
      () => ({ exec: jest.fn().mockResolvedValue([{}]) }),
    );
    brokenPins.deleteMany = jest.fn().mockImplementationOnce(
      () => ({ exec: jest.fn().mockResolvedValueOnce() }),
    );
    brokenPins.create = jest.fn().mockImplementationOnce(
      () => jest.fn().mockResolvedValueOnce(),
    );
    if (mockHTTPSrequest) {
      nock('https://badpin.com/')
        .get('/')
        .reply(500);
      nock('https://goodpin.com/')
        .get('/')
        .reply(200);
    }
  };

  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    nock.cleanAll();
    res.json.mockClear();
  });

  test('It will Not run the scan if last run was recent', async () => {
    setupScanMocks({ createdAt: new Date().toISOString() });
    await runScan({}, res);
    expect(brokenPins.find).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ startedScan: expect.any(String), message: 'canceled' });
  });

  test('It will run the full scan and update all images', async () => {
    setupScanMocks({ pinsReturnType: 'allPins' });
    await runScan({}, res);
    expect(brokenPins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.updateMany).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = pins.updateMany.mock.calls;
    expect(firstCall).toEqual(scanStub.updatePinsModel.goodPin);
    expect(secondCall).toEqual(scanStub.updatePinsModel.brokenPin);
    expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
    expect(brokenPins.create).toHaveBeenCalledTimes(1);
    const [[mockCalls]] = brokenPins.create.mock.calls;
    expect(mockCalls).toStrictEqual(scanStub.updateBrokenPinsModel.badResponse);
    expect(res.json).toHaveBeenCalledWith({ startedScan: expect.any(String), message: 'scanning...' });
  });

  test('It will run the full scan and reset broken images if none found', async () => {
    setupScanMocks({ pinsReturnType: 'oneGoodPin' });
    await runScan({}, res);
    expect(brokenPins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.updateMany).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = pins.updateMany.mock.calls;
    expect(firstCall).toEqual(scanStub.updatePinsModel.goodPin);
    expect(secondCall).toEqual([{ _id: { $in: [] } }, { isBroken: true }]);
    expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
    expect(brokenPins.create).toHaveBeenCalledWith({ broken: [] });
    expect(res.json).toHaveBeenCalledWith({ startedScan: expect.any(String), message: 'scanning...' });
  });

  test('It will run the full scan and update broken images for invalid URLs', async () => {
    setupScanMocks({ pinsReturnType: 'badURLPin' });
    await runScan({}, res);
    expect(brokenPins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.updateMany).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = pins.updateMany.mock.calls;
    expect(firstCall).toEqual(
      [{ _id: { $in: [] } }, { isBroken: false }],
    );
    expect(secondCall).toEqual(scanStub.updatePinsModel.brokenPinInvalidURL);
    expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
    expect(brokenPins.create).toHaveBeenCalledTimes(1);
    expect(brokenPins.create.mock.calls[0][0]).toStrictEqual(scanStub.updateBrokenPinsModel.badURL);
    expect(res.json).toHaveBeenCalledWith({ startedScan: expect.any(String), message: 'scanning...' });
  });

  test('It will run the full scan and reset broken images for data protocol URL', async () => {
    setupScanMocks({ pinsReturnType: 'dataProtocolPin' });
    await runScan({}, res);
    expect(brokenPins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.updateMany).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = pins.updateMany.mock.calls;
    expect(firstCall).toEqual(scanStub.updatePinsModel.goodPinDataProtocol);
    expect(secondCall).toEqual(
      [{ _id: { $in: [] } }, { isBroken: true }],
    );
    expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
    expect(brokenPins.create).toHaveBeenCalledWith({ broken: [] });
    expect(res.json).toHaveBeenCalledWith({ startedScan: expect.any(String), message: 'scanning...' });
  });

  test('It will preserve previously broken image time stamps', async () => {
    setupScanMocks({
      broken: [{
        _id: '123',
        brokenSince: 'over a year ago',
      }],
      pinsReturnType: 'oneBadPin',
    });
    await runScan({}, res);
    expect(brokenPins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.updateMany).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = pins.updateMany.mock.calls;
    expect(firstCall).toEqual(
      [{ _id: { $in: [] } }, { isBroken: false }],
    );
    expect(secondCall).toEqual(scanStub.updatePinsModel.brokenPin);
    expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
    expect(brokenPins.create).toHaveBeenCalledTimes(1);
    const [[mockCalls]] = brokenPins.create.mock.calls;
    expect(mockCalls).toStrictEqual(scanStub.updateBrokenPinsModel.keepTimeStamp);
    expect(res.json).toHaveBeenCalledWith({ startedScan: expect.any(String), message: 'scanning...' });
  });

  test('It will run the full scan and update broken images for all other error in http response', async () => {
    setupScanMocks({ mockHTTPSrequest: false, pinsReturnType: 'oneBadPin' });
    nock('https://badpin.com/')
      .get('/')
      .replyWithError('Error in https request');
    await runScan({}, res);
    expect(brokenPins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.updateMany).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = pins.updateMany.mock.calls;
    expect(firstCall).toEqual(
      [{ _id: { $in: [] } }, { isBroken: false }],
    );
    expect(secondCall).toEqual(
      [{
        _id: {
          $in: [
            {
              ...badPinTemplate,
              statusCode: null,
              statusMessage: new Error('Error in https request'),
            }],
        },
      }, { isBroken: true }],
    );
    expect(brokenPins.deleteMany).toHaveBeenCalledTimes(1);
    expect(brokenPins.create).toHaveBeenCalledTimes(1);
    expect(brokenPins.create.mock.calls[0][0]).toStrictEqual({
      broken: [
        {
          ...badPinTemplate,
          statusCode: null,
          statusMessage: new Error('Error in https request'),
          brokenSince: expect.any(String),
        },
      ],
    });
  });

  test('will respond with error if GET is rejected', async () => {
    brokenPins.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await runScan({}, res);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});
