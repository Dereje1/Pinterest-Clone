// create one place for db connection
// Bring Mongoose into the app
import mongoose from 'mongoose';

// Build the connection string

const dbURI = process.env.MONGOLAB_URI || '';

const connect = () => {
  mongoose.Promise = global.Promise;
  // Create the database connection
  mongoose.connect(
    dbURI,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    },
  );
};

// CONNECTION EVENTS
['connected', 'error', 'disconnected'].forEach((status) => {
  mongoose.connection.on(status, (val: string | undefined) => {
    console.log(`Mongoose default connection to ${dbURI} -> ${status} ${val || ''}`);
  });
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
export default connect;
