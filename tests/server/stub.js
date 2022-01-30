const user = {
  twitter: {
    id: 'twitter test id',
    displayName: 'tester-twitter',
  },
  google: {},
};
const rawPinsStub = [{
  _id: '1',
  imgDescription: 'description-1',
  imgLink: 'https://stub-1',
  owner: { id: 'twitter test id', name: 'tester-twitter' },
  savedBy: [{ id: 'google test id', name: 'tester-google' }],
}, {
  _id: '2',
  imgDescription: 'description-2',
  imgLink: 'https://stub-2',
  owner: { id: 'google test id', name: 'tester-google' },
  savedBy: [{ id: 'twitter test id', name: 'tester-twitter' }],
}, {
  _id: '3',
  imgDescription: 'description-3',
  imgLink: 'https://stub-3',
  owner: { id: 'another test id', name: 'tester-another' },
  savedBy: [{ id: 'another test id', name: 'tester-another' }],
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
  },
  {
    _id: '2',
    imgDescription: 'description-2',
    imgLink: 'https://stub-2',
    owner: 'tester-google',
    savedBy: ['tester-twitter'],
    owns: false,
    hasSaved: true,
  },
  {
    _id: '3',
    imgDescription: 'description-3',
    imgLink: 'https://stub-3',
    owner: 'tester-another',
    savedBy: ['tester-another'],
    owns: false,
    hasSaved: false,
  },
];

const goodPinTemplate = {
  _id: '456',
  imgLink: 'https://goodpin.com/',
  imgDescription: 'mock image',
};

const badPinTemplate = {
  _id: '123',
  imgLink: 'https://badpin.com/',
  imgDescription: 'mock image',
};

const scanStub = {
  updatePinsModel: {
    goodPin: [{
      _id: {
        $in: [{
          ...goodPinTemplate,
          statusCode: 200,
          statusMessage: null,
        }],
      },
    }, { isBroken: false }],
    brokenPin: [{
      _id: {
        $in: [{
          ...badPinTemplate,
          statusCode: 500,
          statusMessage: null,
        }],
      },
    }, { isBroken: true }],
    brokenPinInvalidURL: [{
      _id: {
        $in: [{
          ...badPinTemplate,
          statusCode: null,
          statusMessage: 'Invalid URL',
          imgLink: 'ABC',
        }],
      },
    }, { isBroken: true }],
    goodPinDataProtocol: [{
      _id: {
        $in: [{
          ...goodPinTemplate,
          statusCode: null,
          statusMessage: 'data protocol',
          imgLink: 'data://abc.com/',
        }],
      },
    }, { isBroken: false }],
  },
  retrievedPinsModel: {
    allPins: [{ ...badPinTemplate }, { ...goodPinTemplate }],
    oneGoodPin: [{ ...goodPinTemplate }],
    oneBadPin: [{ ...badPinTemplate }],
    badURLPin: [{
      ...badPinTemplate,
      imgLink: 'ABC',
    }],
    dataProtocolPin: [{
      ...goodPinTemplate,
      imgLink: 'data://abc.com/',
    }],
  },
  updateBrokenPinsModel: {
    badResponse: {
      broken: [
        {
          ...badPinTemplate,
          statusCode: 500,
          statusMessage: null,
          brokenSince: expect.any(String),
        },
      ],
    },
    badURL: {
      broken: [
        {
          ...badPinTemplate,
          statusCode: null,
          statusMessage: 'Invalid URL',
          brokenSince: expect.any(String),
          imgLink: 'ABC',
        },
      ],
    },
    keepTimeStamp: {
      broken: [
        {
          ...badPinTemplate,
          statusCode: 500,
          statusMessage: null,
          brokenSince: 'over a year ago',
        },
      ],
    },
  },
};

module.exports = {
  user, rawPinsStub, allPinsResponse, badPinTemplate, scanStub,
};
