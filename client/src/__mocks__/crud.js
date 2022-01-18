const { pinsStub } = require('../../../tests/client/pinsStub')

const restMock = jest.fn().mockImplementation((...args) => {
    const [callInfo] = args
    const { address, method = 'get', payload = null } = callInfo
    if (address.includes('/api/?type=All') && method === 'get' && !payload) {
        return Promise.resolve(pinsStub);
    } else if (address.includes('/api/broken') && method === 'get' && !payload) {
        return Promise.resolve([]);
    } else if (address.includes('/api/') && method === 'put' && Boolean(payload)) {
        return Promise.resolve([]);
    } else {
        return Promise.reject(new Error(`Requested method:${method} and path: ${address} not mocked!!`))
    }
});

export default restMock;

