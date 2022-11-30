import isloggedin from '../../../server/auth/isloggedin';

describe('isLoggedIn middleware', () => {
  test('will not continue with the request if the user is not logged in', () => {
    const res = {
      json: jest.fn(),
    };
    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    const next = jest.fn();
    const result = isloggedin(req, res, next);
    expect(res.json).toHaveBeenCalledWith({
      authenticated: false,
      displayName: null,
      userIp: expect.any(String),
      username: null,
      providers: {
        twitter: false,
        google: false,
        github: false,
      },
    });
    expect(result).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });

  test('will continue with the request if user is logged in', () => {
    const res = {
      json: jest.fn(),
    };
    const req = {
      isAuthenticated: jest.fn(() => true),
    };
    const next = jest.fn();
    isloggedin(req, res, next);
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
