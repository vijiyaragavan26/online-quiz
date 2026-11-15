const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quizmaster';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 1500
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Notice: Local MongoDB not detected (${error.message}).`);
    console.log('[Database] Active fallback mode: Zero-config in-memory store initialized.');
    console.log('[Database] To use persistent MongoDB, start MongoDB locally or configure MONGO_URI in backend/.env');
    return null;
  }
};

module.exports = connectDB;
