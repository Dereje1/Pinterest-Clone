import { Response } from 'express';
import { Types } from 'mongoose';
import {
  getPins,
  getProfilePins,
  getTags,
  getUserPins,
  searchUsers,
} from '../../../server/controllers/get';
import pins from '../../../server/models/pins'; // schema for pins
import users from '../../../server/models/user'; // schema for pins
import pinLinks from '../../../server/models/pinlinks'; // schema for pins
import savedTags from '../../../server/models/tags';
import {
  user, rawPinsStub, allPinsResponse,
} from '../stub';
import { genericRequest } from '../interfaces';
import { PopulatedPinType } from '../../../server/interfaces';

/* Mongoose mocks */
const setupMocks = (response: PopulatedPinType[] | unknown = rawPinsStub) => {
  pins.find = jest.fn().mockImplementation(
    () => ({
      populate: jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(response),
      })),
    }),
  );
  users.findById = jest.fn().mockImplementation(
    () => ({
      exec: jest.fn().mockResolvedValue(user),
    }),
  );
};

describe('Retrieving pins for home page', () => {
  let res:{
    json: jest.Mock,
  };
  const req = {
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
    await getPins(req as genericRequest, res as unknown as Response);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledWith({ isBroken: false });
    expect(res.json).toHaveBeenCalledWith(allPinsResponse);
  });

  test('will respond with error if GET is rejected', async () => {
    pins.find = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
        })),
      }),
    );
    const reqUpdate = {
      query: {
        type: 'profile',
      },
      user,
    };
    await getPins(reqUpdate as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Retrieving pins for user page', () => {
  let res:{
    json: jest.Mock,
  };
  let mockedFind: jest.Mock;
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
    mockedFind = jest.mocked(pinLinks.find);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    mockedFind.mockClear();
  });

  test('will retrieve pins for the profile page', async () => {
    const profilePinsRaw = rawPinsStub.filter((p) => p.owner._id === user._id
              || p.savedBy.map((s) => s._id).includes(user._id));

    setupMocks(profilePinsRaw);
    await getUserPins(req as genericRequest, res as unknown as Response);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledWith({
      $or: [{ owner: Types.ObjectId(user._id) }, { savedBy: Types.ObjectId(user._id) }],
    });
    expect(res.json).toHaveBeenCalledWith({
      profilePins: allPinsResponse.filter((p) => p.owns || p.hasSaved),
    });
  });

  test('will retrieve all pins for the profile page of an admin', async () => {
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'twitter test id',
    };
    setupMocks();
    await getUserPins(req as genericRequest, res as unknown as Response);
    expect(pins.find).toHaveBeenCalledTimes(1);
    expect(pins.find).toHaveBeenCalledWith({ isBroken: false });
    expect(res.json).toHaveBeenCalledWith({
      profilePins: allPinsResponse.map((pin) => ({ ...pin, owns: true })),
    });
  });

  test('will respond with error if GET is rejected', async () => {
    pins.find = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
        })),
      }),
    );
    const reqUpdate = {
      query: {
        type: 'profile',
      },
      user,
    };
    await getUserPins(reqUpdate as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Retrieving pins for a profile page', () => {
  let res:{
    json: jest.Mock,
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

  test('will retrieve pins for the profile page', async () => {
    const req = {
      params: {
        userid: 'microsoft123',
      },
      user,
    };
    setupMocks([]);
    await getProfilePins(req as unknown as genericRequest, res as unknown as Response);
    expect(pins.find).toHaveBeenCalledTimes(2);
    expect(pins.find).toHaveBeenNthCalledWith(1, { owner: Types.ObjectId('microsoft123') });
    expect(pins.find).toHaveBeenNthCalledWith(2, { savedBy: Types.ObjectId('microsoft123') });
    expect(users.findById).toHaveBeenCalledWith(Types.ObjectId('microsoft123'));
    expect(res.json).toHaveBeenCalledWith({
      createdPins: [],
      savedPins: [],
      user: {
        displayName: 'tester-twitter',
        service: 'twitter',
      },
    });
  });

  test('will redirect to home page, if requested profile can not be found', async () => {
    const req = {
      params: {
        userid: 'microsoft123',
      },
      user: {
        ...user,
        userId: 'requestUserId',
        displayName: 'tester-twitter',
      },
    };
    users.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );
    await getProfilePins(req as unknown as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith({
      redirect: '/',
    });
  });

  test('will redirect to logged in user profile, if requested profile is same as logged in', async () => {
    const req = {
      params: {
        userid: 'microsoft123',
      },
      user: {
        ...user,
        _id: 'microsoft123',
      },
    };
    setupMocks([]);
    await getProfilePins(req as unknown as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith({
      redirect: '/pins',
    });
  });

  test('will respond with redirect if GET is rejected', async () => {
    const req = {
      params: {
        userid: 'microsoft123',
      },
      user,
    };
    users.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await getProfilePins(req as unknown as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith({
      redirect: '/',
    });
  });
});

describe('Getting saved tags list', () => {
  let res:{
    json: jest.Mock,
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

  test('will get tags', async () => {
    const distinct = jest.fn();
    savedTags.find = jest.fn().mockImplementation(
      () => ({
        distinct: distinct.mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(['saved tags']),
        })),
      }),
    );
    await getTags({} as genericRequest, res as unknown as Response);
    expect(savedTags.find).toHaveBeenCalledTimes(1);
    expect(distinct).toHaveBeenCalledWith('tag');
    expect(res.json).toHaveBeenCalledWith(['saved tags']);
  });

  test('will respond with error if get is rejected', async () => {
    const req = {};
    savedTags.find = jest.fn().mockImplementation(
      () => ({
        distinct: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
        })),
      }),
    );
    await getTags(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Searching users', () => {
  let res:{
    json: jest.Mock,
  };
  beforeEach(() => {
    res = { json: jest.fn() };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will get users', async () => {
    const req = {
      params: {
        search: 'a user',
      },
      user,
    };
    users.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue([{ _id: 'test user id', displayName: 'test displayName', service: 'github' }]),
      }),
    );
    await searchUsers(req as genericRequest, res as unknown as Response);
    expect(users.find).toHaveBeenCalledTimes(1);
    expect(users.find).toHaveBeenCalledWith({ displayName: /a user/gi });
    expect(res.json).toHaveBeenCalledWith([{ _id: 'test user id', displayName: 'test displayName', service: 'github' }]);
  });

  test('will respond with error if get is rejected', async () => {
    const req = {
      params: {
        search: 'a user',
      },
      user,
    };
    users.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await searchUsers(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});
