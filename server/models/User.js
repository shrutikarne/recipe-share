/**
 * User model schema
 * Represents a registered user in the Recipe Share app
 */
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User's display name
  email: { type: String, required: true, unique: true }, // User's email (unique)
  password: { type: String, required: true }, // Hashed password
  avatar: { type: String, default: "" }, // Optional avatar URL
});

module.exports = mongoose.model("User", UserSchema);
