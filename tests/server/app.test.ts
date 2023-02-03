import request from 'supertest';
import app from '../../server/app';

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
