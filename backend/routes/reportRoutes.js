const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/daily', protect, authorize('admin'), getDailyReport);
router.get('/weekly', protect, authorize('admin'), getWeeklyReport);
router.get('/monthly', protect, authorize('admin'), getMonthlyReport);

module.exports = router;
