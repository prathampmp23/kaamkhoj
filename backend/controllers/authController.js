const AuthUser = require('../models/authUser');
const { generateToken } = require('../utils/jwt');

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password'
      });
    }

    // Check if username already exists
    const existingUsername = await AuthUser.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Check if email already exists
    const existingEmail = await AuthUser.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    // Create new user
    const user = new AuthUser({
      username,
      email,
      password
    });

    // Save user to database
    await user.save();

    // Success response - don't send back the password
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user by username
    const user = await AuthUser.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileCompleted: user.profileCompleted,
        profileId: user.profileId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by the auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileCompleted: user.profileCompleted,
        profileId: user.profileId
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data',
      error: error.message
    });
  }
};

// Link user profile
const linkUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID is required'
      });
    }

    // Update user
    const updatedUser = await AuthUser.findByIdAndUpdate(
      userId,
      {
        profileId,
        profileCompleted: true
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile linked successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profileCompleted: updatedUser.profileCompleted,
        profileId: updatedUser.profileId
      }
    });
  } catch (error) {
    console.error('Link profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while linking profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  linkUserProfile
};