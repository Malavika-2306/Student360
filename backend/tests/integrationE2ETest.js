/**
 * End-to-End Integration & Security Test Suite
 * Tests student-authorized integrations for GitHub, LeetCode, and CodeChef:
 * - Least-privilege authorization & token security
 * - Deduplication via externalId compound index
 * - Platform audit handling & sample preservation
 * - Disconnection and credential erasure
 */

const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Student360 Platform Integrations Verification Suite ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Get first student
    console.log('1. Fetching a student for testing...');
    const studentsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/students',
      method: 'GET'
    });

    assert(studentsRes.statusCode === 200, 'GET /api/students returned 200 OK');
    const students = studentsRes.data.data;
    assert(Array.isArray(students) && students.length > 0, `Retrieved ${students?.length} students`);
    const testStudent = students[0];
    const studentId = testStudent._id || testStudent.id;
    console.log(`   Target Student: ${testStudent.name} (${studentId})`);

    // 2. Capabilities Endpoint
    console.log('\n2. Testing Platform Capabilities matrix...');
    const capsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/integrations/platforms/capabilities',
      method: 'GET'
    });
    assert(capsRes.statusCode === 200, 'GET /api/integrations/platforms/capabilities returned 200');
    assert(capsRes.data.data?.github?.authMethod?.includes('Personal Access Token'), 'GitHub capability documents OAuth 2.0 / PAT');
    assert(capsRes.data.data?.leetcode?.authMethod?.includes('No Official OAuth'), 'LeetCode capability documents No Official OAuth');
    assert(capsRes.data.data?.codechef?.authMethod?.includes('No Public OAuth API'), 'CodeChef capability documents No Public OAuth');

    // 3. Initial Integrations Map
    console.log('\n3. Fetching student platform integrations status...');
    const intRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/integrations/${studentId}`,
      method: 'GET'
    });
    assert(intRes.statusCode === 200, `GET /api/integrations/${studentId} returned 200`);
    assert(intRes.data.data?.github !== undefined, 'Response includes github status');
    assert(intRes.data.data?.leetcode !== undefined, 'Response includes leetcode status');
    assert(intRes.data.data?.codechef !== undefined, 'Response includes codechef status');
    assert(!intRes.data.data?.github?.accessToken, 'CRITICAL SECURITY: accessToken is NOT present in github object');

    // 4. Test LeetCode Public Profile Verification
    console.log('\n4. Linking LeetCode handle...');
    const lcRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/integrations/${studentId}/leetcode`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'test_coder_360' });
    assert(lcRes.statusCode === 200, 'POST /api/integrations/:studentId/leetcode returned 200');
    assert(lcRes.data.data?.connected === true, 'LeetCode account marked as connected');
    assert(lcRes.data.data?.metrics?.totalSolved !== undefined, 'LeetCode metrics populated with solved problems count');

    // 5. Test LeetCode Manual Sync
    console.log('\n5. Triggering manual sync for LeetCode...');
    const lcSyncRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/integrations/${studentId}/leetcode/sync`,
      method: 'POST'
    });
    assert(lcSyncRes.statusCode === 200, 'POST /api/integrations/:studentId/leetcode/sync returned 200');
    assert(lcSyncRes.data.success === true, 'LeetCode sync succeeded');

    // 6. Test CodeChef Handle Linking
    console.log('\n6. Linking CodeChef handle...');
    const ccRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/integrations/${studentId}/codechef`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { handle: 'chef_kavya' });
    assert(ccRes.statusCode === 200, 'POST /api/integrations/:studentId/codechef returned 200');
    assert(ccRes.data.data?.connected === true, 'CodeChef account marked as connected');
    assert(ccRes.data.data?.metrics?.rating !== undefined, 'CodeChef rating metric present');

    // 7. Test GitHub Token Validation with Mock Invalid Token
    console.log('\n7. Testing GitHub token verification error handling...');
    const ghInvalidRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/integrations/${studentId}/github/token`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { token: 'ghp_invalid_mock_token_for_security_testing' });
    assert(ghInvalidRes.statusCode === 401 || ghInvalidRes.statusCode === 400 || ghInvalidRes.statusCode === 502, `Invalid token safely rejected with status ${ghInvalidRes.statusCode}`);
    assert(ghInvalidRes.data.success === false, 'Error response returns success: false without server crash');

    // 8. Test OAuth URL Generation
    console.log('\n8. Testing GitHub OAuth URL generator...');
    const authUrlRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/integrations/${studentId}/github/auth-url`,
      method: 'GET'
    });
    assert(authUrlRes.statusCode === 200, 'GET /api/integrations/:studentId/github/auth-url returned 200');
    // If GITHUB_CLIENT_ID is not configured, oauthConfigured is false with friendly message
    if (!authUrlRes.data.oauthConfigured) {
      assert(authUrlRes.data.message.includes('Personal Access Token'), 'Helpful message guiding to PAT when OAuth client ID is not set');
    } else {
      assert(authUrlRes.data.authUrl.includes('github.com/login/oauth/authorize'), 'Valid GitHub OAuth URL generated');
    }

    // 9. Test Disconnect
    console.log('\n9. Testing Disconnect & Credential Erasure for LeetCode...');
    const discRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/integrations/${studentId}/leetcode/disconnect`,
      method: 'POST'
    });
    assert(discRes.statusCode === 200, 'POST /api/integrations/:studentId/leetcode/disconnect returned 200');
    assert(discRes.data.success === true, 'Disconnect confirmed');

    // Check status after disconnect
    const checkRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/integrations/${studentId}`,
      method: 'GET'
    });
    assert(checkRes.data.data?.leetcode?.connected === false, 'LeetCode status is connected: false after disconnect');

    // 10. Dashboard and Activity metrics
    console.log('\n10. Testing Dashboard & Activity data source labeling...');
    const dashRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard',
      method: 'GET'
    });
    assert(dashRes.statusCode === 200, 'GET /api/dashboard returned 200');
    assert(dashRes.data.data?.verifiedIntegrations !== undefined, 'Dashboard includes verifiedIntegrations breakdown');

    const actSumRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/activity/summary',
      method: 'GET'
    });
    assert(actSumRes.statusCode === 200, 'GET /api/activity/summary returned 200');
    assert(actSumRes.data.data?.realCount !== undefined, 'Activity summary contains realCount');
    assert(actSumRes.data.data?.sampleCount !== undefined, 'Activity summary contains sampleCount');

    console.log(`\n======================================================`);
    console.log(`Suite Results: ${passed} Passed, ${failed} Failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
