const authConfig = require('../../../server/auth/index');

test('Will initialize passport, set routes and use in the app', () => {
  const app = {
    use: jest.fn(),
    get: jest.fn(),
  };
  authConfig(app);
  const [[passportInitialize], [passportSession]] = app.use.mock.calls;
  expect(passportInitialize.name).toBe('initialize');
  expect(passportSession.name).toBe('authenticate');
});
