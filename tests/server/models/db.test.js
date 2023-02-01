const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    on: jest.fn(),
  },
}));
process.env = {
  ...process.env,
  MONGOLAB_URI: 'TEST_MONGO_URI',
};
const connect = require('../../../server/models/db').default;

describe('Mongo db', () => {
  test('will connect', () => {
    connect();
    expect(mongoose.connect).toHaveBeenCalledWith(
      'TEST_MONGO_URI',
      { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
    );
  });
  test('will invoke connection processes', () => {
    let connectionProcesses = mongoose.connection.on.mock.calls;
    connectionProcesses = connectionProcesses.map((c) => c[0]);
    expect(connectionProcesses).toEqual(['connected', 'error', 'disconnected']);
  });
});
