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
  owner: { id: 'twitter test id', name: 'tester-twitter' },
  savedBy: [{ id: 'google test id', name: 'tester-google' }],
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
  owner: { id: 'google test id', name: 'tester-google' },
  savedBy: [{ id: 'twitter test id', name: 'tester-twitter' }],
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
  owner: { id: 'another test id', name: 'tester-another' },
  savedBy: [{ id: 'another test id', name: 'tester-another' }],
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
    owner: 'tester-twitter',
    savedBy: ['tester-google'],
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
    owner: 'tester-google',
    savedBy: ['tester-twitter'],
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
    owner: 'tester-another',
    savedBy: ['tester-another'],
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
