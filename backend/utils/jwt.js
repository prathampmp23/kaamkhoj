const jwt = require('jsonwebtoken');

// JWT Secret - in production, this should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'kaamkhoj-jwt-secret-key';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};