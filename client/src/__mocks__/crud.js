const { pinsStub } = require('../../../tests/client/pinsStub');

const restMock = jest.fn().mockImplementation((...args) => {
  const [callInfo] = args;
  const { address, method = 'get', payload = null } = callInfo;
  if (address.includes('/api/?type=All') && method === 'get' && !payload) {
    return Promise.resolve(pinsStub);
  } if (address.includes('/api/broken') && method === 'get' && !payload) {
    return Promise.resolve([]);
  } if (address.includes('/api/') && method === 'put' && Boolean(payload)) {
    return Promise.resolve([]);
  } if (address.includes('/api/?type=profile') && method === 'get' && !payload) {
    return Promise.resolve([pinsStub[1], pinsStub[2]]);
  } if (address.includes('/api/') && method === 'delete') {
    return Promise.resolve([]);
  } if (address.includes('/api/newpin') && method === 'post') {
    return Promise.resolve({
      savedBy: [],
      owner: { name: 'A new pin by tester' },
      imgLink: 'new link',
      imgDescription: 'new description',
      _id: 10,
    });
  } if (address.includes('/auth/profile') && method === 'get' && !payload) {
    return Promise.resolve({
      authenticated: true,
      userIp: 'Tester userIp',
      username: 'Tester username',
      userId: 'Tester userId',
      displayname: 'Tester displayName',
      service: 'twitter',

    });
  } if (address.includes('/auth/guest') && method === 'get' && !payload) {
    return Promise.resolve({
      authenticated: false,
      userIp: 'Tester userIp',
      username: 'Tester guest',
    });
  }
  return Promise.reject(new Error(`Requested method:${method} and path: ${address} not mocked!!`));
});

export default restMock;
