const http = require('http');

/**
 * ============================================================================
 * GITHUB OAUTH WEB FLOW AUTOMATED TEST SUITE
 * Tests OAuth URL generation, state encoding, error redirects & fallback handling
 * ============================================================================
 */

const BASE_URL = 'http://localhost:5000';
let passedAssertions = 0;
let failedAssertions = 0;
let authToken = '';

function assert(condition, testName, details = '') {
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedAssertions++;
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

async function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  const headers = {
    ...(options.headers || {}),
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
  };
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { /* text response */ }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runOAuthTests() {
  console.log('\n======================================================');
  console.log('Student360 — GitHub OAuth Web Flow Automated Tests');
  console.log('======================================================\n');

  try {
    // Authenticate as Admin
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@student360.edu', password: 'Admin@Student360' }
    });
    authToken = loginRes.data?.token;

    // 1. Fetch a valid student to test with
    console.log('--- Step 1: Discover Active Test Student ---');
    const studentsRes = await request('/api/students');
    assert(studentsRes.statusCode === 200, 'Students API responds with HTTP 200');
    assert(Array.isArray(studentsRes.data?.data) && studentsRes.data.data.length > 0, 'Found enrolled students in MongoDB');
    
    const testStudent = studentsRes.data.data[0];
    const studentId = testStudent._id;
    console.log(`  Target Student: ${testStudent.name} (${studentId})`);

    // 2. Test OAuth URL Generation endpoint
    console.log('\n--- Step 2: Test OAuth Auth-URL Generation Endpoint ---');
    const authUrlRes = await request(`/api/integrations/${studentId}/github/auth-url`);
    assert(authUrlRes.statusCode === 200, 'Auth-URL endpoint responds with HTTP 200');
    
    // In default environment without GITHUB_CLIENT_ID configured:
    if (!authUrlRes.data.oauthConfigured) {
      assert(authUrlRes.data.oauthConfigured === false, 'Properly flags oauthConfigured: false when GITHUB_CLIENT_ID is absent');
      assert(typeof authUrlRes.data.message === 'string' && authUrlRes.data.message.includes('Personal Access Token'), 'Provides helpful message pointing to Personal Access Token fallback');
    } else {
      assert(typeof authUrlRes.data.authUrl === 'string', 'Returns formatted authUrl string');
      const generatedUrl = new URL(authUrlRes.data.authUrl);
      assert(generatedUrl.hostname === 'github.com', 'authUrl targets github.com');
      assert(generatedUrl.pathname === '/login/oauth/authorize', 'authUrl targets /login/oauth/authorize');
      assert(generatedUrl.searchParams.get('scope') === 'read:user', 'authUrl enforces least-privilege read:user scope');
      
      const rawState = generatedUrl.searchParams.get('state');
      const decodedState = JSON.parse(Buffer.from(rawState, 'base64').toString('utf-8'));
      assert(decodedState.studentId === studentId, 'State parameter contains exact studentId');
      assert(typeof decodedState.timestamp === 'number', 'State parameter contains anti-tamper timestamp');
    }

    // 3. Test OAuth Web Callback Error Redirects
    console.log('\n--- Step 3: Test OAuth Callback Error Handling ---');
    
    // User denied authorization on GitHub
    const userDeniedRes = await request('/api/integrations/github/callback?error=access_denied&error_description=The+user+has+denied+your+application+access.');
    assert(userDeniedRes.statusCode === 302, 'Callback responds with HTTP 302 redirect on GitHub error');
    assert(userDeniedRes.headers.location && userDeniedRes.headers.location.includes('oauth_error=access_denied'), 'Redirects back to frontend with ?oauth_error parameter');

    // Missing code and state
    const missingParamsRes = await request('/api/integrations/github/callback');
    assert(missingParamsRes.statusCode === 400, 'Callback returns HTTP 400 when code/state are missing');
    assert(typeof missingParamsRes.data === 'string' && missingParamsRes.data.includes('Missing authorization code'), 'Returns clear validation message for missing parameters');

    // Invalid base64 state parameter
    const invalidStateRes = await request('/api/integrations/github/callback?code=mock_code&state=!!!invalid_base64!!!');
    assert(invalidStateRes.statusCode === 400, 'Callback returns HTTP 400 on malformed state token');

    // Valid state encoding but missing server OAuth credentials (GITHUB_CLIENT_SECRET unset)
    const validState = Buffer.from(JSON.stringify({ studentId, timestamp: Date.now() })).toString('base64');
    const validStateRes = await request(`/api/integrations/github/callback?code=mock_temp_code&state=${validState}`);
    // Either 500 (credentials not configured) or 400 (mock code rejected by GitHub)
    assert([400, 500].includes(validStateRes.statusCode), 'Callback handles code exchange gracefully without crashing server');

    console.log('\n======================================================');
    console.log(`Results: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
    console.log('======================================================\n');

    process.exit(failedAssertions === 0 ? 0 : 1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runOAuthTests();
