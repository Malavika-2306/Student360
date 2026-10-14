const express = require('express');
const router = express.Router();
const {
  getAnalyticsDashboard,
  getPlatformAnalytics,
  getDepartmentAnalytics,
  getDailyAnalytics,
  getWeeklyAnalytics
} = require('../controllers/reportController');

router.get('/dashboard', getAnalyticsDashboard);
router.get('/platforms', getPlatformAnalytics);
router.get('/departments', getDepartmentAnalytics);
router.get('/daily', getDailyAnalytics);
router.get('/weekly', getWeeklyAnalytics);

module.exports = router;
