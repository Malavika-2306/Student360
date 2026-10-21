const express = require('express');
const router = express.Router();
const {
  getAnalyticsDashboard,
  getPlatformAnalytics,
  getDepartmentAnalytics,
  getDailyAnalytics,
  getWeeklyAnalytics
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getAnalyticsDashboard);
router.get('/platforms', protect, authorize('admin'), getPlatformAnalytics);
router.get('/departments', protect, authorize('admin'), getDepartmentAnalytics);
router.get('/daily', protect, authorize('admin'), getDailyAnalytics);
router.get('/weekly', protect, authorize('admin'), getWeeklyAnalytics);

module.exports = router;
