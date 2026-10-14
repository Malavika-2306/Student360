const PlatformAccount = require('../models/PlatformAccount');
const Activity = require('../models/Activity');
const Student = require('../models/Student');

const GITHUB_API_BASE = 'https://api.github.com';
const USER_AGENT = 'Student360-Analytics/1.0';

/**
 * Verify GitHub token and retrieve authenticated user profile
 * Uses official GitHub REST API GET /user
 */
async function verifyTokenAndGetUser(token) {
  if (!token || typeof token !== 'string' || !token.trim()) {
    throw new Error('A valid GitHub token or authorization code is required.');
  }

  const cleanToken = token.trim();
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': USER_AGENT
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      const err = new Error('Invalid, expired, or revoked GitHub access token. Please re-authenticate.');
      err.statusCode = 401;
      throw err;
    }
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
      if (rateLimitRemaining === '0') {
        throw new Error('GitHub API rate limit exceeded. Please wait a few minutes before trying again.');
      }
      throw new Error('GitHub access was forbidden. Verify token permissions.');
    }
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `GitHub API error: status ${response.status}`);
  }

  const user = await response.json();
  return {
    id: user.id,
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    publicRepos: user.public_repos || 0,
    publicGists: user.public_gists || 0,
    followers: user.followers || 0
  };
}

/**
 * Fetch public events for the student's authorized GitHub account
 * Uses official GitHub REST API GET /users/{username}/events/public
 */
async function fetchUserEvents(username, token) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': USER_AGENT
  };

  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/events/public?per_page=30`,
    { headers }
  );

  if (!response.ok) {
    console.warn(`Failed to fetch events for GitHub user ${username}: status ${response.status}`);
    return [];
  }

  return response.json();
}

/**
 * Fetch recent repositories for the student
 * Uses official GitHub REST API GET /users/{username}/repos
 */
async function fetchUserRepositories(username, token) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': USER_AGENT
  };

  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const response = await fetch(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=5`,
    { headers }
  );

  if (!response.ok) {
    console.warn(`Failed to fetch repos for GitHub user ${username}: status ${response.status}`);
    return [];
  }

  const repos = await response.json();
  return (repos || []).map((repo) => ({
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description || 'No description provided',
    language: repo.language || 'Unknown',
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    updatedAt: new Date(repo.updated_at)
  }));
}

/**
 * Perform end-to-end synchronization for a student's GitHub account
 * Stores normalized results and prevents duplicate activity records
 */
async function syncStudentGitHub(studentId, token) {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new Error('Student not found in database');
  }

  // 1. Verify token & get user profile
  const user = await verifyTokenAndGetUser(token);

  // 2. Fetch public events and repositories
  const [events, repos] = await Promise.all([
    fetchUserEvents(user.login, token),
    fetchUserRepositories(user.login, token)
  ]);

  const recentPushEvents = events.filter((e) => e.type === 'PushEvent');
  const recentPushCount = recentPushEvents.length;

  // 3. Upsert PlatformAccount record
  // NOTE: accessToken is stored but excluded from responses by default (select: false)
  const account = await PlatformAccount.findOneAndUpdate(
    { studentId, platform: 'github' },
    {
      studentId,
      platform: 'github',
      username: user.login,
      profileUrl: user.profileUrl,
      avatarUrl: user.avatarUrl,
      accessToken: token.trim(),
      connected: true,
      syncStatus: 'synced',
      dataSource: 'Real',
      authMethod: 'personal_token',
      lastSyncedAt: new Date(),
      lastError: '',
      metrics: {
        publicRepos: user.publicRepos,
        publicGists: user.publicGists,
        followers: user.followers,
        recentEventsCount: events.length,
        recentPushEventsCount: recentPushCount,
        recentRepositories: repos
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  // 4. Safely insert verified real activity records without duplicating
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let hasEventToday = false;

  for (const event of events.slice(0, 5)) {
    const eventDate = new Date(event.created_at);
    if (eventDate >= today) {
      hasEventToday = true;
    }

    const externalId = `gh-event-${event.id}`;
    let actType = 'Commit';
    let description = `GitHub: ${event.type.replace('Event', '')} on ${event.repo?.name || 'repository'}`;
    let count = 1;

    if (event.type === 'PushEvent') {
      actType = 'Commit';
      const commitCount = event.payload?.commits?.length || 1;
      count = commitCount;
      description = `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${event.repo?.name || 'repo'}`;
    } else if (event.type === 'CreateEvent') {
      actType = 'Repository Activity';
      description = `Created ${event.payload?.ref_type || 'repository'} in ${event.repo?.name || 'repo'}`;
    } else if (event.type === 'PullRequestEvent') {
      actType = 'Public Event';
      description = `${event.payload?.action || 'Opened'} PR in ${event.repo?.name || 'repo'}`;
    } else {
      actType = 'Public Event';
      description = `Recent ${event.type.replace('Event', '')} activity on ${event.repo?.name || 'repo'}`;
    }

    try {
      // Upsert by studentId + externalId to prevent duplicate activity records
      await Activity.findOneAndUpdate(
        { studentId, externalId },
        {
          studentId,
          platform: 'GitHub',
          activityType: actType,
          activityCount: count,
          activityDate: eventDate,
          description,
          dataSource: 'Real',
          syncStatus: 'synced',
          externalId
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      // Duplicate key or write issue logged safely
      console.warn('Activity upsert notice:', e.message);
    }
  }

  // 5. Update student platforms flag and activeToday if active
  await Student.findByIdAndUpdate(studentId, {
    'platforms.github': true,
    ...(hasEventToday ? { activeToday: true } : {})
  });

  return account;
}

/**
 * Disconnect student's GitHub integration and revoke stored access
 */
async function disconnectStudentGitHub(studentId) {
  const account = await PlatformAccount.findOne({ studentId, platform: 'github' });
  if (!account) {
    return { success: true, message: 'No GitHub account was connected' };
  }

  // Remove the stored access token and reset status to disconnected
  await PlatformAccount.findOneAndUpdate(
    { studentId, platform: 'github' },
    {
      $unset: { accessToken: 1 },
      connected: false,
      syncStatus: 'not_connected',
      dataSource: 'Not connected',
      authMethod: 'none',
      lastError: ''
    }
  );

  // Update student platform flag
  await Student.findByIdAndUpdate(studentId, {
    'platforms.github': false
  });

  return { success: true, message: 'GitHub account disconnected successfully' };
}

module.exports = {
  verifyTokenAndGetUser,
  fetchUserEvents,
  fetchUserRepositories,
  syncStudentGitHub,
  disconnectStudentGitHub
};
