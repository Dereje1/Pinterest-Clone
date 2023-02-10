import request from 'supertest';
// import app from '../../server/app';

jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation(() => ({ Types: { ObjectId: jest.fn() } })),
  model: jest.fn(),
  connect: jest.fn(),
  connection: {
    on: jest.fn(),
  },
}));

xtest('Will load wild card routes', async () => {
  await request().get('/any');
});
