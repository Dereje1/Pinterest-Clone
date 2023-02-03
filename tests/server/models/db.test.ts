/* eslint-disable import/first */
process.env = {
  ...process.env,
  MONGOLAB_URI: 'TEST_MONGO_URI',
};
import * as mongoose from 'mongoose';
import connect from '../../../server/models/db';

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  connect: jest.fn(),
  connection: {
    on: jest.fn(),
  },
}));

describe('Mongo db', () => {
  test('will connect', () => {
    connect();
    expect(mongoose.connect).toHaveBeenCalledWith(
      'TEST_MONGO_URI',
      { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
    );
  });
  test('will invoke connection processes', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let connectionProcesses = mongoose.default.connection.on.mock.calls;
    connectionProcesses = connectionProcesses.map((c) => c[0]);
    expect(connectionProcesses).toEqual(['connected', 'error', 'disconnected']);
  });
});
