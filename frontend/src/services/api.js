const API_BASE_URL = '/api';

/**
 * Universal fetch wrapper for handling API calls with JSON serialization and errors.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP error! status: ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

// -------------------------------------------------------------
// Students API
// -------------------------------------------------------------
export const getStudents = () => apiRequest('/students');
export const getStudentById = (id) => apiRequest(`/students/${id}`);
export const createStudent = (studentData) => 
  apiRequest('/students', { method: 'POST', body: studentData });
export const updateStudent = (id, studentData) => 
  apiRequest(`/students/${id}`, { method: 'PUT', body: studentData });
export const deleteStudent = (id) => 
  apiRequest(`/students/${id}`, { method: 'DELETE' });
export const searchStudents = (query) => 
  apiRequest(`/students/search?name=${encodeURIComponent(query)}`);
export const getActiveStudentsToday = () => 
  apiRequest('/students/active/today');
export const getInactiveStudentsToday = () => 
  apiRequest('/students/inactive/today');

// -------------------------------------------------------------
// Dashboard API
// -------------------------------------------------------------
export const getDashboard = () => apiRequest('/dashboard');

// -------------------------------------------------------------
// Polls API
// -------------------------------------------------------------
export const getPolls = () => apiRequest('/polls');
export const getPollById = (id) => apiRequest(`/polls/${id}`);
export const createPoll = (pollData) => 
  apiRequest('/polls', { method: 'POST', body: pollData });
export const updatePoll = (id, pollData) => 
  apiRequest(`/polls/${id}`, { method: 'PUT', body: pollData });
export const deletePoll = (id) => 
  apiRequest(`/polls/${id}`, { method: 'DELETE' });
export const submitPollResponse = (pollId, responseData) => 
  apiRequest(`/polls/${pollId}/respond`, { method: 'POST', body: responseData });
export const getPollResponses = (pollId) => 
  apiRequest(`/polls/${pollId}/responses`);
export const getPollNotResponded = (pollId) => 
  apiRequest(`/polls/${pollId}/not-responded`);
export const getPollSummary = (pollId) => 
  apiRequest(`/polls/${pollId}/summary`);

// -------------------------------------------------------------
// Activity API
// -------------------------------------------------------------
export const getActivity = () => apiRequest('/activity');
export const addActivity = (activityData) => 
  apiRequest('/activity', { method: 'POST', body: activityData });
export const getTodayActivity = () => apiRequest('/activity/today');
export const getActivitySummary = () => apiRequest('/activity/summary');
export const getDailyActivityRoster = (date) => 
  apiRequest(date ? `/activity/daily-roster?date=${encodeURIComponent(date)}` : '/activity/daily-roster');
export const getPlatformActivity = (platform) => 
  apiRequest(`/activity/platform/${encodeURIComponent(platform)}`);
export const getStudentActivity = (studentId) => 
  apiRequest(`/activity/student/${studentId}`);

// -------------------------------------------------------------
// Reports API
// -------------------------------------------------------------
export const getReports = (type = 'daily') => apiRequest(`/reports/${type}`);
export const getDailyReport = () => apiRequest('/reports/daily');
export const getWeeklyReport = () => apiRequest('/reports/weekly');
export const getMonthlyReport = () => apiRequest('/reports/monthly');

// -------------------------------------------------------------
// Analytics API
// -------------------------------------------------------------
export const getAnalytics = () => apiRequest('/analytics/dashboard');
export const getAnalyticsDashboard = () => apiRequest('/analytics/dashboard');
export const getPlatformAnalytics = () => apiRequest('/analytics/platforms');
export const getDepartmentAnalytics = () => apiRequest('/analytics/departments');
export const getDailyAnalytics = () => apiRequest('/analytics/daily');
export const getWeeklyAnalytics = () => apiRequest('/analytics/weekly');

// -------------------------------------------------------------
// Platform Integrations API (GitHub, LeetCode, CodeChef)
// -------------------------------------------------------------
export const getStudentIntegrations = (studentId) => 
  apiRequest(`/integrations/${studentId}`);
export const getGitHubAuthUrl = (studentId) => 
  apiRequest(`/integrations/${studentId}/github/auth-url`);
export const connectGitHubToken = (studentId, token) => 
  apiRequest(`/integrations/${studentId}/github/token`, { method: 'POST', body: { token } });
export const connectLeetCode = (studentId, username) => 
  apiRequest(`/integrations/${studentId}/leetcode`, { method: 'POST', body: { username } });
export const connectCodeChef = (studentId, handle) => 
  apiRequest(`/integrations/${studentId}/codechef`, { method: 'POST', body: { handle } });
export const syncPlatform = (studentId, platform) => 
  apiRequest(`/integrations/${studentId}/${platform}/sync`, { method: 'POST' });
export const disconnectPlatform = (studentId, platform) => 
  apiRequest(`/integrations/${studentId}/${platform}/disconnect`, { method: 'POST' });
export const getPlatformCapabilities = () => 
  apiRequest('/integrations/platforms/capabilities');

// -------------------------------------------------------------
// Health Check
// -------------------------------------------------------------
export const checkHealth = () => apiRequest('/health');

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getActiveStudentsToday,
  getInactiveStudentsToday,
  getDashboard,
  getPolls,
  getPollById,
  createPoll,
  updatePoll,
  deletePoll,
  submitPollResponse,
  getPollResponses,
  getPollNotResponded,
  getPollSummary,
  getActivity,
  addActivity,
  getTodayActivity,
  getActivitySummary,
  getDailyActivityRoster,
  getPlatformActivity,
  getStudentActivity,
  getReports,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getAnalytics,
  getAnalyticsDashboard,
  getPlatformAnalytics,
  getDepartmentAnalytics,
  getDailyAnalytics,
  getWeeklyAnalytics,
  getStudentIntegrations,
  getGitHubAuthUrl,
  connectGitHubToken,
  connectLeetCode,
  connectCodeChef,
  syncPlatform,
  disconnectPlatform,
  getPlatformCapabilities,
  checkHealth
};
