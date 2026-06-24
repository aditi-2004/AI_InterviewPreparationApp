// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI;
  const fallbackURI = 'mongodb://127.0.0.1:27017/ai-interview';
  
  if (primaryURI) {
    try {
      console.log('Attempting to connect to primary MongoDB Atlas...');
      await mongoose.connect(primaryURI, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB Connected to Atlas');
      return;
    } catch (error) {
      console.error(`MongoDB Atlas connection failed: ${error.message}`);
      console.log('Falling back to local MongoDB database...');
    }
  }

  try {
    await mongoose.connect(fallbackURI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected locally to: ${fallbackURI}`);
  } catch (error) {
    console.error(`Local MongoDB connection failed: ${error.message}`);
    console.warn('WARNING: Both Atlas and local database connections failed. The server will start, but database requests will fail.');
  }
};

module.exports = connectDB;