const mongoose = require('mongoose');
const User = require('../models/User');
const { connectDB, closeDB } = require('./helpers');

describe('User Model', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'https://example.com/avatar.jpg'
    };

    const user = new User(userData);
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    // Password should be hashed
    expect(savedUser.password).not.toBe(userData.password);
    expect(savedUser.avatar).toBe(userData.avatar);
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
    expect(savedUser.roles).toEqual(expect.arrayContaining(['user']));
  });

  it('should fail when email is missing', async () => {
    const userData = {
      name: 'Test User',
      password: 'password123'
    };

    const user = new User(userData);
    let err;
    
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('should fail when name is missing', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    let err;
    
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.name).toBeDefined();
  });

  it('should fail when password is missing', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    };

    const user = new User(userData);
    let err;
    
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should enforce email uniqueness', async () => {
    // Create first user
    const userData = {
      name: 'Test User 1',
      email: 'duplicate@example.com',
      password: 'password123'
    };

    const user1 = new User(userData);
    await user1.save();
    
    // Try to create second user with same email
    const user2 = new User({
      name: 'Test User 2',
      email: 'duplicate@example.com',
      password: 'password456'
    });
    
    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should add a recipe to savedRecipes', async () => {
    const user = new User({
      name: 'Recipe Saver',
      email: 'saver@example.com',
      password: 'password123'
    });
    
    await user.save();
    
    // Add a saved recipe
    const recipeId = new mongoose.Types.ObjectId();
    user.savedRecipes.push({
      recipe: recipeId,
      collection: 'Favorites',
      savedAt: new Date()
    });
    
    await user.save();
    
    // Fetch fresh user
    const updatedUser = await User.findById(user._id);
    
    expect(updatedUser.savedRecipes).toHaveLength(1);
    expect(updatedUser.savedRecipes[0].recipe.toString()).toBe(recipeId.toString());
    expect(updatedUser.savedRecipes[0].collection).toBe('Favorites');
  });

  it('should correctly compare passwords', async () => {
    const plainPassword = 'SecurePassword123!';
    const user = new User({
      name: 'Password Test',
      email: 'password@test.com',
      password: plainPassword
    });
    await user.save();

    // Retrieve user from database
    const retrievedUser = await User.findOne({ email: 'password@test.com' });
    
    // Test correct password
    const isMatch = await retrievedUser.comparePassword(plainPassword);
    expect(isMatch).toBe(true);
    
    // Test wrong password
    const isNotMatch = await retrievedUser.comparePassword('WrongPassword456!');
    expect(isNotMatch).toBe(false);
  });

  it('should handle multiple collections in savedRecipes', async () => {
    const user = new User({
      name: 'Collection Organizer',
      email: 'collections@test.com',
      password: 'Password123!'
    });

    // Create fake recipe IDs for testing
    const recipeId1 = new mongoose.Types.ObjectId();
    const recipeId2 = new mongoose.Types.ObjectId();
    const recipeId3 = new mongoose.Types.ObjectId();
    
    user.savedRecipes = [
      { recipe: recipeId1, collection: 'Favorites' },
      { recipe: recipeId2, collection: 'Breakfast' },
      { recipe: recipeId3, collection: 'Desserts' }
    ];
    
    await user.save();
    
    const savedUser = await User.findOne({ email: 'collections@test.com' });
    expect(savedUser.savedRecipes).toHaveLength(3);
    
    // Count recipes by collection
    const collections = savedUser.savedRecipes.reduce((acc, item) => {
      acc[item.collection] = (acc[item.collection] || 0) + 1;
      return acc;
    }, {});
    
    expect(collections.Favorites).toBe(1);
    expect(collections.Breakfast).toBe(1);
    expect(collections.Desserts).toBe(1);
  });

  it('should properly set and check roles', async () => {
    // User with default roles
    const regularUser = new User({
      name: 'Regular User',
      email: 'regular@test.com',
      password: 'Password123!'
    });
    await regularUser.save();
    
    // User with admin role
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Password123!',
      roles: ['user', 'admin']
    });
    await adminUser.save();
    
    // Check regular user roles
    const savedRegularUser = await User.findOne({ email: 'regular@test.com' });
    expect(savedRegularUser.roles).toContain('user');
    expect(savedRegularUser.roles).not.toContain('admin');
    
    // Check admin user roles
    const savedAdminUser = await User.findOne({ email: 'admin@test.com' });
    expect(savedAdminUser.roles).toContain('user');
    expect(savedAdminUser.roles).toContain('admin');
  });

  it('should validate email format', async () => {
    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'email.example.com',
      'email@example@example.com',
      '.email@example.com'
    ];
    
    for (const email of invalidEmails) {
      const user = new User({
        name: 'Email Test',
        email,
        password: 'Password123!'
      });
      
      let err;
      try {
        await user.save();
      } catch (error) {
        err = error;
      }
      
      expect(err).toBeDefined();
      expect(err.errors.email).toBeDefined();
    }
  });
});
