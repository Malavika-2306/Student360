/**
 * Student360 Authentication & Role Authorization Test Suite
 * Validates admin and student login, token validation, 401/403 protections, and student data scoping.
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
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

  const response = await fetch(url, config);
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   Student360 Auth & Role Security Verification');
  console.log('======================================================\n');

  let adminToken = '';
  let studentToken = '';
  let studentId = '';

  // 1. Admin Login
  console.log('Test 1: Admin Login with valid credentials');
  const adminRes = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@student360.edu',
      password: 'Admin@Student360'
    }
  });
  assert(adminRes.status === 200, 'Returns HTTP 200');
  assert(adminRes.data?.success === true, 'Response success is true');
  assert(typeof adminRes.data?.token === 'string' && adminRes.data.token.length > 20, 'Returns signed JWT token');
  assert(adminRes.data?.user?.role === 'admin', 'User role is admin');
  adminToken = adminRes.data?.token;

  // 2. Student Login
  console.log('\nTest 2: Student Login with valid credentials');
  const studentRes = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'anu.cse@college.edu',
      password: 'Student@Student360'
    }
  });
  assert(studentRes.status === 200, 'Returns HTTP 200');
  assert(studentRes.data?.success === true, 'Response success is true');
  assert(typeof studentRes.data?.token === 'string', 'Returns signed JWT token');
  assert(studentRes.data?.user?.role === 'student', 'User role is student');
  assert(studentRes.data?.user?.student !== null, 'User is linked to MongoDB Student record');
  studentToken = studentRes.data?.token;
  studentId = studentRes.data?.user?.student?._id || studentRes.data?.user?.student;

  // 3. Invalid Password Attempt
  console.log('\nTest 3: Login with invalid password');
  const invalidPwdRes = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'admin@student360.edu',
      password: 'WrongPassword123!'
    }
  });
  assert(invalidPwdRes.status === 401, 'Returns HTTP 401 Unauthorized');
  assert(invalidPwdRes.data?.success === false, 'Response success is false');
  assert(invalidPwdRes.data?.message === 'Invalid email or password', 'Returns generic credential error');

  // 4. Non-existent User Attempt
  console.log('\nTest 4: Login with non-existent email');
  const unknownUserRes = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'nonexistent.user.test@college.edu',
      password: 'SomePassword123'
    }
  });
  assert(unknownUserRes.status === 401, 'Returns HTTP 401 Unauthorized');
  assert(unknownUserRes.data?.message === 'Invalid email or password', 'Returns identical generic error');

  // 5. GET /api/auth/me with Admin Token
  console.log('\nTest 5: GET /api/auth/me with Admin Token');
  const meAdminRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(meAdminRes.status === 200, 'Returns HTTP 200');
  assert(meAdminRes.data?.user?.email === 'admin@student360.edu', 'Returns correct admin email');
  assert(meAdminRes.data?.user?.password === undefined, 'Does NOT expose password hash');

  // 6. GET /api/auth/me without Token
  console.log('\nTest 6: GET /api/auth/me without Token');
  const unauthRes = await request('/auth/me');
  assert(unauthRes.status === 401, 'Returns HTTP 401 for missing token');

  // 7. Student attempting to access Admin API (Reports)
  console.log('\nTest 7: Student attempting to call Admin-only Reports API');
  const studentReportsRes = await request('/reports/daily', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studentReportsRes.status === 403, 'Returns HTTP 403 Forbidden for Student');

  // 8. Admin accessing Reports API
  console.log('\nTest 8: Admin accessing Admin Reports API');
  const adminReportsRes = await request('/reports/daily', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminReportsRes.status === 200, 'Returns HTTP 200 for Admin');
  assert(adminReportsRes.data?.success === true, 'Returns report data');

  // 9. Student attempting to create a new Student (Admin only)
  console.log('\nTest 9: Student attempting to create a new student record');
  const studentCreateRes = await request('/students', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      name: 'Hacker Student',
      email: 'hacker@college.edu',
      department: 'CSE'
    }
  });
  assert(studentCreateRes.status === 403, 'Returns HTTP 403 Forbidden for Student mutating students');

  // 10. Student attempting to query another student profile by ID
  console.log('\nTest 10: Student attempting to query a different student by ID');
  const otherStudentId = '6ac922f102479e4032c615f7'; // Rahul's ID
  const forbiddenProfileRes = await request(`/students/${otherStudentId}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(forbiddenProfileRes.status === 403, 'Returns HTTP 403 Forbidden when accessing another student record');

  // 11. Student querying their own profile by ID
  console.log('\nTest 11: Student querying their own student profile');
  const ownProfileRes = await request(`/students/${studentId}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(ownProfileRes.status === 200, 'Returns HTTP 200 when student queries their own record');
  assert(ownProfileRes.data?.data?.name === 'Anu', 'Returns correct student profile data');

  // 12. Student GET /api/students is scoped to self
  console.log('\nTest 12: Student GET /api/students data scoping');
  const studentListRes = await request('/students', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(studentListRes.status === 200, 'Returns HTTP 200');
  assert(studentListRes.data?.count === 1, 'Only returns 1 record (their own profile)');
  assert(studentListRes.data?.data[0]?.email === 'anu.cse@college.edu', 'Does not leak other students');

  // 13. Admin GET /api/students returns full cohort
  console.log('\nTest 13: Admin GET /api/students returns all students');
  const adminListRes = await request('/students', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminListRes.status === 200, 'Returns HTTP 200');
  assert(adminListRes.data?.count > 1, `Returns all cohort students (${adminListRes.data?.count} students)`);

  // 14. Bootstrap Admin Disabled when Admin exists
  console.log('\nTest 14: Bootstrap Admin is permanently disabled when an admin already exists');
  const bootstrapRes = await request('/auth/bootstrap-admin', {
    method: 'POST',
    body: {
      name: 'Attacker Admin',
      email: 'attacker@evil.com',
      password: 'HackedPassword123',
      bootstrapKey: 'student360_admin_bootstrap_secret_2026'
    }
  });
  assert(bootstrapRes.status === 403, 'Returns HTTP 403 Forbidden because admin already exists');

  // 15. Student Poll Submission auto-associates studentId
  console.log('\nTest 15: Student Poll Response enforces authenticated studentId');
  const pollsRes = await request('/polls', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  if (pollsRes.data?.data?.length > 0) {
    const testPollId = pollsRes.data.data[0]._id;
    const pollSubmitRes = await request(`/polls/${testPollId}/respond`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        studentId: 'spoofed_other_id', // Spoofed studentId should be ignored by backend!
        answer: 'Interested'
      }
    });
    assert(pollSubmitRes.status === 200, 'Returns HTTP 200');
    assert(
      pollSubmitRes.data?.data?.studentId?._id?.toString() === studentId.toString() ||
      pollSubmitRes.data?.data?.studentId?.toString() === studentId.toString(),
      'Response document enforces authenticated studentId instead of spoofed ID'
    );
  } else {
    console.log('  [SKIP] No polls available for submission test');
  }

  // 16. Public Student Registration
  console.log('\nTest 16: Public Student Registration');
  const testRegEmail = `regtest_${Date.now()}@college.edu`;
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Registration Test Student',
      email: testRegEmail,
      password: 'StudentSecurePassword123',
      department: 'CSE',
      year: 2
    }
  });
  assert(regRes.status === 201, 'Returns HTTP 201 Created');
  assert(regRes.data?.success === true, 'Response success is true');
  assert(regRes.data?.user?.role === 'student', 'Registered user role is student');
  assert(typeof regRes.data?.token === 'string', 'Returns valid JWT token');

  // 17. Attacker attempting to select 'admin' role during registration
  console.log('\nTest 17: Registration rejects role tampering (attempts role: admin)');
  const testTamperEmail = `tamper_${Date.now()}@college.edu`;
  const tamperRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Tamper Attempt Student',
      email: testTamperEmail,
      password: 'HackerPassword123',
      department: 'CSE',
      year: 3,
      role: 'admin' // Attempt privilege escalation!
    }
  });
  assert(tamperRes.status === 201, 'Registration completes');
  assert(tamperRes.data?.user?.role === 'student', 'Role remains strictly student (privilege escalation blocked)');

  // 18. Registration with Duplicate Email
  console.log('\nTest 18: Registration rejects duplicate email');
  const dupRegRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Duplicate Student',
      email: testRegEmail,
      password: 'DuplicatePassword123'
    }
  });
  assert(dupRegRes.status === 400, 'Returns HTTP 400 Bad Request');
  assert(dupRegRes.data?.success === false, 'Duplicate registration prevented');

  // 19. Registration with short password
  console.log('\nTest 19: Registration rejects short password (< 6 chars)');
  const shortPwdRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Short Password Student',
      email: `shortpwd_${Date.now()}@college.edu`,
      password: '123'
    }
  });
  assert(shortPwdRes.status === 400, 'Returns HTTP 400 for password < 6 characters');

  console.log('\n======================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
