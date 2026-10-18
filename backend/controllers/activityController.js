const Activity = require('../models/Activity');
const Student = require('../models/Student');
const PollResponse = require('../models/PollResponse');
const NotificationLog = require('../models/NotificationLog');

/**
 * @desc    Get all activity records
 * @route   GET /api/activity
 */
exports.getAllActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find()
      .populate('studentId', 'name email department year')
      .sort({ activityDate: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add new activity record
 * @route   POST /api/activity
 */
exports.addActivity = async (req, res, next) => {
  try {
    const { studentId, platform, activityType, activityCount, description, activityDate } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const activity = await Activity.create({
      studentId,
      platform,
      activityType,
      activityCount: activityCount || 1,
      description,
      activityDate: activityDate || new Date()
    });

    // Mark student as active today
    await Student.findByIdAndUpdate(studentId, { activeToday: true });

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get today's activity records
 * @route   GET /api/activity/today
 */
exports.getTodayActivity = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const activities = await Activity.find({
      activityDate: { $gte: startOfToday, $lte: endOfToday }
    })
      .populate('studentId', 'name email department year')
      .sort({ activityDate: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activity for one student
 * @route   GET /api/activity/student/:studentId
 */
exports.getStudentActivity = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const activities = await Activity.find({ studentId })
      .sort({ activityDate: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      student: student.name,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activity for a specific platform (LeetCode, CodeChef, GitHub, Poll)
 * @route   GET /api/activity/platform/:platform
 */
exports.getPlatformActivity = async (req, res, next) => {
  try {
    const { platform } = req.params;

    const activities = await Activity.find({
      platform: { $regex: new RegExp(`^${platform}$`, 'i') }
    })
      .populate('studentId', 'name email department year')
      .sort({ activityDate: -1 });

    res.status(200).json({
      success: true,
      platform,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activity summary counts across platforms
 * @route   GET /api/activity/summary
 */
exports.getActivitySummary = async (req, res, next) => {
  try {
    const leetcodeCount = await Activity.countDocuments({ platform: 'LeetCode' });
    const codechefCount = await Activity.countDocuments({ platform: 'CodeChef' });
    const githubCount = await Activity.countDocuments({ platform: 'GitHub' });
    const pollResponsesCount = await PollResponse.countDocuments({ status: 'responded' });
    const realCount = await Activity.countDocuments({ dataSource: 'Real' });
    const sampleCount = await Activity.countDocuments({ dataSource: 'Sample' });

    res.status(200).json({
      success: true,
      data: {
        leetcode: leetcodeCount,
        codechef: codechefCount,
        github: githubCount,
        polls: pollResponsesCount,
        realCount,
        sampleCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Daily Student Activity Roster for a selected date
 *          Categorizes students into active (with completed activities) vs inactive (no activity recorded)
 * @route   GET /api/activity/daily-roster?date=YYYY-MM-DD
 */
exports.getDailyRoster = async (req, res, next) => {
  try {
    const { date } = req.query;

    // Parse target date (defaults to today)
    let targetDate = new Date();
    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const day = targetDate.getDate();

    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
    const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 1. Fetch all students in the institution
    const allStudents = await Student.find().sort({ name: 1 });

    // 2. Fetch all activities recorded for this date
    const activities = await Activity.find({
      activityDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate('studentId', 'name rollNo department email year activeToday streak lastActive');

    // 3. Group activities by student ID string
    const studentActivityMap = new Map();

    activities.forEach((act) => {
      const student = act.studentId;
      if (!student) return;
      const sId = student._id.toString();

      if (!studentActivityMap.has(sId)) {
        studentActivityMap.set(sId, {
          studentId: sId,
          _id: sId,
          name: student.name,
          rollNo: student.rollNo || `STU-${sId.slice(-4).toUpperCase()}`,
          department: student.department || 'CSE',
          year: student.year || 3,
          email: student.email || '',
          activities: [],
          platforms: new Set(),
          totalCount: 0
        });
      }

      const entry = studentActivityMap.get(sId);
      entry.activities.push({
        id: act._id,
        _id: act._id,
        platform: act.platform,
        activityType: act.activityType,
        activityCount: act.activityCount || 1,
        description: act.description || `${act.activityType} on ${act.platform}`,
        time: act.activityDate ? new Date(act.activityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
        dataSource: act.dataSource || 'Sample'
      });
      entry.platforms.add(act.platform);
      entry.totalCount += (act.activityCount || 1);
    });

    // 4. Split students into activeStudents vs inactiveStudents
    const activeStudents = [];
    const inactiveStudents = [];

    allStudents.forEach((student) => {
      const sId = student._id.toString();
      const roll = student.rollNo || (student.email ? student.email.split('@')[0].toUpperCase() : `STU-${sId.slice(-4).toUpperCase()}`);

      if (studentActivityMap.has(sId)) {
        const item = studentActivityMap.get(sId);
        activeStudents.push({
          ...item,
          platforms: Array.from(item.platforms),
          streak: student.streak || 1,
          lastActive: 'Active on selected date'
        });
      } else {
        inactiveStudents.push({
          studentId: sId,
          _id: sId,
          name: student.name,
          rollNo: roll,
          department: student.department || 'CSE',
          year: student.year || 3,
          email: student.email || '',
          lastActive: student.lastActive || 'No recorded activity',
          streak: 0
        });
      }
    });

    // 5. Compute summary statistics
    const totalStudents = allStudents.length;
    const activeCount = activeStudents.length;
    const inactiveCount = inactiveStudents.length;
    const participationRate = totalStudents > 0 ? Math.round((activeCount / totalStudents) * 100) : 0;

    const platformBreakdown = {
      leetcode: activities.filter(a => (a.platform || '').toLowerCase() === 'leetcode').length,
      codechef: activities.filter(a => (a.platform || '').toLowerCase() === 'codechef').length,
      github: activities.filter(a => (a.platform || '').toLowerCase() === 'github').length,
      poll: activities.filter(a => (a.platform || '').toLowerCase() === 'poll').length
    };

    res.status(200).json({
      success: true,
      date: dateFormatted,
      summary: {
        totalStudents,
        activeCount,
        inactiveCount,
        participationRate,
        platforms: platformBreakdown
      },
      activeStudents,
      inactiveStudents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dispatch inactivity reminder alerts to student(s)
 * @route   POST /api/activity/alerts/send
 */
exports.sendInactivityAlert = async (req, res, next) => {
  try {
    const { studentId, studentIds, date, message: customMessage } = req.body;
    let targetIds = [];

    if (Array.isArray(studentIds) && studentIds.length > 0) {
      targetIds = studentIds;
    } else if (studentId) {
      targetIds = [studentId];
    } else {
      return res.status(400).json({
        success: false,
        message: 'At least one studentId or studentIds array is required.'
      });
    }

    const students = await Student.find({ _id: { $in: targetIds } });
    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching students found in database.'
      });
    }

    const dateTarget = date ? new Date(date) : new Date();
    const createdLogs = [];

    for (const stu of students) {
      const alertMsg = customMessage || `Faculty reminder: Zero learning activity was recorded for ${stu.name} on ${dateTarget.toLocaleDateString()}. Please complete your daily problem on LeetCode/CodeChef or commit to your GitHub repository.`;
      
      const log = await NotificationLog.create({
        studentId: stu._id,
        studentName: stu.name,
        studentEmail: stu.email || `${stu.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@college.edu`,
        alertType: 'inactivity_warning',
        targetDate: dateTarget,
        message: alertMsg,
        channel: 'Email & Student Portal',
        status: 'delivered',
        sentAt: new Date()
      });

      createdLogs.push({
        logId: log._id,
        studentId: stu._id,
        name: stu.name,
        email: log.studentEmail,
        sentAt: log.sentAt
      });
    }

    res.status(200).json({
      success: true,
      message: `Inactivity alert dispatched successfully to ${createdLogs.length} student(s).`,
      count: createdLogs.length,
      dispatched: createdLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get history of dispatched student notifications
 * @route   GET /api/activity/alerts/history
 */
exports.getAlertHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const logs = await NotificationLog.find()
      .populate('studentId', 'name department rollNo')
      .sort({ sentAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};


