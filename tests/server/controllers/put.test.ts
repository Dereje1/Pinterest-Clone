import { Response } from 'express';
import { Types } from 'mongoose';
import {
  pinImage,
  addComment,
  unpin,
  updateTags,
  updateDisplayName,
  getDuplicateError,
} from '../../../server/controllers/put';
import pins from '../../../server/models/pins'; // schema for pins
import users from '../../../server/models/user';
import savedTags from '../../../server/models/tags';
import pinLinks from '../../../server/models/pinlinks';
import {
  user, rawPinsStub, allPinsResponse,
} from '../stub';
import { genericRequest } from '../interfaces';
import { PopulatedPinType } from '../../../server/interfaces';

/* Mongoose mocks */
const setupMocks = (response: PopulatedPinType[] | unknown = rawPinsStub) => {
  pins.findById = jest.fn().mockImplementation(
    () => ({
      exec: jest.fn().mockResolvedValue(response),
    }),
  );
};

describe('Pinning an image', () => {
  let res:{
    json: jest.Mock,
    end: jest.Mock
  };
  let mockedFindById: jest.Mock;
  let mockedFindByIdAndUpdate: jest.Mock;
  const req = {
    user,
    body: {
      name: 'tester-twitter',
      service: 'twitter',
      id: user._id,
    },
    params: { _id: '3' },
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
  });
  afterEach(() => {
    jest.restoreAllMocks();
    res.end.mockClear();
  });

  test('will pin an image', async () => {
    const newSavedBy = [
      ...rawPinsStub[2].savedBy,
      { _id: req.body.id, displayName: req.body.name, service: req.body.service },
    ];

    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ ...rawPinsStub[2], savedBy: newSavedBy }),
        })),
      }),
    );
    mockedFindByIdAndUpdate = jest.mocked(pins.findByIdAndUpdate);
    setupMocks(rawPinsStub[2]);
    await pinImage(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('3');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      '3',
      {
        $set:
                  {
                    savedBy: [
                      { _id: 'another test id', displayName: 'tester-another', service: 'other-service' },
                      Types.ObjectId(user._id),
                    ],
                  },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({
      ...allPinsResponse[2],
      savedBy: newSavedBy.map(({ displayName, _id, service }) => (
        { name: displayName, userId: _id, service }
      )),
      hasSaved: true,
    });
    expect(res.end).toHaveBeenCalledTimes(0);
    mockedFindByIdAndUpdate.mockClear();
  });

  test('will end response if pin not found in db', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({}),
        })),
      }),
    );
    mockedFindById = jest.mocked(pins.findById);
    await pinImage(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('3');
    expect(pins.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
    mockedFindById.mockClear();
  });

  test('will end response if updatedpin not returned from db', async () => {
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(null),
        })),
      }),
    );
    mockedFindByIdAndUpdate = jest.mocked(pins.findByIdAndUpdate);
    setupMocks(rawPinsStub[2]);
    await pinImage(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('3');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
    mockedFindByIdAndUpdate.mockClear();
  });

  test('will not pin an image if user has already pinned', async () => {
    const newSavedBy = [...rawPinsStub[2].savedBy, req.user._id];
    setupMocks({ ...rawPinsStub[2], savedBy: newSavedBy });
    await pinImage(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('3');
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  test('will respond with error if PUT is rejected', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await pinImage(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Unpinning an image', () => {
  let res:{
    json: jest.Mock,
    end: jest.Mock
  };
  const req = {
    user,
    params: { _id: '1' },
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
    const updatedReq = { ...req, params: { _id: '2' } };
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1], savedBy: [] }),
        })),
      }),
    );
    const mockedFindByIdAndUpdate = jest.mocked(pins.findByIdAndUpdate);

    setupMocks({ ...rawPinsStub[1], savedBy: ['5cad310f7672ca00146485a8'] });
    await unpin(updatedReq as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('2');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      '2',
      {
        $set:
                  {
                    savedBy: [],
                  },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({ ...allPinsResponse[1], savedBy: [], hasSaved: false });
    mockedFindByIdAndUpdate.mockClear();
  });

  test('will end response if pin not found in db', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );

    await unpin(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  test('will end response if updatedpin not returned from db', async () => {
    const updatedReq = { ...req, params: { _id: '2' } };
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(null),
        })),
      }),
    );

    setupMocks(rawPinsStub[1]);
    await unpin(updatedReq as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('2');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  test('will respond with error if PUT is rejected', async () => {
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await unpin(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Adding a comment', () => {
  let res:{
    json: jest.Mock,
    end: jest.Mock
  };
  const req = {
    user,
    body: {
      comment: 'a new comment',
    },
    params: { _id: '3' },
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
      user: {
        _id: 'mongo_twitter test id',
        displayName: 'tester-twitter',
      },
      createdAt: 'today',
      comment: 'a new comment',
    };

    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({
            ...rawPinsStub[2],
            comments: [...rawPinsStub[2].comments, newCommentResponseStub],
          }),
        })),
      }),
    );

    setupMocks(rawPinsStub[2]);
    await addComment(req as genericRequest, res as unknown as Response);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      '3',
      {
        $push:
                  {
                    comments: {
                      user: Types.ObjectId('5cad310f7672ca00146485a8'),
                      comment: 'a new comment',
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
          userId: 'google test id',
        },
        {
          _id: 'comment-Id-2',
          displayName: 'tester-twitter',
          comment: 'a new comment',
          createdAt: 'today',
          userId: 'mongo_twitter test id',
        },
      ],
      tags: [],
    });
    expect(res.end).toHaveBeenCalledTimes(0);
  });

  test('will end response if updatedpin not returned from db', async () => {
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(null),
        })),
      }),
    );

    setupMocks(rawPinsStub[2]);
    await addComment(req as genericRequest, res as unknown as Response);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  test('will respond with error if PUT is rejected', async () => {
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
        })),
      }),
    );
    await addComment(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Updating tags for a pin', () => {
  let res:{
    json: jest.Mock,
    end: jest.Mock
  };
  beforeEach(() => {
    res = { json: jest.fn(), end: jest.fn() };
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'xxx',
    };
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('will add a tag to a pin', async () => {
    const req = {
      user,
      query: { pinID: '1', tag: 'a new tag' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ owner: '5cad310f7672ca00146485a8' }),
      }),
    );
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1] }),
        })),
      }),
    );
    savedTags.create = jest.fn().mockResolvedValue([]);
    await updateTags(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
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
      query: { pinID: '1', deleteId: '12345' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({
          owner: '5cad310f7672ca00146485a8',
          tags: [{ _id: 12345 }, { _id: 123456 }],
        }),
      }),
    );
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1] }),
        })),
      }),
    );
    const mockedFindByIdAndUpdate = jest.mocked(pins.findByIdAndUpdate);
    await updateTags(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      {
        $set:
                  {
                    tags: [{ _id: 123456 }],
                  },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({ ...allPinsResponse[1] });
    mockedFindByIdAndUpdate.mockClear();
  });

  test('will reset all tags for a pin', async () => {
    const req = {
      user,
      query: { pinID: '1' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({
          owner: '5cad310f7672ca00146485a8',
          visionApiTags: ['api-tag -A', 'api-tag -B'],
        }),
      }),
    );
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue({ ...rawPinsStub[1] }),
        })),
      }),
    );
    await updateTags(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(pins.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      {
        $set:
                  {
                    tags: [{ tag: 'api-tag -A' }, { tag: 'api-tag -B' }],
                  },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({ ...allPinsResponse[1] });
  });

  test('will end response if pin not found in db', async () => {
    const req = {
      user,
      query: { pinID: '1', tag: 'a new tag' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );
    savedTags.create = jest.fn().mockResolvedValue([]);
    await updateTags(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(0);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  test('will end response if user is not owner of the pin', async () => {
    const req = {
      user,
      query: { pinID: '1', tag: 'a new tag' },
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
    await updateTags(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
  });

  test('will end response if updatedpin not returned from db', async () => {
    const req = {
      user,
      query: { pinID: '1', tag: 'a new tag' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ owner: '5cad310f7672ca00146485a8' }),
      }),
    );
    pins.findByIdAndUpdate = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(null),
        })),
      }),
    );
    savedTags.create = jest.fn().mockResolvedValue([]);
    await updateTags(req as genericRequest, res as unknown as Response);
    expect(pins.findById).toHaveBeenCalledTimes(1);
    expect(pins.findById).toHaveBeenCalledWith('1');
    expect(pins.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  test('will respond with error if PUT is rejected', async () => {
    const req = {
      user,
      query: { pinID: '1', tag: 'a new tag' },
    };
    pins.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await updateTags(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Updating a display name', () => {
  let res:{
    json: jest.Mock,
    end: jest.Mock
  };
  const req = {
    user,
    body: {
      newDisplayName: 'updated-display-name',
    },
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

  test('will update a display name', async () => {
    const updateOne = jest.fn();
    users.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue({ updateOne }),
      }),
    );
    const mockedFindById = jest.mocked(users.findById);
    await updateDisplayName(req as genericRequest, res as unknown as Response);
    expect(users.findById).toHaveBeenCalledTimes(1);
    expect(users.findById).toHaveBeenCalledWith('5cad310f7672ca00146485a8');
    expect(updateOne).toHaveBeenCalledWith({ $set: { displayName: 'updated-display-name' } });
    expect(res.end).toHaveBeenCalled();
    mockedFindById.mockClear();
  });

  test('will not update if user not found', async () => {
    const updateOne = jest.fn();
    users.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );
    const mockedFindById = jest.mocked(users.findById);
    await updateDisplayName(req as genericRequest, res as unknown as Response);
    expect(users.findById).toHaveBeenCalledTimes(1);
    expect(users.findById).toHaveBeenCalledWith('5cad310f7672ca00146485a8');
    expect(updateOne).not.toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
    mockedFindById.mockClear();
  });

  test('will respond with error if PUT is rejected', async () => {
    users.findById = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await updateDisplayName(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Getting duplicate errors on new pin', () => {
  let res:{
    json: jest.Mock,
  };
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
    await getDuplicateError(req as genericRequest, res as unknown as Response);
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
    await getDuplicateError(req as genericRequest, res as unknown as Response);
    expect(pinLinks.find).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ duplicateError: false });
  });

  test('will respond with error if post is rejected', async () => {
    pinLinks.find = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await getDuplicateError(req as genericRequest, res as unknown as Response);
    expect(res.json).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});
