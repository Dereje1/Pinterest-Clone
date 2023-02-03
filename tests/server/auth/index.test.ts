import { Express } from 'express';
import authConfig from '../../../server/auth/index';

test('Will initialize passport, set routes and use in the app', () => {
  const mockedUse = jest.fn();
  const app = {
    use: mockedUse,
    get: jest.fn(),
  } as any as Express;

  authConfig(app);
  const [[passportInitialize], [passportSession]] = mockedUse.mock.calls;
  expect(passportInitialize.name).toBe('initialize');
  expect(passportSession.name).toBe('authenticate');
});
