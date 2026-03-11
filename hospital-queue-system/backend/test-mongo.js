import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/hospital_queue', { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR: Failed to connect to MongoDB');
    console.error(err.message);
    process.exit(1);
  });
