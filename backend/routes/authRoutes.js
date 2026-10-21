const express = require('express');
const router = express.Router();
const {
  login,
  logout,
  getMe,
  bootstrapAdmin,
  provisionStudent,
  getUsers,
  registerStudent
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/login', login);
router.post('/register', registerStudent);
router.post('/logout', logout);
router.post('/bootstrap-admin', bootstrapAdmin);

// Protected routes
router.get('/me', protect, getMe);

// Admin-only user management routes
router.post('/provision-student', protect, authorize('admin'), provisionStudent);
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;
