const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes - require authentication
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/link-profile', authMiddleware, authController.linkUserProfile);

module.exports = router;