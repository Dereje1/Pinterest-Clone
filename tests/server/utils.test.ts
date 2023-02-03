import { filterPins, getCloudFrontLink } from '../../server/utils';

describe('filtering pins before returning to client', () => {
  process.env = {
    ...process.env,
    ADMIN_USER_ID: 'xxx',
  };

  const rawPinsStub = {
    _id: 'mongoose _id',
    imgDescription: 'description',
    imgLink: 'https://stub',
    originalImgLink: 'https://stub-original',
    owner: { name: 'tester', id: 'any id', service: 'twitter' },
    savedBy: [{ id: 'any id', name: 'tester', service: 'twitter' }],
    createdAt: 'creation date',
    comments: [{
      _id: 'comment-Id-1',
      displayName: 'tester-google',
      createdAt: 'today',
      comment: 'unit tests',
      userId: 'commenter-userID',
      service: 'twitter',
    }],
    tags: [{ _id: 'tag_id_1', tag: 'tag 1' }, { _id: 'tag_id_2', tag: 'tag 2' }],
  };

  test('Will filter the pins for the owner', () => {
    const rawPins = [{
      ...rawPinsStub,
      owner: { name: 'tester', id: 'twitter test id', service: 'twitter' },
    }];
    expect(filterPins({ rawPins, userId: 'twitter test id', isAdmin: false })).toStrictEqual(
      [
        {
          _id: 'mongoose _id',
          hasSaved: false,
          imgDescription: 'description',
          imgLink: 'https://stub',
          owner: { name: 'tester', userId: 'twitter test id', service: 'twitter' },
          owns: true,
          savedBy: [{ userId: 'any id', name: 'tester', service: 'twitter' }],
          createdAt: 'creation date',
          comments: [{
            _id: 'comment-Id-1',
            displayName: 'tester-google',
            createdAt: 'today',
            comment: 'unit tests',
          }],
          tags: [{ _id: 'tag_id_1', tag: 'tag 1' }, { _id: 'tag_id_2', tag: 'tag 2' }],
        },
      ],
    );
  });

  test('Will filter the pins for the pinner/saver', () => {
    const rawPins = [{
      ...rawPinsStub,
      savedBy: [{ id: 'twitter test id', name: 'tester', service: 'twitter' }],
    }];
    expect(filterPins({ rawPins, userId: 'twitter test id', isAdmin: false })).toStrictEqual(
      [
        {
          _id: 'mongoose _id',
          hasSaved: true,
          imgDescription: 'description',
          imgLink: 'https://stub',
          owner: { name: 'tester', userId: 'any id', service: 'twitter' },
          owns: false,
          savedBy: [{ userId: 'twitter test id', name: 'tester', service: 'twitter' }],
          createdAt: 'creation date',
          comments: [{
            _id: 'comment-Id-1',
            displayName: 'tester-google',
            createdAt: 'today',
            comment: 'unit tests',
          }],
          tags: [{ _id: 'tag_id_1', tag: 'tag 1' }, { _id: 'tag_id_2', tag: 'tag 2' }],
        },
      ],
    );
  });

  test('Will filter the pins for anyone not an owner or pinner', () => {
    expect(filterPins({ rawPins: [rawPinsStub], userId: 'any', isAdmin: false })).toStrictEqual(
      [
        {
          _id: 'mongoose _id',
          hasSaved: false,
          imgDescription: 'description',
          imgLink: 'https://stub',
          owner: { name: 'tester', userId: 'any id', service: 'twitter' },
          owns: false,
          savedBy: [{ userId: 'any id', name: 'tester', service: 'twitter' }],
          createdAt: 'creation date',
          comments: [{
            _id: 'comment-Id-1',
            displayName: 'tester-google',
            createdAt: 'today',
            comment: 'unit tests',
          }],
          tags: [{ _id: 'tag_id_1', tag: 'tag 1' }, { _id: 'tag_id_2', tag: 'tag 2' }],
        },
      ],
    );
  });

  test('Will filter the pins for an admin', () => {
    process.env = {
      ...process.env,
      ADMIN_USER_ID: 'twitter test id',
    };
    expect(filterPins({ rawPins: [rawPinsStub], userId: 'any', isAdmin: true })).toStrictEqual(
      [
        {
          _id: 'mongoose _id',
          hasSaved: false,
          imgDescription: 'description',
          imgLink: 'https://stub',
          owner: { name: 'tester', userId: 'any id', service: 'twitter' },
          owns: true,
          savedBy: [{ userId: 'any id', name: 'tester', service: 'twitter' }],
          createdAt: 'creation date',
          comments: [{
            _id: 'comment-Id-1',
            displayName: 'tester-google',
            createdAt: 'today',
            comment: 'unit tests',
          }],
          tags: [{ _id: 'tag_id_1', tag: 'tag 1' }, { _id: 'tag_id_2', tag: 'tag 2' }],
        },
      ],
    );
  });
});

describe('Getting the cloudfront links', () => {
  test('Will get the cloud front link for prod bucket', () => {
    process.env = {
      ...process.env,
      ENABLE_CLOUDFRONT: 'true',
    };
    const ans = getCloudFrontLink('https://s3.amazonaws.com/pinterest.clone/a-pin');
    expect(ans).toBe('https://d1ttxrulihk8wq.cloudfront.net/a-pin');
  });

  test('Will get original link for non-prod bucket', () => {
    const ans = getCloudFrontLink('https://s3.amazonaws.com/pinterest.clone.dev/a-pin');
    expect(ans).toBe('https://s3.amazonaws.com/pinterest.clone.dev/a-pin');
  });

  test('Will get original link for any other string', () => {
    const ans = getCloudFrontLink('3');
    expect(ans).toBe('3');
  });
});
