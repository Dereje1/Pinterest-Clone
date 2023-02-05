import {
  setAuthRoutes, getProfile, logOut, setGuest,
} from '../../../server/auth/routes';
import { user } from '../stub';

describe('Authentication routes', () => {
  let req; let
    res;
  beforeEach(() => {
    req = {
      user,
      logout: jest.fn(),
    };
    res = {
      json: jest.fn(),
      redirect: jest.fn(),
    };
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('will get the profile for a user', () => {
    getProfile(req, res);
    expect(res.json).toHaveBeenCalledWith({
      authenticated: true,
      userIp: expect.any(String),
      username: 'twitter-user-name',
      userId: 'mongo_twitter test id',
      displayName: 'tester-twitter',
      service: 'twitter',
      isAdmin: false,
    });
  });

  test('will set a user as guest', () => {
    setGuest(req, res);
    expect(res.json).toHaveBeenCalledWith({
      authenticated: false,
      userIp: expect.any(String),
      username: 'Guest',
      displayName: 'Guest',
      providers: {
        twitter: false,
        google: false,
        github: false,
      },
    });
  });

  test('will log a user out', () => {
    logOut(req, res);
    expect(req.logout).toHaveBeenCalled();
    const [[logoutCallback]] = req.logout.mock.calls;
    logoutCallback();
    expect(res.redirect).toHaveBeenCalledWith('/');
  });
});

describe('The app will', () => {
  let app; let
    passport;
  beforeEach(() => {
    app = {
      get: jest.fn(),
    };
    passport = {
      authenticate: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('set the auth routes', () => {
    setAuthRoutes(app, passport);
    const allowedRoutes = app.get.mock.calls.map((r) => r[0]);
    expect(allowedRoutes).toEqual([
      '/auth/profile',
      '/auth/guest',
      '/auth/logout',
      '/auth/twitter',
      '/auth/google',
      '/auth/github',
      '/auth/twitter/redirect',
      '/auth/google/redirect',
      '/auth/github/redirect',
    ]);
    expect(passport.authenticate).toHaveBeenCalledTimes(6);
    expect(passport.authenticate.mock.calls[0]).toEqual(['twitter', {}]);
    expect(passport.authenticate.mock.calls[1]).toEqual(['google', { scope: ['profile', 'email'] }]);
    expect(passport.authenticate.mock.calls[2]).toEqual(['github', {}]);
    expect(passport.authenticate.mock.calls[3]).toEqual(['twitter', {
      successRedirect: '/pins',
      failureRedirect: '/',
    }]);
    expect(passport.authenticate.mock.calls[4]).toEqual(['google', {
      successRedirect: '/pins',
      failureRedirect: '/',
    }]);
    expect(passport.authenticate.mock.calls[5]).toEqual(['github', {
      successRedirect: '/pins',
      failureRedirect: '/',
    }]);
  });
});
