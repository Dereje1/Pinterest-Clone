const request = require('supertest');
const app = require('../../server/app');

jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  connect: jest.fn(),
  connection: {
    on: jest.fn(),
  },
}));

test('Will load wild card routes', async () => {
  await request(app).get('/any');
});
