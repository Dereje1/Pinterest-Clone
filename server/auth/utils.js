const getApiKeys = () => {
  const {
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    TWITTER_CALLBACK,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK,
  } = process.env;

  const keys = {
    twitterApiKeys: null,
    googleApiKeys: null,
  };

  if (TWITTER_CONSUMER_KEY && TWITTER_CONSUMER_SECRET && TWITTER_CALLBACK) {
    keys.twitterApiKeys = {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: TWITTER_CALLBACK,
    };
  }
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK) {
    keys.googleApiKeys = {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK,
    };
  }

  console.log({
    apiKeysFound: {
      twitter: Boolean(keys.twitterApiKeys),
      google: Boolean(keys.googleApiKeys),
    },
  });

  return keys;
};

module.exports = { getApiKeys };
