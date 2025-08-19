/**
 * Connects to MongoDB using Mongoose
 * Exits the process if connection fails
 */
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    // Log error and exit if connection fails
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = connectDB;
