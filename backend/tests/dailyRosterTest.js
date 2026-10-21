const http = require('http');

function request(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ statusCode: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function run() {
  console.log('=== Testing Daily Roster API (/api/activity/daily-roster) ===\n');

  // Authenticate as Admin
  const authRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@student360.edu', password: 'Admin@Student360' })
  });
  const token = authRes.data?.token;

  // Test 1: Default today
  const res1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/activity/daily-roster',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('1. GET /api/activity/daily-roster:');
  console.log(`   Status: ${res1.statusCode}`);
  if (res1.statusCode !== 200 || !res1.data.success) {
    console.error('FAILED: Expected 200 OK with success: true', res1.data);
    process.exit(1);
  }

  const s1 = res1.data.summary;
  console.log(`   Target Date: ${res1.data.date}`);
  console.log(`   Total Students: ${s1.totalStudents}`);
  console.log(`   Active on Date: ${s1.activeCount} (${s1.participationRate}%)`);
  console.log(`   Inactive on Date: ${s1.inactiveCount}`);
  console.log(`   Platforms Breakdown:`, s1.platforms);

  if (s1.totalStudents !== s1.activeCount + s1.inactiveCount) {
    console.error('FAILED: Total students does not equal active + inactive count!');
    process.exit(1);
  }

  console.log(`   Active Students list length: ${res1.data.activeStudents.length}`);
  if (res1.data.activeStudents.length > 0) {
    const sampleActive = res1.data.activeStudents[0];
    console.log(`   Sample Active Student: ${sampleActive.name} (${sampleActive.department}) - ${sampleActive.activities?.length} activities recorded`);
    console.log(`   First Activity: [${sampleActive.activities[0]?.platform}] ${sampleActive.activities[0]?.description} (${sampleActive.activities[0]?.dataSource})`);
  }

  console.log(`   Inactive Students list length: ${res1.data.inactiveStudents.length}`);
  if (res1.data.inactiveStudents.length > 0) {
    const sampleInactive = res1.data.inactiveStudents[0];
    console.log(`   Sample Inactive Student: ${sampleInactive.name} (${sampleInactive.department}) - Roll: ${sampleInactive.rollNo}`);
  }

  // Test 2: Specific Date query
  console.log('\n2. GET /api/activity/daily-roster?date=2026-10-10:');
  const res2 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/activity/daily-roster?date=2026-10-10',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`   Status: ${res2.statusCode}`);
  console.log(`   Date: ${res2.data.date}`);
  console.log(`   Active Count: ${res2.data.summary?.activeCount}`);
  console.log(`   Inactive Count: ${res2.data.summary?.inactiveCount}`);

  console.log('\n✓ All Daily Roster API checks passed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
