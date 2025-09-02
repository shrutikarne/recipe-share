/**
 * Connects to MongoDB using Mongoose
 * Exits the process if connection fails
 */
const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
  console.log('Connecting to MongoDB at', config.MONGO_URI);
  try {
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
