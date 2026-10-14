const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Student = require('../models/Student');
require('dotenv').config();

async function testDeduplication() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student360');
  console.log('Connected to MongoDB for deduplication verification.');

  try {
    const student = await Student.findOne();
    if (!student) {
      console.log('No student found');
      process.exit(1);
    }

    const testExternalId = `test-gh-event-${Date.now()}`;

    // 1. First insert
    const act1 = await Activity.create({
      studentId: student._id,
      platform: 'GitHub',
      activityType: 'Commit',
      activityCount: 1,
      description: 'Pushed commit to test-repo',
      externalId: testExternalId,
      dataSource: 'Real',
      syncStatus: 'synced',
      activityDate: new Date()
    });
    console.log('✓ Created initial event with externalId:', testExternalId);

    // 2. Second insert attempt with same externalId for the same student
    let duplicateRejected = false;
    try {
      await Activity.create({
        studentId: student._id,
        platform: 'GitHub',
        activityType: 'Commit',
        activityCount: 1,
        description: 'Duplicate pushed commit',
        externalId: testExternalId,
        dataSource: 'Real',
        syncStatus: 'synced',
        activityDate: new Date()
      });
    } catch (err) {
      if (err.code === 11000) {
        duplicateRejected = true;
        console.log('✓ MongoDB compound unique index { studentId: 1, externalId: 1 } successfully prevented duplicate insert! (E11000)');
      } else {
        throw err;
      }
    }

    // Clean up test record
    await Activity.deleteOne({ _id: act1._id });
    console.log('✓ Cleaned up test record.');

    if (duplicateRejected) {
      console.log('Deduplication test PASSED 100%!');
      process.exit(0);
    } else {
      console.error('FAIL: Duplicate was not rejected.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error in dedup test:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testDeduplication();
