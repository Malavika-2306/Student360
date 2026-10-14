const PlatformAccount = require('../models/PlatformAccount');
const Student = require('../models/Student');
const githubService = require('../services/githubService');
const platformAuditService = require('../services/platformAuditService');

/**
 * ============================================================================
 * INTEGRATION CONTROLLERS
 * Manages authorized student account connections for GitHub, LeetCode, CodeChef
 * ============================================================================
 */

/**
 * @desc    Get documented platform integration capabilities
 * @route   GET /api/integrations/platforms/capabilities
 */
exports.getCapabilities = async (req, res) => {
  res.status(200).json({
    success: true,
    data: platformAuditService.getPlatformCapabilities()
  });
};

/**
 * @desc    Get all platform accounts connected for a specific student
 * @route   GET /api/integrations/:studentId
 * SECURITY: accessToken is excluded by default in PlatformAccount schema.
 */
exports.getStudentIntegrations = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Explicitly query all 3 platform states
    const accounts = await PlatformAccount.find({ studentId });

    // Format normalized response map
    const defaultPlatforms = ['github', 'leetcode', 'codechef'];
    const platformMap = {};

    defaultPlatforms.forEach((plat) => {
      const existing = accounts.find((a) => a.platform === plat);
      if (existing) {
        // Double-check no token is ever exposed
        const sanitized = existing.toObject();
        delete sanitized.accessToken;
        platformMap[plat] = sanitized;
      } else {
        platformMap[plat] = {
          studentId,
          platform: plat,
          username: '',
          profileUrl: '',
          avatarUrl: '',
          connected: false,
          syncStatus: plat === 'github' ? 'not_connected' : 'unavailable',
          dataSource: 'Not connected',
          authMethod: 'none',
          lastSyncedAt: null,
          lastError: '',
          metrics: {}
        };
      }
    });

    res.status(200).json({
      success: true,
      data: platformMap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Connect GitHub with a student-authorized Personal Access Token (PAT)
 * @route   POST /api/integrations/:studentId/github/token
 */
exports.connectGitHubToken = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { token } = req.body;

    if (!token || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: 'GitHub Personal Access Token is required'
      });
    }

    const updatedAccount = await githubService.syncStudentGitHub(studentId, token);
    const sanitized = updatedAccount.toObject();
    delete sanitized.accessToken;

    res.status(200).json({
      success: true,
      message: `GitHub account (@${sanitized.username}) connected and synchronized successfully!`,
      data: sanitized
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate GitHub OAuth authorization URL
 * @route   GET /api/integrations/:studentId/github/auth-url
 */
exports.getGitHubAuthUrl = async (req, res) => {
  const { studentId } = req.params;
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return res.status(200).json({
      success: false,
      oauthConfigured: false,
      message: 'GitHub OAuth Client ID is not configured in backend environment variables. Use Personal Access Token option instead.'
    });
  }

  const redirectUri = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/integrations/github/callback';
  const scope = 'read:user'; // Least-privilege scope
  const state = Buffer.from(JSON.stringify({ studentId, timestamp: Date.now() })).toString('base64');

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

  res.status(200).json({
    success: true,
    oauthConfigured: true,
    authUrl
  });
};

/**
 * @desc    Handle GitHub OAuth Web Callback
 * @route   GET /api/integrations/github/callback
 */
exports.handleGitHubCallback = async (req, res, next) => {
  try {
    const { code, state, error: ghError } = req.query;

    if (ghError) {
      return res.redirect(`http://localhost:5173/?oauth_error=${encodeURIComponent(ghError)}`);
    }

    if (!code || !state) {
      return res.status(400).send('Missing authorization code or state token.');
    }

    let parsedState;
    try {
      parsedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      return res.status(400).send('Invalid OAuth state parameter.');
    }

    const { studentId } = parsedState;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).send('GitHub OAuth client credentials are not configured on server.');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return res.status(400).send(`Failed to obtain access token: ${tokenData.error_description || 'Unknown error'}`);
    }

    // Synchronize student with the received token
    await githubService.syncStudentGitHub(studentId, tokenData.access_token);

    // Redirect to frontend with success parameter
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/?github_connected=true&student_id=${studentId}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Connect LeetCode username
 * @route   POST /api/integrations/:studentId/leetcode
 */
exports.connectLeetCode = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { username } = req.body;

    const account = await platformAuditService.syncStudentLeetCode(studentId, username);
    res.status(200).json({
      success: true,
      message: `LeetCode handle linked: ${username}`,
      data: account
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Connect CodeChef handle
 * @route   POST /api/integrations/:studentId/codechef
 */
exports.connectCodeChef = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { handle } = req.body;

    const account = await platformAuditService.syncStudentCodeChef(studentId, handle);
    res.status(200).json({
      success: true,
      message: `CodeChef handle linked: ${handle}`,
      data: account
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger safe manual sync for a student's platform integration
 * @route   POST /api/integrations/:studentId/:platform/sync
 */
exports.manualSync = async (req, res, next) => {
  try {
    const { studentId, platform } = req.params;
    const normalizedPlatform = platform.toLowerCase();

    if (normalizedPlatform === 'github') {
      const account = await PlatformAccount.findOne({ studentId, platform: 'github' }).select('+accessToken');
      if (!account || !account.accessToken) {
        return res.status(400).json({
          success: false,
          message: 'GitHub is not connected. Please connect with your GitHub authorization token first.'
        });
      }

      const updated = await githubService.syncStudentGitHub(studentId, account.accessToken);
      const sanitized = updated.toObject();
      delete sanitized.accessToken;

      return res.status(200).json({
        success: true,
        message: 'GitHub activity synchronized successfully!',
        data: sanitized
      });
    }

    if (normalizedPlatform === 'leetcode') {
      const account = await PlatformAccount.findOne({ studentId, platform: 'leetcode' });
      if (!account || !account.username) {
        return res.status(400).json({
          success: false,
          message: 'LeetCode handle is not linked.'
        });
      }

      const updated = await platformAuditService.syncStudentLeetCode(studentId, account.username);
      return res.status(200).json({
        success: true,
        message: 'LeetCode profile verified and updated!',
        data: updated
      });
    }

    if (normalizedPlatform === 'codechef') {
      const account = await PlatformAccount.findOne({ studentId, platform: 'codechef' });
      if (!account || !account.username) {
        return res.status(400).json({
          success: false,
          message: 'CodeChef handle is not linked.'
        });
      }

      const updated = await platformAuditService.syncStudentCodeChef(studentId, account.username);
      return res.status(200).json({
        success: true,
        message: 'CodeChef handle verified!',
        data: updated
      });
    }

    res.status(400).json({
      success: false,
      message: `Unsupported platform: ${platform}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Disconnect an integration and delete stored credentials
 * @route   POST /api/integrations/:studentId/:platform/disconnect
 */
exports.disconnect = async (req, res, next) => {
  try {
    const { studentId, platform } = req.params;
    const normalizedPlatform = platform.toLowerCase();

    if (normalizedPlatform === 'github') {
      const result = await githubService.disconnectStudentGitHub(studentId);
      return res.status(200).json(result);
    }

    if (normalizedPlatform === 'leetcode' || normalizedPlatform === 'codechef') {
      const result = await platformAuditService.disconnectStudentPlatform(studentId, normalizedPlatform);
      return res.status(200).json(result);
    }

    res.status(400).json({
      success: false,
      message: `Unsupported platform: ${platform}`
    });
  } catch (error) {
    next(error);
  }
};
