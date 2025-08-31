/**
 * Connects to MongoDB using Mongoose
 * Exits the process if connection fails
 */
const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    // Log error and exit if connection fails
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = connectDB;
