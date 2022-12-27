const user = {
  twitter: {
    id: 'twitter test id',
    displayName: 'tester-twitter',
  },
  google: {},
  github: {},
};
const rawPinsStub = [{
  _id: '1',
  imgDescription: 'description-1',
  imgLink: 'https://stub-1',
  owner: { id: 'twitter test id', name: 'tester-twitter', service: 'twitter' },
  savedBy: [{ id: 'google test id', name: 'tester-google', service: 'google' }],
  comments: [{
    _id: 'comment-Id-1',
    userId: 'google test id',
    displayName: 'tester-google',
    createdAt: 'today',
    comment: 'unit tests',
  }],
}, {
  _id: '2',
  imgDescription: 'description-2',
  imgLink: 'https://stub-2',
  owner: { id: 'google test id', name: 'tester-google', service: 'google' },
  savedBy: [{ id: 'twitter test id', name: 'tester-twitter', service: 'twitter' }],
  comments: [{
    _id: 'comment-Id-1',
    userId: 'google test id',
    displayName: 'tester-google',
    createdAt: 'today',
    comment: 'unit tests',
  }],
}, {
  _id: '3',
  imgDescription: 'description-3',
  imgLink: 'https://stub-3',
  owner: { id: 'another test id', name: 'tester-another', service: 'other-service' },
  savedBy: [{ id: 'another test id', name: 'tester-another', service: 'other-service' }],
  comments: [{
    _id: 'comment-Id-1',
    userId: 'google test id',
    displayName: 'tester-google',
    createdAt: 'today',
    comment: 'unit tests',
  }],
}];

const allPinsResponse = [
  {
    _id: '1',
    imgDescription: 'description-1',
    imgLink: 'https://stub-1',
    owner: { userId: 'twitter test id', name: 'tester-twitter', service: 'twitter' },
    savedBy: [{ userId: 'google test id', name: 'tester-google', service: 'google' }],
    owns: true,
    hasSaved: false,
    comments: [{
      _id: 'comment-Id-1',
      displayName: 'tester-google',
      createdAt: 'today',
      comment: 'unit tests',
    }],
  },
  {
    _id: '2',
    imgDescription: 'description-2',
    imgLink: 'https://stub-2',
    owner: { userId: 'google test id', name: 'tester-google', service: 'google' },
    savedBy: [{ userId: 'twitter test id', name: 'tester-twitter', service: 'twitter' }],
    owns: false,
    hasSaved: true,
    comments: [{
      _id: 'comment-Id-1',
      displayName: 'tester-google',
      createdAt: 'today',
      comment: 'unit tests',
    }],
  },
  {
    _id: '3',
    imgDescription: 'description-3',
    imgLink: 'https://stub-3',
    owner: { userId: 'another test id', name: 'tester-another', service: 'other-service' },
    savedBy: [{ userId: 'another test id', name: 'tester-another', service: 'other-service' }],
    owns: false,
    hasSaved: false,
    comments: [{
      _id: 'comment-Id-1',
      displayName: 'tester-google',
      createdAt: 'today',
      comment: 'unit tests',
    }],
  },
];

module.exports = {
  user, rawPinsStub, allPinsResponse,
};
