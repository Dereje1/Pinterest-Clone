const pinsStub = [
  {
    _id: 1,
    imgDescription: 'imgDescription id-1',
    imgLink: 'imgLink id-1',
    owner: { name: 'owner id-1', service: 'google', userId: '1' },
    savedBy: [
      { name: 'savedBy - id-1', service: 'google', userId: '1' },
      { name: 'savedBy - id-1', service: 'github', userId: '1' },
    ],
    owns: false,
    hasSaved: false,
    createdAt: '2020-12-25T00:00:00.000+00:00',
    comments: [
      {
        _id: 'Comment_id_1',
        comment: 'Test comment',
        displayName: 'tester-displayName',
        createdAt: '2021-07-28T16:30:48.572Z',
      },
    ],
  },
  {
    _id: 2,
    imgDescription: 'imgDescription id-2',
    imgLink: 'imgLink id-2',
    owner: { name: 'owner id-2', service: 'twitter', userId: '2' },
    savedBy: [
      { name: 'savedBy - id-2', service: 'google', userId: '2' },
      { name: 'savedBy - id-2git', service: 'github', userId: '2' },
    ],
    owns: false,
    hasSaved: true,
    createdAt: '2020-12-25T00:00:00.000+00:00',
    comments: [],
  },
  {
    _id: 3,
    imgDescription: 'imgDescription id-3',
    imgLink: 'imgLink id-3',
    owner: { name: 'owner id-3', service: 'github', userId: '3' },
    savedBy: [
      { name: 'savedBy - id-3', service: 'google', userId: '3' },
      { name: 'savedBy - id-3', service: 'github', userId: '3' },
    ],
    owns: true,
    hasSaved: false,
    createdAt: '2020-12-25T00:00:00.000+00:00',
    comments: [],
  },
];

module.exports = { pinsStub };
