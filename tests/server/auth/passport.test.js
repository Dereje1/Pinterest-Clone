const user = require('../../../server/models/user');
const { processLogin, passportConfig } = require('../../../server/auth/passportConfig');

describe('Processing a login', () => {
  let done;

  const googleUserModel = {
    google: {
      displayName: 'tester-google',
      id: 'google test id',
      token: 'anytoken',
      username: 'tester@abc.com',
    },
  };
  const googleProfile = {
    provider: 'google',
    id: 'google test id',
    displayName: 'tester-google',
    username: undefined,
    emails: [{ value: 'tester@abc.com' }],
  };

  beforeEach(() => {
    done = jest.fn();

    user.findOne = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(null),
      }),
    );
    user.create = jest.fn().mockImplementationOnce(
      () => jest.fn().mockResolvedValueOnce(null),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('will create a google user if not found in the db', async () => {
    await processLogin('anytoken', '', googleProfile, done);
    expect(user.findOne).toHaveBeenCalledTimes(1);
    expect(user.findOne).toHaveBeenCalledWith({ 'google.id': 'google test id' });
    expect(user.create).toHaveBeenCalledTimes(1);
    expect(user.create).toHaveBeenCalledWith(googleUserModel);
    expect(done).toHaveBeenCalledTimes(1);
  });

  test('will create a twitter user if not found in the db', async () => {
    const twitterUserModel = {
      twitter: {
        displayName: 'tester-twitter',
        id: 'twitter test id',
        token: 'anytoken',
        username: 'test username',
      },
    };
    const twitterProfile = {
      provider: 'twitter',
      id: 'twitter test id',
      displayName: 'tester-twitter',
      username: 'test username',
      emails: undefined,
    };

    await processLogin('anytoken', '', twitterProfile, done);
    expect(user.findOne).toHaveBeenCalledTimes(1);
    expect(user.findOne).toHaveBeenCalledWith({ 'twitter.id': 'twitter test id' });
    expect(user.create).toHaveBeenCalledTimes(1);
    expect(user.create).toHaveBeenCalledWith(twitterUserModel);
    expect(done).toHaveBeenCalledTimes(1);
  });

  test('will create a github user if not found in the db', async () => {
    const githubUserModel = {
      github: {
        displayName: 'tester-github',
        id: 'github test id',
        token: 'anytoken',
        username: 'test username',
      },
    };
    const githubProfile = {
      provider: 'github',
      id: 'github test id',
      displayName: 'tester-github',
      username: 'test username',
      emails: undefined,
    };

    await processLogin('anytoken', '', githubProfile, done);
    expect(user.findOne).toHaveBeenCalledTimes(1);
    expect(user.findOne).toHaveBeenCalledWith({ 'github.id': 'github test id' });
    expect(user.create).toHaveBeenCalledTimes(1);
    expect(user.create).toHaveBeenCalledWith(githubUserModel);
    expect(done).toHaveBeenCalledTimes(1);
  });

  test('will not create a user if found in the db', async () => {
    user.findOne.mockClear();
    user.findOne = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(googleUserModel),
      }),
    );

    await processLogin('anytoken', '', googleProfile, done);
    expect(user.findOne).toHaveBeenCalledTimes(1);
    expect(user.findOne).toHaveBeenCalledWith({ 'google.id': 'google test id' });
    expect(user.create).not.toHaveBeenCalled();
    expect(user.create).not.toHaveBeenCalled();
    expect(done).toHaveBeenCalledWith(null, googleUserModel);
  });

  test('will respond with error if login can not be processed', async () => {
    user.findOne = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      }),
    );
    await processLogin('anytoken', '', googleProfile, done);
    expect(done).toHaveBeenCalledWith(Error('Mocked rejection'));
  });
});

describe('Configuring passport', () => {
  const passport = {
    serializeUser: jest.fn(() => jest.fn()),
    deserializeUser: jest.fn(),
    use: jest.fn(),
  };
  afterEach(() => {
    passport.use.mockClear();
    passport.serializeUser.mockClear();
    passport.deserializeUser.mockClear();
  });
  test('will succeed for twitter', () => {
    process.env = {
      ...process.env,
      TWITTER_CONSUMER_KEY: ' ',
      TWITTER_CONSUMER_SECRET: ' ',
      TWITTER_CALLBACK: ' ',
    };

    passportConfig(passport);
    expect(passport.serializeUser).toHaveBeenCalledTimes(1);
    expect(passport.deserializeUser).toHaveBeenCalledTimes(1);
    expect(passport.use).toHaveBeenCalledTimes(1);
    expect(passport.use.mock.calls[0][0].name).toBe('twitter');
  });
  test('will succeed for google', () => {
    process.env = {
      ...process.env,
      TWITTER_CONSUMER_KEY: undefined,
      GOOGLE_CLIENT_ID: '123',
      GOOGLE_CLIENT_SECRET: '123',
      GOOGLE_CALLBACK: '123',
    };
    passportConfig(passport);
    expect(passport.serializeUser).toHaveBeenCalledTimes(1);
    expect(passport.deserializeUser).toHaveBeenCalledTimes(1);
    expect(passport.use).toHaveBeenCalledTimes(1);
    expect(passport.use.mock.calls[0][0].name).toBe('google');
  });
  test('will succeed for github', () => {
    process.env = {
      ...process.env,
      TWITTER_CONSUMER_KEY: undefined,
      GOOGLE_CLIENT_ID: undefined,
      GITHUB_CLIENT_ID: '123',
      GITHUB_CLIENT_SECRET: '123',
      GITHUB_CALLBACK: '123',
    };
    passportConfig(passport);
    expect(passport.serializeUser).toHaveBeenCalledTimes(1);
    expect(passport.deserializeUser).toHaveBeenCalledTimes(1);
    expect(passport.use).toHaveBeenCalledTimes(1);
    expect(passport.use.mock.calls[0][0].name).toBe('github');
  });
  test('will not succeed if API keys are missing', () => {
    process.env = {
      ...process.env,
      TWITTER_CONSUMER_KEY: undefined,
      GOOGLE_CLIENT_ID: undefined,
      GITHUB_CLIENT_ID: undefined,
    };
    passportConfig(passport);
    expect(passport.serializeUser).toHaveBeenCalledTimes(1);
    expect(passport.deserializeUser).toHaveBeenCalledTimes(1);
    expect(passport.use).not.toHaveBeenCalled();
  });
});
