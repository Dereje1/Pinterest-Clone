const { pinsStub } = require('../../../tests/client/pinsStub');

const restMock = jest.fn().mockImplementation((...args) => {
  const [callInfo] = args;
  const { address, method = 'get', payload = null } = callInfo;
  if (address.includes('/api/home') && method === 'get' && !payload) {
    return Promise.resolve(pinsStub);
  } if (address.includes('/api/broken') && method === 'get' && !payload) {
    return Promise.resolve([]);
  } if (address.includes('/api/pin') && method === 'put' && !payload) {
    return Promise.resolve({
      _id: 1,
      savedBy: [{ name: 'tester displayName', userId: 'tester id', service: 'google' }],
    });
  } if (address.includes('/api/unpin') && method === 'put' && !payload) {
    return Promise.resolve({
      _id: 2,
      savedBy: [{ name: 'savedBy - id-2', service: 'google', userId: '2' }],
    });
  } if (address.includes('/api/comment') && method === 'put') {
    return Promise.resolve({
      _id: 2,
      comments: ['tester comment'],
    });
  } if (address.includes('/api/mypins') && method === 'get' && !payload) {
    return Promise.resolve({ profilePins: [pinsStub[1], pinsStub[2]], allPinLinks: [] });
  } if (address.includes('/api/') && method === 'delete') {
    return Promise.resolve([]);
  } if (address.includes('/api/newpin') && method === 'post') {
    return Promise.resolve({
      savedBy: [],
      owner: { name: 'A new pin by tester' },
      imgLink: 's3 new link',
      originalImgLink: 'original new link',
      imgDescription: 'new description',
      _id: 10,
      createdAt: '2022-04-09T17:00:33.212Z',
    });
  } if (address.includes('/auth/profile') && method === 'get' && !payload) {
    return Promise.resolve({
      authenticated: true,
      userIp: 'Tester userIp',
      username: 'Tester username',
      userId: 'Tester userId',
      displayName: 'Tester displayName',
      service: 'twitter',

    });
  } if (address.includes('/auth/guest') && method === 'get' && !payload) {
    return Promise.resolve({
      authenticated: false,
      userIp: 'Tester userIp',
      username: 'Tester guest',
    });
  } if (address.includes('/api/userProfile') && method === 'get' && !payload) {
    return Promise.resolve({
      createdPins: [pinsStub[2]],
      savedPins: [pinsStub[1]],
      user: {
        userId: 'stubId', service: 'twitter', displayName: 'stubName',
      },
    });
  }
  return Promise.reject(new Error(`Requested method:${method} and path: ${address} not mocked!!`));
});

export default restMock;
