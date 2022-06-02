const pinsStub = [
  {
    _id: 1,
    imgDescription: 'imgDescription id-1',
    imgLink: 'imgLink id-1',
    owner: 'owner id-1',
    savedBy: [
      'savedBy - id-1',
      'savedBy2 - id-1',
    ],
    owns: false,
    hasSaved: false,
    createdAt: '2020-12-25T00:00:00.000+00:00',
  },
  {
    _id: 2,
    imgDescription: 'imgDescription id-2',
    imgLink: 'imgLink id-2',
    owner: 'owner id-2',
    savedBy: [
      'savedBy - id-2',
      'savedBy2 - id-2',
    ],
    owns: false,
    hasSaved: true,
    createdAt: '2020-12-25T00:00:00.000+00:00',
  },
  {
    _id: 3,
    imgDescription: 'imgDescription id-3',
    imgLink: 'imgLink id-3',
    owner: 'owner id-3',
    savedBy: [
      'savedBy - id-3',
      'savedBy2 - id-3',
    ],
    owns: true,
    hasSaved: false,
    createdAt: '2020-12-25T00:00:00.000+00:00',
  },
];

module.exports = { pinsStub };
