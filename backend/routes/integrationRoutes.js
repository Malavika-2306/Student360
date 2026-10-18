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

// Capability matrix
router.get('/platforms/capabilities', getCapabilities);

// Multi-account batch sync trigger
router.post('/sync-all', syncAllPlatforms);

// OAuth Web Callback
router.get('/github/callback', handleGitHubCallback);

// Student platform integrations
router.get('/:studentId', getStudentIntegrations);
router.get('/:studentId/github/auth-url', getGitHubAuthUrl);
router.post('/:studentId/github/token', connectGitHubToken);
router.post('/:studentId/leetcode', connectLeetCode);
router.post('/:studentId/codechef', connectCodeChef);
router.post('/:studentId/:platform/sync', manualSync);
router.post('/:studentId/:platform/disconnect', disconnect);

module.exports = router;
