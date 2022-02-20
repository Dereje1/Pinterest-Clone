const { filterPins } = require('../../server/utils');

describe('filtering pins before returning to client', () => {
  process.env = {
    ...process.env,
    ADMIN_USER_ID: 'xxx',
  };
  const user = {
    twitter: {
      id: 'twitter test id',
    },
    google: {},
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
    expect(filterPins(rawPins, user)).toStrictEqual(
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
    expect(filterPins(rawPins, user)).toStrictEqual(
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
    expect(filterPins([rawPinsStub], user)).toStrictEqual(
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
    expect(filterPins([rawPinsStub], user)).toStrictEqual(
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
