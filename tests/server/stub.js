const user = {
  _id: '5cad310f7672ca00146485a8',
  userId: 'twitter test id',
  displayName: 'tester-twitter',
  username: 'twitter-user-name',
  token: 'stub -token',
  service: 'twitter',
};

const rawPinsStub = [{
  _id: '1',
  imgDescription: 'description-1',
  imgLink: 'https://stub-1',
  owner: { _id: '5cad310f7672ca00146485a8', displayName: 'tester-twitter', service: 'twitter' },
  savedBy: [{ id: 'google test id', name: 'tester-google', service: 'google' }],
  comments: [{
    _id: 'comment-Id-1',
    userId: 'google test id',
    displayName: 'tester-google',
    createdAt: 'today',
    comment: 'unit tests',
  }],
  tags: [{ _id: 'tag_id_1', tag: 'tag 1' }, { _id: 'tag_id_2', tag: 'tag 2' }],
}, {
  _id: '2',
  imgDescription: 'description-2',
  imgLink: 'https://stub-2',
  owner: { _id: 'google test id', displayName: 'tester-google', service: 'google' },
  savedBy: [{ id: '5cad310f7672ca00146485a8', name: 'tester-twitter', service: 'twitter' }],
  comments: [{
    _id: 'comment-Id-1',
    userId: 'google test id',
    displayName: 'tester-google',
    createdAt: 'today',
    comment: 'unit tests',
  }],
  tags: [{ _id: 'tag_id_1', tag: 'tag 1' }],
}, {
  _id: '3',
  imgDescription: 'description-3',
  imgLink: 'https://stub-3',
  owner: { _id: 'another test id', displayName: 'tester-another', service: 'other-service' },
  savedBy: [{ id: 'another test id', name: 'tester-another', service: 'other-service' }],
  comments: [{
    _id: 'comment-Id-1',
    userId: 'google test id',
    displayName: 'tester-google',
    createdAt: 'today',
    comment: 'unit tests',
  }],
  tags: [],
}];

const allPinsResponse = [
  {
    _id: '1',
    imgDescription: 'description-1',
    imgLink: 'https://stub-1',
    owner: { userId: '5cad310f7672ca00146485a8', name: 'tester-twitter', service: 'twitter' },
    savedBy: [{ userId: 'google test id', name: 'tester-google', service: 'google' }],
    owns: true,
    hasSaved: false,
    comments: [{
      _id: 'comment-Id-1',
      displayName: 'tester-google',
      createdAt: 'today',
      comment: 'unit tests',
      userId: 'google test id',
    }],
    tags: [{ _id: 'tag_id_1', tag: 'tag 1' }, { _id: 'tag_id_2', tag: 'tag 2' }],
  },
  {
    _id: '2',
    imgDescription: 'description-2',
    imgLink: 'https://stub-2',
    owner: { userId: 'google test id', name: 'tester-google', service: 'google' },
    savedBy: [{ userId: '5cad310f7672ca00146485a8', name: 'tester-twitter', service: 'twitter' }],
    owns: false,
    hasSaved: true,
    comments: [{
      _id: 'comment-Id-1',
      displayName: 'tester-google',
      createdAt: 'today',
      comment: 'unit tests',
      userId: 'google test id',
    }],
    tags: [{ _id: 'tag_id_1', tag: 'tag 1' }],
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
      userId: 'google test id',
    }],
    tags: [],
  },
];

module.exports = {
  user, rawPinsStub, allPinsResponse,
};
