const getApiKeys = (authType) => {
  const {
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    TWITTER_CALLBACK,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK,
  } = process.env;
  if (authType === 'twitter' && TWITTER_CONSUMER_KEY && TWITTER_CONSUMER_SECRET && TWITTER_CALLBACK) {
    return {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: TWITTER_CALLBACK,
    };
  } if (authType === 'google' && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK) {
    return {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK,
    };
  }
  console.log(`Missing API keys for --> ${authType}`);
  return null;
};

module.exports = { getApiKeys };
