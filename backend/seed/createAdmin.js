const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');

// Load environment configuration
dotenv.config();

const createAccounts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student360';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB: ${mongoUri}`);

    // Admin Credentials
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@student360.edu').toLowerCase().trim();
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Student360';
    const adminName = process.env.INITIAL_ADMIN_NAME || 'Dr. Malavika';

    // 1. Check if an admin account already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`[INFO] Administrator account already exists: ${existingAdmin.email} (${existingAdmin.name})`);
    } else {
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        studentId: null
      });
      console.log(`[SUCCESS] Admin account created successfully!`);
      console.log(`  - Name:     ${admin.name}`);
      console.log(`  - Email:    ${admin.email}`);
      console.log(`  - Role:     ${admin.role}`);
      console.log(`  - Password: ${adminPassword}`);
    }

    // 2. Check if a student login account exists
    const studentEmail = (process.env.INITIAL_STUDENT_EMAIL || 'anu.cse@college.edu').toLowerCase().trim();
    const studentPassword = process.env.INITIAL_STUDENT_PASSWORD || 'Student@Student360';

    let studentProfile = await Student.findOne({ email: studentEmail });
    if (!studentProfile) {
      // Find the first student in the database to link to
      studentProfile = await Student.findOne();
    }

    if (studentProfile) {
      const existingStudentUser = await User.findOne({ email: studentProfile.email });
      if (existingStudentUser) {
        console.log(`[INFO] Student login account already exists: ${existingStudentUser.email} (Linked to Student: ${studentProfile.name})`);
      } else {
        const studentUser = await User.create({
          name: studentProfile.name,
          email: studentProfile.email,
          password: studentPassword,
          role: 'student',
          studentId: studentProfile._id
        });
        console.log(`[SUCCESS] Student account created successfully!`);
        console.log(`  - Name:       ${studentUser.name}`);
        console.log(`  - Email:      ${studentUser.email}`);
        console.log(`  - Role:       ${studentUser.role}`);
        console.log(`  - Student ID: ${studentProfile._id}`);
        console.log(`  - Password:   ${studentPassword}`);
      }
    } else {
      console.log('[WARN] No student profile found in database to link student account.');
    }

    console.log('\n--- Account setup completed safely. Existing student data was preserved. ---');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Failed to create accounts:', error);
    process.exit(1);
  }
};

createAccounts();
