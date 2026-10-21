const express = require('express');
const router = express.Router();
const {
  getCapabilities,
  getStudentIntegrations,
  connectGitHubToken,
  getGitHubAuthUrl,
  handleGitHubCallback,
  connectLeetCode,
  connectCodeChef,
  manualSync,
  disconnect,
  syncAllPlatforms
} = require('../controllers/integrationController');
const { protect, authorize, restrictStudentToSelf } = require('../middleware/authMiddleware');

// Capability matrix
router.get('/platforms/capabilities', getCapabilities);

// Multi-account batch sync trigger (Admin only)
router.post('/sync-all', protect, authorize('admin'), syncAllPlatforms);

// OAuth Web Callback (Public redirect from GitHub)
router.get('/github/callback', handleGitHubCallback);

// Student platform integrations (Admin or Owner Student)
router.get('/:studentId', protect, restrictStudentToSelf('studentId'), getStudentIntegrations);
router.get('/:studentId/github/auth-url', protect, restrictStudentToSelf('studentId'), getGitHubAuthUrl);
router.post('/:studentId/github/token', protect, restrictStudentToSelf('studentId'), connectGitHubToken);
router.post('/:studentId/leetcode', protect, restrictStudentToSelf('studentId'), connectLeetCode);
router.post('/:studentId/codechef', protect, restrictStudentToSelf('studentId'), connectCodeChef);
router.post('/:studentId/:platform/sync', protect, restrictStudentToSelf('studentId'), manualSync);
router.post('/:studentId/:platform/disconnect', protect, restrictStudentToSelf('studentId'), disconnect);

module.exports = router;
