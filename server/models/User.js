/**
 * User model schema
 * Represents a registered user in the Recipe Share app
 */
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User's display name
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  }, // User's email (unique with validation)
  password: { type: String, required: true }, // Hashed password
  avatar: { type: String, default: "" }, // Optional avatar URL
  roles: { type: [String], default: ['user'] }, // User roles (user, admin, etc.)
  refreshTokens: [{ type: String }], // Array of valid refresh tokens
  savedRecipes: [
    {
      recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
      collection: { type: String, default: "General" }, // e.g., "Dinner Ideas"
      savedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true }); // Add createdAt and updatedAt fields

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("User", UserSchema);
