const PlatformAccount = require('../models/PlatformAccount');
const githubService = require('./githubService');
const platformAuditService = require('./platformAuditService');

let schedulerTimer = null;

/**
 * Execute synchronization across all connected student accounts
 */
async function syncAllConnectedAccounts() {
  const startTime = Date.now();
  console.log('[Scheduler] Starting automated platform synchronization run...');

  const results = {
    totalChecked: 0,
    githubSynced: 0,
    leetcodeSynced: 0,
    codechefSynced: 0,
    failures: []
  };

  try {
    // 1. Sync connected GitHub accounts
    const githubAccounts = await PlatformAccount.find({
      platform: 'github',
      connected: true
    }).select('+accessToken');

    for (const acc of githubAccounts) {
      results.totalChecked++;
      if (acc.accessToken && acc.studentId) {
        try {
          await githubService.syncStudentGitHub(acc.studentId, acc.accessToken);
          results.githubSynced++;
        } catch (err) {
          console.warn(`[Scheduler] GitHub sync error for student ${acc.studentId}:`, err.message);
          results.failures.push({
            studentId: acc.studentId,
            platform: 'github',
            error: err.message
          });
        }
      }
    }

    // 2. Sync linked LeetCode accounts
    const leetcodeAccounts = await PlatformAccount.find({
      platform: 'leetcode',
      connected: true
    });

    for (const acc of leetcodeAccounts) {
      results.totalChecked++;
      if (acc.username && acc.studentId) {
        try {
          await platformAuditService.syncStudentLeetCode(acc.studentId, acc.username);
          results.leetcodeSynced++;
        } catch (err) {
          results.failures.push({
            studentId: acc.studentId,
            platform: 'leetcode',
            error: err.message
          });
        }
      }
    }

    // 3. Sync linked CodeChef accounts
    const codechefAccounts = await PlatformAccount.find({
      platform: 'codechef',
      connected: true
    });

    for (const acc of codechefAccounts) {
      results.totalChecked++;
      if (acc.username && acc.studentId) {
        try {
          await platformAuditService.syncStudentCodeChef(acc.studentId, acc.username);
          results.codechefSynced++;
        } catch (err) {
          results.failures.push({
            studentId: acc.studentId,
            platform: 'codechef',
            error: err.message
          });
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Scheduler] Completed sync in ${duration}s. GitHub: ${results.githubSynced}, LeetCode: ${results.leetcodeSynced}, CodeChef: ${results.codechefSynced}`);
  } catch (globalErr) {
    console.error('[Scheduler] Global sync execution error:', globalErr.message);
  }

  return results;
}

/**
 * Initialize periodic background scheduler
 * Default interval: 6 hours (configurable via SYNC_INTERVAL_HOURS)
 */
function initScheduler(intervalHours = 6) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  const intervalMs = Math.max(1, intervalHours) * 60 * 60 * 1000;
  console.log(`[Scheduler] Automated background sync scheduler initialized (every ${intervalHours}h).`);

  schedulerTimer = setInterval(() => {
    syncAllConnectedAccounts().catch(err => {
      console.error('[Scheduler] Background sync cycle caught error:', err);
    });
  }, intervalMs);

  if (schedulerTimer.unref) {
    schedulerTimer.unref();
  }

  return schedulerTimer;
}

function stopScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log('[Scheduler] Background scheduler stopped.');
  }
}

module.exports = {
  syncAllConnectedAccounts,
  initScheduler,
  stopScheduler
};
