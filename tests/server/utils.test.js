const { filterPins, getCloudFrontLink } = require('../../server/utils');

describe('filtering pins before returning to client', () => {
  process.env = {
    ...process.env,
    ADMIN_USER_ID: 'xxx',
  };

  const rawPinsStub = {
    _id: 'mongoose _id',
    imgDescription: 'description',
    imgLink: 'https://stub',
    owner: { name: 'tester', id: 'any id' },
    savedBy: [{ id: 'any id', name: 'tester' }],
    createdAt: 'creation date',
  };

  test('Will filter the pins for the owner', () => {
    const rawPins = [{
      ...rawPinsStub,
      owner: { name: 'tester', id: 'twitter test id' },
    }];
    expect(filterPins({ rawPins, userId: 'twitter test id', isAdmin: false })).toStrictEqual(
      [
        {
          _id: 'mongoose _id',
          hasSaved: false,
          imgDescription: 'description',
          imgLink: 'https://stub',
          owner: 'tester',
          owns: true,
          savedBy: ['tester'],
          createdAt: 'creation date',
        },
      ],
    );
  });

  test('Will filter the pins for the pinner/saver', () => {
    const rawPins = [{
      ...rawPinsStub,
      savedBy: [{ id: 'twitter test id', name: 'tester' }],
    }];
    expect(filterPins({ rawPins, userId: 'twitter test id', isAdmin: false })).toStrictEqual(
      [
        {
          _id: 'mongoose _id',
          hasSaved: true,
          imgDescription: 'description',
          imgLink: 'https://stub',
          owner: 'tester',
          owns: false,
          savedBy: ['tester'],
          createdAt: 'creation date',
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
          owner: 'tester',
          owns: false,
          savedBy: ['tester'],
          createdAt: 'creation date',
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
          owner: 'tester',
          owns: true,
          savedBy: ['tester'],
          createdAt: 'creation date',
        },
      ],
    );
  });
});

describe('Getting the cloudfront links', () => {
  test('Will get the cloud front link for prod bucket', () => {
    const ans = getCloudFrontLink('https://s3.amazonaws.com/pinterest.clone/a-pin');
    expect(ans).toBe('https://d1ttxrulihk8wq.cloudfront.net/a-pin');
  });

  test('Will get original link for non-prod bucket', () => {
    const ans = getCloudFrontLink('https://s3.amazonaws.com/pinterest.clone.dev/a-pin');
    expect(ans).toBe('https://s3.amazonaws.com/pinterest.clone.dev/a-pin');
  });

  test('Will get original link for any split errors', () => {
    const ans = getCloudFrontLink(null);
    expect(ans).toBe(null);
  });
});
