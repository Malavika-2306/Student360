const { execSync } = require('child_process');
const path = require('path');

const testFiles = [
  'tests/authTest.js',
  'tests/dailyRosterTest.js',
  'tests/dedupTest.js',
  'tests/integrationE2ETest.js',
  'tests/oauthFlowTest.js'
];

console.log('========================================================');
console.log('       STUDENT360 COMPLETE TEST SUITE RUNNER');
console.log('========================================================\n');

let allPassed = true;

for (const testFile of testFiles) {
  console.log(`\n>>> RUNNING: ${testFile}`);
  try {
    execSync(`node ${testFile}`, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`\n[FAILED] Test suite ${testFile} failed.`);
    allPassed = false;
    break;
  }
}

console.log('\n========================================================');
if (allPassed) {
  console.log('  [ALL PASSED] All 5 Student360 test suites passed cleanly!');
  console.log('========================================================\n');
  process.exit(0);
} else {
  console.log('  [FAILURES DETECTED] Some tests failed.');
  console.log('========================================================\n');
  process.exit(1);
}
