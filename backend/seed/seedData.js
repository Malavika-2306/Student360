const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/Student');
const Poll = require('../models/Poll');
const PollResponse = require('../models/PollResponse');
const Activity = require('../models/Activity');

// Load env vars
dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student360';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for seeding: ${mongoUri}`);

    // Clear existing data
    console.log('Clearing old collections...');
    await Student.deleteMany({});
    await Poll.deleteMany({});
    await PollResponse.deleteMany({});
    await Activity.deleteMany({});

    // 1. Create 22 Students with varying platform activity & departments
    console.log('Inserting students...');
    const studentsData = [
      {
        name: 'Anu',
        email: 'anu.cse@college.edu',
        department: 'CSE',
        year: 3,
        platforms: { leetcode: true, codechef: true, github: true },
        activeToday: true
      },
      {
        name: 'Rahul',
        email: 'rahul.aids@college.edu',
        department: 'AI&DS',
        year: 3,
        platforms: { leetcode: true, codechef: false, github: true },
        activeToday: true
      },
      {
        name: 'Priya',
        email: 'priya.cse@college.edu',
        department: 'CSE',
        year: 3,
        platforms: { leetcode: false, codechef: true, github: true },
        activeToday: true
      },
      {
        name: 'Karthik',
        email: 'karthik.ece@college.edu',
        department: 'ECE',
        year: 3,
        platforms: { leetcode: false, codechef: false, github: false },
        activeToday: false
      },
      {
        name: 'Divya',
        email: 'divya.aids@college.edu',
        department: 'AI&DS',
        year: 3,
        platforms: { leetcode: true, codechef: true, github: true },
        activeToday: true
      },
      {
        name: 'Sanjay',
        email: 'sanjay.eee@college.edu',
        department: 'EEE',
        year: 3,
        platforms: { leetcode: false, codechef: false, github: true },
        activeToday: false
      },
      {
        name: 'Meena',
        email: 'meena.cse@college.edu',
        department: 'CSE',
        year: 2,
        platforms: { leetcode: false, codechef: false, github: false },
        activeToday: false
      },
      {
        name: 'Arun',
        email: 'arun.ece@college.edu',
        department: 'ECE',
        year: 3,
        platforms: { leetcode: true, codechef: false, github: false },
        activeToday: true
      },
      {
        name: 'Swetha',
        email: 'swetha.ece@college.edu',
        department: 'ECE',
        year: 4,
        platforms: { leetcode: true, codechef: true, github: false },
        activeToday: true
      },
      {
        name: 'Vignesh',
        email: 'vignesh.eee@college.edu',
        department: 'EEE',
        year: 3,
        platforms: { leetcode: false, codechef: false, github: false },
        activeToday: false
      },
      {
        name: 'Deepak',
        email: 'deepak.mech@college.edu',
        department: 'MECH',
        year: 3,
        platforms: { leetcode: false, codechef: false, github: true },
        activeToday: true
      },
      {
        name: 'Kavya',
        email: 'kavya.cse@college.edu',
        department: 'CSE',
        year: 2,
        platforms: { leetcode: true, codechef: true, github: true },
        activeToday: true
      },
      {
        name: 'Manoj',
        email: 'manoj.mech@college.edu',
        department: 'MECH',
        year: 4,
        platforms: { leetcode: false, codechef: false, github: false },
        activeToday: false
      },
      {
        name: 'Harini',
        email: 'harini.aids@college.edu',
        department: 'AI&DS',
        year: 3,
        platforms: { leetcode: true, codechef: true, github: false },
        activeToday: true
      },
      {
        name: 'Gowtham',
        email: 'gowtham.eee@college.edu',
        department: 'EEE',
        year: 2,
        platforms: { leetcode: false, codechef: true, github: false },
        activeToday: true
      },
      {
        name: 'Nithya',
        email: 'nithya.ece@college.edu',
        department: 'ECE',
        year: 3,
        platforms: { leetcode: false, codechef: false, github: false },
        activeToday: false
      },
      {
        name: 'Rohan',
        email: 'rohan.cse@college.edu',
        department: 'CSE',
        year: 4,
        platforms: { leetcode: true, codechef: false, github: true },
        activeToday: true
      },
      {
        name: 'Sneha',
        email: 'sneha.aids@college.edu',
        department: 'AI&DS',
        year: 2,
        platforms: { leetcode: true, codechef: true, github: true },
        activeToday: true
      },
      {
        name: 'Praveen',
        email: 'praveen.mech@college.edu',
        department: 'MECH',
        year: 3,
        platforms: { leetcode: false, codechef: false, github: false },
        activeToday: false
      },
      {
        name: 'Abinaya',
        email: 'abinaya.cse@college.edu',
        department: 'CSE',
        year: 3,
        platforms: { leetcode: true, codechef: true, github: true },
        activeToday: true
      },
      {
        name: 'Dinesh',
        email: 'dinesh.ece@college.edu',
        department: 'ECE',
        year: 2,
        platforms: { leetcode: false, codechef: false, github: true },
        activeToday: true
      },
      {
        name: 'Suresh',
        email: 'suresh.eee@college.edu',
        department: 'EEE',
        year: 4,
        platforms: { leetcode: false, codechef: false, github: false },
        activeToday: false
      }
    ];

    const insertedStudents = await Student.insertMany(studentsData);
    console.log(`Inserted ${insertedStudents.length} students successfully.`);

    // 2. Create 5 Polls
    console.log('Inserting polls...');
    const pollsData = [
      {
        title: 'AI Workshop Interest',
        description: 'Assessing student interest for a 3-day hands-on workshop on generative AI & Deep Learning.',
        active: true,
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Coding Contest Participation',
        description: 'Confirmation of registration for the Inter-College Bi-Weekly Coding Starters challenge.',
        active: true,
        createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Technology Preference',
        description: 'Survey regarding choice of career track: Full Stack Web, Core Systems, or Cloud DevOps.',
        active: true,
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Cloud & DevOps Bootcamp',
        description: 'Interest in AWS & Docker weekend certification cohort for 3rd and 4th year engineers.',
        active: true,
        createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Inter-College Hackathon 2026',
        description: 'Participation confirmation for the upcoming 36-hour annual software hackathon.',
        active: false,
        createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      }
    ];

    const insertedPolls = await Poll.insertMany(pollsData);
    console.log(`Inserted ${insertedPolls.length} polls successfully.`);

    // 3. Create Poll Responses
    // CRITICAL: Distinguish:
    // - status="responded", answer="Interested"
    // - status="responded", answer="Not Interested"
    // - Students who have NO response record (will be queried by /not-responded)
    console.log('Inserting poll responses with distinct Interested, Not Interested, and Unanswered...');
    const poll1 = insertedPolls[0]; // AI Workshop Interest
    const poll2 = insertedPolls[1]; // Coding Contest Participation
    const poll3 = insertedPolls[2]; // Technology Preference

    // For Poll 1:
    // Anu, Rahul, Divya, Arun, Kavya, Harini, Rohan, Sneha, Abinaya -> Interested
    // Priya, Swetha, Deepak, Gowtham -> Not Interested
    // Karthik, Sanjay, Meena, Vignesh, Manoj, Nithya, Praveen, Dinesh, Suresh -> NOT RESPONDED (no record)
    const poll1Responses = [
      { pollId: poll1._id, studentId: insertedStudents[0]._id, status: 'responded', answer: 'Interested' }, // Anu
      { pollId: poll1._id, studentId: insertedStudents[1]._id, status: 'responded', answer: 'Interested' }, // Rahul
      { pollId: poll1._id, studentId: insertedStudents[2]._id, status: 'responded', answer: 'Not Interested' }, // Priya (Responded, but Not Interested)
      { pollId: poll1._id, studentId: insertedStudents[4]._id, status: 'responded', answer: 'Interested' }, // Divya
      { pollId: poll1._id, studentId: insertedStudents[7]._id, status: 'responded', answer: 'Interested' }, // Arun
      { pollId: poll1._id, studentId: insertedStudents[8]._id, status: 'responded', answer: 'Not Interested' }, // Swetha (Responded, but Not Interested)
      { pollId: poll1._id, studentId: insertedStudents[10]._id, status: 'responded', answer: 'Not Interested' }, // Deepak
      { pollId: poll1._id, studentId: insertedStudents[11]._id, status: 'responded', answer: 'Interested' }, // Kavya
      { pollId: poll1._id, studentId: insertedStudents[13]._id, status: 'responded', answer: 'Interested' }, // Harini
      { pollId: poll1._id, studentId: insertedStudents[14]._id, status: 'responded', answer: 'Not Interested' }, // Gowtham
      { pollId: poll1._id, studentId: insertedStudents[16]._id, status: 'responded', answer: 'Interested' }, // Rohan
      { pollId: poll1._id, studentId: insertedStudents[17]._id, status: 'responded', answer: 'Interested' }, // Sneha
      { pollId: poll1._id, studentId: insertedStudents[19]._id, status: 'responded', answer: 'Interested' }, // Abinaya
    ];

    // For Poll 2 responses
    const poll2Responses = [
      { pollId: poll2._id, studentId: insertedStudents[0]._id, status: 'responded', answer: 'Yes' },
      { pollId: poll2._id, studentId: insertedStudents[1]._id, status: 'responded', answer: 'Yes' },
      { pollId: poll2._id, studentId: insertedStudents[2]._id, status: 'responded', answer: 'Yes' },
      { pollId: poll2._id, studentId: insertedStudents[4]._id, status: 'responded', answer: 'Yes' },
      { pollId: poll2._id, studentId: insertedStudents[8]._id, status: 'responded', answer: 'Yes' },
      { pollId: poll2._id, studentId: insertedStudents[11]._id, status: 'responded', answer: 'Yes' },
      { pollId: poll2._id, studentId: insertedStudents[13]._id, status: 'responded', answer: 'No' }, // Not Interested
      { pollId: poll2._id, studentId: insertedStudents[16]._id, status: 'responded', answer: 'Yes' },
      { pollId: poll2._id, studentId: insertedStudents[17]._id, status: 'responded', answer: 'Yes' },
      { pollId: poll2._id, studentId: insertedStudents[19]._id, status: 'responded', answer: 'Yes' },
    ];

    // For Poll 3 responses
    const poll3Responses = [
      { pollId: poll3._id, studentId: insertedStudents[0]._id, status: 'responded', answer: 'Full Stack Web' },
      { pollId: poll3._id, studentId: insertedStudents[1]._id, status: 'responded', answer: 'Cloud DevOps' },
      { pollId: poll3._id, studentId: insertedStudents[2]._id, status: 'responded', answer: 'Full Stack Web' },
      { pollId: poll3._id, studentId: insertedStudents[4]._id, status: 'responded', answer: 'Core Systems' },
      { pollId: poll3._id, studentId: insertedStudents[7]._id, status: 'responded', answer: 'Core Systems' },
      { pollId: poll3._id, studentId: insertedStudents[11]._id, status: 'responded', answer: 'Full Stack Web' },
      { pollId: poll3._id, studentId: insertedStudents[16]._id, status: 'responded', answer: 'Cloud DevOps' },
      { pollId: poll3._id, studentId: insertedStudents[17]._id, status: 'responded', answer: 'Core Systems' },
    ];

    const allResponses = [...poll1Responses, ...poll2Responses, ...poll3Responses];
    await PollResponse.insertMany(allResponses);
    console.log(`Inserted ${allResponses.length} poll responses.`);

    // 4. Create Activity Records
    console.log('Inserting platform activity records...');
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const activitiesData = [
      {
        studentId: insertedStudents[0]._id, // Anu
        platform: 'LeetCode',
        activityType: 'Problem Solved',
        activityCount: 3,
        activityDate: now,
        description: 'Solved 3 problems (Medium: Dynamic Programming)'
      },
      {
        studentId: insertedStudents[2]._id, // Priya
        platform: 'CodeChef',
        activityType: 'Contest Completed',
        activityCount: 1,
        activityDate: oneHourAgo,
        description: 'Completed contest Starters 154 (Rank #142)'
      },
      {
        studentId: insertedStudents[1]._id, // Rahul
        platform: 'GitHub',
        activityType: 'Commit',
        activityCount: 4,
        activityDate: twoHoursAgo,
        description: 'New repository commit (student-vision-ai)'
      },
      {
        studentId: insertedStudents[4]._id, // Divya
        platform: 'Poll',
        activityType: 'Poll Response',
        activityCount: 1,
        activityDate: now,
        description: 'Submitted response for AI Workshop Interest'
      },
      {
        studentId: insertedStudents[7]._id, // Arun
        platform: 'LeetCode',
        activityType: 'Problem Solved',
        activityCount: 2,
        activityDate: yesterday,
        description: 'Solved 2 problems (Easy: Two Sum, Valid Parentheses)'
      },
      {
        studentId: insertedStudents[8]._id, // Swetha
        platform: 'CodeChef',
        activityType: 'Problem Solved',
        activityCount: 4,
        activityDate: yesterday,
        description: 'Practiced 4 Beginner problems'
      },
      {
        studentId: insertedStudents[11]._id, // Kavya
        platform: 'GitHub',
        activityType: 'Commit',
        activityCount: 2,
        activityDate: now,
        description: 'Pushed code to FullStack-Lab repo'
      },
      {
        studentId: insertedStudents[16]._id, // Rohan
        platform: 'LeetCode',
        activityType: 'Problem Solved',
        activityCount: 5,
        activityDate: yesterday,
        description: 'Solved 5 Graph traversal problems'
      },
      {
        studentId: insertedStudents[17]._id, // Sneha
        platform: 'CodeChef',
        activityType: 'Contest Completed',
        activityCount: 1,
        activityDate: twoDaysAgo,
        description: 'Participated in Starters Division 2'
      },
      {
        studentId: insertedStudents[19]._id, // Abinaya
        platform: 'LeetCode',
        activityType: 'Problem Solved',
        activityCount: 3,
        activityDate: now,
        description: 'Practiced Binary Search & Two Pointers'
      },
      {
        studentId: insertedStudents[10]._id, // Deepak
        platform: 'GitHub',
        activityType: 'Commit',
        activityCount: 1,
        activityDate: now,
        description: 'Updated CAD modeling scripts'
      },
      {
        studentId: insertedStudents[14]._id, // Gowtham
        platform: 'CodeChef',
        activityType: 'Problem Solved',
        activityCount: 2,
        activityDate: yesterday,
        description: 'Solved Number Theory basics'
      }
    ];

    await Activity.insertMany(activitiesData);
    console.log(`Inserted ${activitiesData.length} activity records.`);

    console.log('\n==========================================');
    console.log('✅ SEEDING COMPLETE FOR STUDENT360');
    console.log(`Students: ${insertedStudents.length}`);
    console.log(`Polls: ${insertedPolls.length}`);
    console.log(`Poll Responses: ${allResponses.length}`);
    console.log(`Activities: ${activitiesData.length}`);
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
