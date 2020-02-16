// create one place for db connection
// Bring Mongoose into the app
const mongoose = require('mongoose');

// Build the connection string
// const dbURI = 'mongodb://localhost:27017/votingapp';
const dbURI = process.env.MONGOLAB_URI;
mongoose.Promise = global.Promise;
// Create the database connection
mongoose.connect(dbURI, { useUnifiedTopology: true, useNewUrlParser: true });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  console.log(`Mongoose default connection open to ${dbURI}`);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose default connection error:  ${err}`);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
