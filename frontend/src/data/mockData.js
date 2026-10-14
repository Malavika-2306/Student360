// Mock Data for Student360 – Learning Activity & Performance Analytics

export const INITIAL_STUDENTS = [
  {
    id: 1,
    rollNo: "22CS101",
    name: "Anu",
    department: "CSE",
    email: "anu.cse@college.edu",
    leetcode: true,
    codechef: true,
    github: true,
    activeToday: true,
    streak: 18,
    lastActive: "10 mins ago"
  },
  {
    id: 2,
    rollNo: "22AD204",
    name: "Rahul",
    department: "AI&DS",
    email: "rahul.aids@college.edu",
    leetcode: true,
    codechef: false,
    github: true,
    activeToday: true,
    streak: 12,
    lastActive: "1 hour ago"
  },
  {
    id: 3,
    rollNo: "22CS142",
    name: "Priya",
    department: "CSE",
    email: "priya.cse@college.edu",
    leetcode: false,
    codechef: true,
    github: true,
    activeToday: true,
    streak: 15,
    lastActive: "25 mins ago"
  },
  {
    id: 4,
    rollNo: "22EC305",
    name: "Karthik",
    department: "ECE",
    email: "karthik.ece@college.edu",
    leetcode: false,
    codechef: false,
    github: false,
    activeToday: false,
    streak: 0,
    lastActive: "3 days ago"
  },
  {
    id: 5,
    rollNo: "22AD218",
    name: "Divya",
    department: "AI&DS",
    email: "divya.aids@college.edu",
    leetcode: true,
    codechef: true,
    github: true,
    activeToday: true,
    streak: 24,
    lastActive: "2 hours ago"
  },
  {
    id: 6,
    rollNo: "22EE412",
    name: "Sanjay",
    department: "EEE",
    email: "sanjay.eee@college.edu",
    leetcode: false,
    codechef: false,
    github: true,
    activeToday: false,
    streak: 2,
    lastActive: "1 day ago"
  },
  {
    id: 7,
    rollNo: "22CS189",
    name: "Meena",
    department: "CSE",
    email: "meena.cse@college.edu",
    leetcode: false,
    codechef: false,
    github: false,
    activeToday: false,
    streak: 0,
    lastActive: "4 days ago"
  },
  {
    id: 8,
    rollNo: "22ME508",
    name: "Arun",
    department: "MECH",
    email: "arun.mech@college.edu",
    leetcode: true,
    codechef: false,
    github: false,
    activeToday: true,
    streak: 8,
    lastActive: "35 mins ago"
  },
  {
    id: 9,
    rollNo: "22EC322",
    name: "Swetha",
    department: "ECE",
    email: "swetha.ece@college.edu",
    leetcode: true,
    codechef: true,
    github: false,
    activeToday: true,
    streak: 9,
    lastActive: "4 hours ago"
  },
  {
    id: 10,
    rollNo: "22EE430",
    name: "Vignesh",
    department: "EEE",
    email: "vignesh.eee@college.edu",
    leetcode: false,
    codechef: false,
    github: false,
    activeToday: false,
    streak: 0,
    lastActive: "5 days ago"
  }
];

export const INITIAL_POLLS = [
  {
    id: 1,
    title: "AI Workshop Interest",
    description: "Assessing interest for the upcoming 3-day hands-on generative AI & deep learning workshop.",
    dateCreated: "02 Oct 2026",
    deadline: "10 Oct 2026",
    totalStudents: 500,
    responded: 420,
    notResponded: 80,
    category: "Technical Workshop",
    status: "Active"
  },
  {
    id: 2,
    title: "Placement Training Preferences",
    description: "Select preferred tracks: Full Stack Web, Core Systems, or Cloud & DevOps.",
    dateCreated: "25 Sep 2026",
    deadline: "05 Oct 2026",
    totalStudents: 500,
    responded: 380,
    notResponded: 120,
    category: "Career & Placements",
    status: "Active"
  },
  {
    id: 3,
    title: "Semester Hackathon Registration",
    description: "Participation confirmation for the 36-hour Inter-Department Hackathon 2026.",
    dateCreated: "18 Sep 2026",
    deadline: "30 Sep 2026",
    totalStudents: 500,
    responded: 460,
    notResponded: 40,
    category: "Competition",
    status: "Closed"
  }
];

// Student poll responses:
// CRITICAL PROJECT DISTINCTION:
// - status: "responded" with answer: "Interested" or "Not Interested"
// - status: "not_responded" (student who has not submitted at all)
export const POLL_RESPONSES = [
  // Poll 1: AI Workshop Interest
  { studentId: 1, pollId: 1, status: "responded", answer: "Interested", respondedAt: "02 Oct, 10:30 AM" },
  { studentId: 2, pollId: 1, status: "responded", answer: "Interested", respondedAt: "02 Oct, 11:15 AM" },
  { studentId: 3, pollId: 1, status: "responded", answer: "Not Interested", respondedAt: "02 Oct, 02:40 PM" },
  { studentId: 4, pollId: 1, status: "not_responded", answer: null, respondedAt: null },
  { studentId: 5, pollId: 1, status: "responded", answer: "Interested", respondedAt: "03 Oct, 09:00 AM" },
  { studentId: 6, pollId: 1, status: "not_responded", answer: null, respondedAt: null },
  { studentId: 7, pollId: 1, status: "not_responded", answer: null, respondedAt: null },
  { studentId: 8, pollId: 1, status: "responded", answer: "Interested", respondedAt: "03 Oct, 04:20 PM" },
  { studentId: 9, pollId: 1, status: "responded", answer: "Not Interested", respondedAt: "04 Oct, 08:50 AM" },
  { studentId: 10, pollId: 1, status: "not_responded", answer: null, respondedAt: null },

  // Poll 2: Placement Training Preferences
  { studentId: 1, pollId: 2, status: "responded", answer: "Full Stack Track", respondedAt: "26 Sep, 09:10 AM" },
  { studentId: 2, pollId: 2, status: "responded", answer: "Cloud & DevOps", respondedAt: "26 Sep, 10:45 AM" },
  { studentId: 3, pollId: 2, status: "responded", answer: "Full Stack Track", respondedAt: "27 Sep, 01:20 PM" },
  { studentId: 4, pollId: 2, status: "not_responded", answer: null, respondedAt: null },
  { studentId: 5, pollId: 2, status: "responded", answer: "Core Systems", respondedAt: "27 Sep, 03:00 PM" },
  { studentId: 6, pollId: 2, status: "not_responded", answer: null, respondedAt: null },
  { studentId: 7, pollId: 2, status: "not_responded", answer: null, respondedAt: null },
  { studentId: 8, pollId: 2, status: "responded", answer: "Core Systems", respondedAt: "28 Sep, 11:00 AM" },
  { studentId: 9, pollId: 2, status: "responded", answer: "Not Interested", respondedAt: "28 Sep, 02:15 PM" },
  { studentId: 10, pollId: 2, status: "not_responded", answer: null, respondedAt: null },

  // Poll 3: Hackathon
  { studentId: 1, pollId: 3, status: "responded", answer: "Team Lead Confirmed", respondedAt: "19 Sep, 11:00 AM" },
  { studentId: 2, pollId: 3, status: "responded", answer: "Solo Participant", respondedAt: "19 Sep, 03:20 PM" },
  { studentId: 3, pollId: 3, status: "responded", answer: "Team Member Confirmed", respondedAt: "20 Sep, 10:05 AM" },
  { studentId: 4, pollId: 3, status: "not_responded", answer: null, respondedAt: null },
  { studentId: 5, pollId: 3, status: "responded", answer: "Team Lead Confirmed", respondedAt: "20 Sep, 04:45 PM" },
  { studentId: 6, pollId: 3, status: "responded", answer: "Not Interested", respondedAt: "21 Sep, 01:30 PM" },
  { studentId: 7, pollId: 3, status: "not_responded", answer: null, respondedAt: null },
  { studentId: 8, pollId: 3, status: "responded", answer: "Solo Participant", respondedAt: "21 Sep, 05:10 PM" },
  { studentId: 9, pollId: 3, status: "responded", answer: "Team Member Confirmed", respondedAt: "22 Sep, 09:30 AM" },
  { studentId: 10, pollId: 3, status: "not_responded", answer: null, respondedAt: null }
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    student: "Anu",
    department: "CSE",
    platform: "LeetCode",
    activity: "Solved 3 problems (Medium: Dynamic Programming)",
    time: "10 mins ago"
  },
  {
    id: 2,
    student: "Priya",
    department: "CSE",
    platform: "CodeChef",
    activity: "Completed contest Starters 154 (Rank #142)",
    time: "25 mins ago"
  },
  {
    id: 3,
    student: "Rahul",
    department: "AI&DS",
    platform: "GitHub",
    activity: "New repository commit (student-vision-ai)",
    time: "1 hour ago"
  },
  {
    id: 4,
    student: "Divya",
    department: "AI&DS",
    platform: "Poll",
    activity: "Submitted response for AI Workshop Interest",
    time: "2 hours ago"
  },
  {
    id: 5,
    student: "Arun",
    department: "MECH",
    platform: "LeetCode",
    activity: "Solved 2 problems (Easy: Two Sum, Valid Parentheses)",
    time: "3 hours ago"
  },
  {
    id: 6,
    student: "Swetha",
    department: "ECE",
    platform: "CodeChef",
    activity: "Practiced 4 Beginner problems",
    time: "4 hours ago"
  }
];

export const WEEKLY_ACTIVITY_DATA = {
  Today: [
    { day: "08:00", count: 45, label: "Morning" },
    { day: "10:00", count: 88, label: "Peak 1" },
    { day: "12:00", count: 62, label: "Noon" },
    { day: "14:00", count: 74, label: "Lab Hrs" },
    { day: "16:00", count: 110, label: "Evening" },
    { day: "18:00", count: 95, label: "Contest" },
    { day: "20:00", count: 130, label: "Night Peak" }
  ],
  "This Week": [
    { day: "Mon", count: 280, label: "280 Activities" },
    { day: "Tue", count: 320, label: "320 Activities" },
    { day: "Wed", count: 395, label: "395 Activities" },
    { day: "Thu", count: 340, label: "340 Activities" },
    { day: "Fri", count: 410, label: "410 Activities" },
    { day: "Sat", count: 480, label: "480 (Contest Day)" },
    { day: "Sun", count: 365, label: "365 Activities" }
  ],
  "This Month": [
    { day: "Week 1", count: 1850, label: "Week 1 (Sept 1-7)" },
    { day: "Week 2", count: 2120, label: "Week 2 (Sept 8-14)" },
    { day: "Week 3", count: 2430, label: "Week 3 (Sept 15-21)" },
    { day: "Week 4", count: 2790, label: "Week 4 (Sept 22-28)" },
    { day: "Week 5", count: 1680, label: "Current (Oct)" }
  ]
};

export const DEPARTMENT_ANALYTICS = [
  { department: "CSE", total: 160, active: 138, inactive: 22, participationRate: 86 },
  { department: "AI&DS", total: 110, active: 94, inactive: 16, participationRate: 85 },
  { department: "ECE", total: 95, active: 52, inactive: 43, participationRate: 55 },
  { department: "EEE", total: 75, active: 36, inactive: 39, participationRate: 48 },
  { department: "MECH", total: 60, active: 22, inactive: 38, participationRate: 37 }
];

export const RECENT_REPORTS = [
  {
    id: "REP-001",
    name: "Daily Activity Report",
    date: "04 Oct 2026",
    students: 500,
    participation: "68%",
    status: "Generated",
    type: "Daily"
  },
  {
    id: "REP-002",
    name: "Weekly Engagement Summary",
    date: "01 Oct 2026",
    students: 500,
    participation: "74%",
    status: "Generated",
    type: "Weekly"
  },
  {
    id: "REP-003",
    name: "AI Workshop Poll Audit",
    date: "28 Sep 2026",
    students: 500,
    participation: "84%",
    status: "Generated",
    type: "Poll"
  },
  {
    id: "REP-004",
    name: "Monthly Department Review",
    date: "25 Sep 2026",
    students: 500,
    participation: "71%",
    status: "Generated",
    type: "Monthly"
  },
  {
    id: "REP-005",
    name: "CodeChef Contest Analysis",
    date: "20 Sep 2026",
    students: 500,
    participation: "62%",
    status: "Generated",
    type: "Platform"
  }
];
