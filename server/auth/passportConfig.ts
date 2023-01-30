/* eslint-disable import/no-import-module-exports */
import { PassportStatic } from 'passport';
import { services } from '../interfaces';

// config/passport.js for twitter
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const { getApiKeys } = require('../utils');
// load up the user model
const User = require('../models/user');

interface emailsType {
  value: string
}

interface profileType {
  provider: string
  id: string
  displayName: string
  username: string | undefined
  emails: emailsType[]
}

interface userType {
    displayName: string,
    username: string,
    id: string
}

type doneType = (err: unknown | null, user: userType | undefined) => void;

const processLogin = async (
  token: string,
  tokenSecret: string,
  profile: profileType,
  done: doneType,
) => {
  const {
    provider, id, username, displayName, emails,
  } = profile;
  try {
    const user = await User.findOne({ [`${provider}.id`]: id }).exec();
    if (user) {
      return done(null, user);
    }
    const newUser = await User.create({
      [provider]: {
        id,
        token,
        username: username || emails[0].value,
        displayName,
      },
    });
    return done(null, newUser);
  } catch (error) {
    return done(error, undefined);
  }
};

const passportConfig = (passport: PassportStatic) => {
  const strategyMap = {
    twitter: TwitterStrategy,
    google: GoogleStrategy,
    github: GitHubStrategy,
  };
  const { keys } = getApiKeys();

  // used to serialize the user for the session
  passport.serializeUser((user: { id?: number }, done) => {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err: unknown, user: { id?: number }) => {
      done(err, user);
    });
  });

  Object.keys(strategyMap).forEach((service) => {
    const apiKeys = keys[`${service}ApiKeys`];
    if (apiKeys) {
      passport.use(new strategyMap[service as keyof services](apiKeys, processLogin));
    }
  });
};
module.exports = { passportConfig, processLogin };
