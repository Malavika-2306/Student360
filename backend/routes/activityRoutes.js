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

// Alerts endpoints
router.post('/alerts/send', sendInactivityAlert);
router.get('/alerts/history', getAlertHistory);

// Specific endpoints
router.get('/today', getTodayActivity);
router.get('/daily-roster', getDailyRoster);
router.get('/summary', getActivitySummary);
router.get('/platform/:platform', getPlatformActivity);
router.get('/student/:studentId', getStudentActivity);

// Root endpoints
router.route('/')
  .get(getAllActivity)
  .post(addActivity);

module.exports = router;
