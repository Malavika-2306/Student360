const express = require('express');
const router = express.Router();
const {
  getAllActivity,
  addActivity,
  getTodayActivity,
  getStudentActivity,
  getPlatformActivity,
  getActivitySummary,
  getDailyRoster,
  sendInactivityAlert,
  getAlertHistory
} = require('../controllers/activityController');
const { protect, authorize, restrictStudentToSelf } = require('../middleware/authMiddleware');

// Alerts endpoints (Admin only)
router.post('/alerts/send', protect, authorize('admin'), sendInactivityAlert);
router.get('/alerts/history', protect, authorize('admin'), getAlertHistory);

// Specific endpoints
router.get('/today', protect, getTodayActivity);
router.get('/daily-roster', protect, getDailyRoster);
router.get('/summary', protect, getActivitySummary);
router.get('/platform/:platform', protect, getPlatformActivity);
router.get('/student/:studentId', protect, restrictStudentToSelf('studentId'), getStudentActivity);

// Root endpoints
router.route('/')
  .get(protect, getAllActivity)
  .post(protect, authorize('admin'), addActivity);

module.exports = router;
