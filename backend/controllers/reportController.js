const Student = require('../models/Student');
const Activity = require('../models/Activity');
const Poll = require('../models/Poll');
const PollResponse = require('../models/PollResponse');

// Helper to calculate date range
const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

/**
 * ============================================================================
 * REPORT CONTROLLERS
 * ============================================================================
 */

/**
 * @desc    Get Daily Report (last 24 hours)
 * @route   GET /api/reports/daily
 */
exports.getDailyReport = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeToday = await Student.countDocuments({ activeToday: true });
    const inactiveToday = Math.max(0, totalStudents - activeToday);

    const { start, end } = getDateRange(1);

    const leetcodeActivity = await Activity.countDocuments({
      platform: 'LeetCode',
      activityDate: { $gte: start, $lte: end }
    });

    const codechefActivity = await Activity.countDocuments({
      platform: 'CodeChef',
      activityDate: { $gte: start, $lte: end }
    });

    const githubActivity = await Activity.countDocuments({
      platform: 'GitHub',
      activityDate: { $gte: start, $lte: end }
    });

    const pollResponses = await PollResponse.countDocuments({
      status: 'responded',
      respondedAt: { $gte: start, $lte: end }
    });

    const participationRate = totalStudents > 0 
      ? Math.round((activeToday / totalStudents) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      reportType: 'Daily Report',
      generatedAt: new Date(),
      data: {
        totalStudents,
        activeStudents: activeToday,
        inactiveStudents: inactiveToday,
        participationPercentage: participationRate,
        leetcodeActivity,
        codechefActivity,
        githubActivity,
        pollParticipation: pollResponses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Weekly Report (last 7 days)
 * @route   GET /api/reports/weekly
 */
exports.getWeeklyReport = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeToday = await Student.countDocuments({ activeToday: true });
    const inactiveToday = Math.max(0, totalStudents - activeToday);

    const { start, end } = getDateRange(7);

    const leetcodeActivity = await Activity.countDocuments({
      platform: 'LeetCode',
      activityDate: { $gte: start, $lte: end }
    });

    const codechefActivity = await Activity.countDocuments({
      platform: 'CodeChef',
      activityDate: { $gte: start, $lte: end }
    });

    const githubActivity = await Activity.countDocuments({
      platform: 'GitHub',
      activityDate: { $gte: start, $lte: end }
    });

    const pollResponses = await PollResponse.countDocuments({
      status: 'responded',
      respondedAt: { $gte: start, $lte: end }
    });

    res.status(200).json({
      success: true,
      reportType: 'Weekly Report',
      period: 'Past 7 Days',
      generatedAt: new Date(),
      data: {
        totalStudents,
        activeStudents: activeToday,
        inactiveStudents: inactiveToday,
        leetcodeActivity,
        codechefActivity,
        githubActivity,
        pollParticipation: pollResponses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Monthly Report (last 30 days)
 * @route   GET /api/reports/monthly
 */
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeToday = await Student.countDocuments({ activeToday: true });
    const inactiveToday = Math.max(0, totalStudents - activeToday);

    const { start, end } = getDateRange(30);

    const leetcodeActivity = await Activity.countDocuments({
      platform: 'LeetCode',
      activityDate: { $gte: start, $lte: end }
    });

    const codechefActivity = await Activity.countDocuments({
      platform: 'CodeChef',
      activityDate: { $gte: start, $lte: end }
    });

    const githubActivity = await Activity.countDocuments({
      platform: 'GitHub',
      activityDate: { $gte: start, $lte: end }
    });

    const pollResponses = await PollResponse.countDocuments({
      status: 'responded',
      respondedAt: { $gte: start, $lte: end }
    });

    res.status(200).json({
      success: true,
      reportType: 'Monthly Report',
      period: 'Past 30 Days',
      generatedAt: new Date(),
      data: {
        totalStudents,
        activeStudents: activeToday,
        inactiveStudents: inactiveToday,
        leetcodeActivity,
        codechefActivity,
        githubActivity,
        pollParticipation: pollResponses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================================
 * ANALYTICS CONTROLLERS
 * ============================================================================
 */

/**
 * @desc    Get Analytics Dashboard Summary
 * @route   GET /api/analytics/dashboard
 */
exports.getAnalyticsDashboard = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeToday = await Student.countDocuments({ activeToday: true });
    const inactiveToday = Math.max(0, totalStudents - activeToday);
    const pollResponses = await PollResponse.countDocuments({ status: 'responded' });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeToday,
        inactiveToday,
        pollResponses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Platform Activity Analytics
 * @route   GET /api/analytics/platforms
 */
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();

    const leetcodeActive = await Student.countDocuments({ 'platforms.leetcode': true });
    const codechefActive = await Student.countDocuments({ 'platforms.codechef': true });
    const githubActive = await Student.countDocuments({ 'platforms.github': true });

    res.status(200).json({
      success: true,
      data: {
        leetcode: {
          activeStudents: leetcodeActive,
          percentage: totalStudents > 0 ? Math.round((leetcodeActive / totalStudents) * 100) : 0
        },
        codechef: {
          activeStudents: codechefActive,
          percentage: totalStudents > 0 ? Math.round((codechefActive / totalStudents) * 100) : 0
        },
        github: {
          activeStudents: githubActive,
          percentage: totalStudents > 0 ? Math.round((githubActive / totalStudents) * 100) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Department-wise Statistics
 * @route   GET /api/analytics/departments
 */
exports.getDepartmentAnalytics = async (req, res, next) => {
  try {
    const departments = ['CSE', 'AI&DS', 'ECE', 'EEE', 'MECH'];

    const stats = await Promise.all(
      departments.map(async (dept) => {
        const total = await Student.countDocuments({ department: dept });
        const active = await Student.countDocuments({ department: dept, activeToday: true });
        const inactive = Math.max(0, total - active);
        const participationRate = total > 0 ? Math.round((active / total) * 100) : 0;

        return {
          department: dept,
          totalStudents: total,
          active,
          inactive,
          participationRate
        };
      })
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Daily Activity Statistics
 * @route   GET /api/analytics/daily
 */
exports.getDailyAnalytics = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(1);

    const activities = await Activity.aggregate([
      { $match: { activityDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    const breakdown = {
      LeetCode: 0,
      CodeChef: 0,
      GitHub: 0,
      Poll: 0
    };

    activities.forEach(item => {
      if (breakdown[item._id] !== undefined) {
        breakdown[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      timeframe: 'Daily',
      data: breakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Weekly Activity Statistics
 * @route   GET /api/analytics/weekly
 */
exports.getWeeklyAnalytics = async (req, res, next) => {
  try {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const count = await Activity.countDocuments({
        activityDate: { $gte: dayStart, $lte: dayEnd }
      });

      weeklyData.push({
        day: days[dayStart.getDay()],
        date: dayStart.toISOString().split('T')[0],
        count
      });
    }

    res.status(200).json({
      success: true,
      timeframe: 'Weekly',
      data: weeklyData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================================================
 * MAIN DASHBOARD CONTROLLER
 * ============================================================================
 */

/**
 * @desc    Get combined Dashboard overview
 * @route   GET /api/dashboard
 */
exports.getMainDashboard = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeToday = await Student.countDocuments({ activeToday: true });
    const inactiveToday = Math.max(0, totalStudents - activeToday);

    // Calculate poll participation accurately for featured active poll
    const featuredPoll = await Poll.findOne({ active: true, title: /AI Workshop Interest/i })
      || await Poll.findOne({ active: true }).sort({ createdDate: -1 });

    let featuredPollTitle = 'AI Workshop Interest Survey';
    let pollResponses = 0;
    let notResponded = totalStudents;
    let participationPercentage = 0;

    if (featuredPoll) {
      featuredPollTitle = featuredPoll.title;
      pollResponses = await PollResponse.countDocuments({
        pollId: featuredPoll._id,
        status: 'responded'
      });
      notResponded = Math.max(0, totalStudents - pollResponses);
      participationPercentage = totalStudents > 0 
        ? Math.round((pollResponses / totalStudents) * 100) 
        : 0;
    } else {
      const distinctResponders = await PollResponse.distinct('studentId', { status: 'responded' });
      pollResponses = distinctResponders.length;
      notResponded = Math.max(0, totalStudents - pollResponses);
      participationPercentage = totalStudents > 0 
        ? Math.round((pollResponses / totalStudents) * 100) 
        : 0;
    }

    const totalSubmissions = await PollResponse.countDocuments({ status: 'responded' });

    const leetcodeActive = await Student.countDocuments({ 'platforms.leetcode': true });
    const codechefActive = await Student.countDocuments({ 'platforms.codechef': true });
    const githubActive = await Student.countDocuments({ 'platforms.github': true });

    const recentActivity = await Activity.find()
      .populate('studentId', 'name department')
      .sort({ activityDate: -1 })
      .limit(6);

    const PlatformAccount = require('../models/PlatformAccount');
    const realConnectedStats = {
      github: await PlatformAccount.countDocuments({ platform: 'github', connected: true }),
      leetcode: await PlatformAccount.countDocuments({ platform: 'leetcode', connected: true }),
      codechef: await PlatformAccount.countDocuments({ platform: 'codechef', connected: true }),
      realActivitiesCount: await Activity.countDocuments({ dataSource: 'Real' })
    };

    const formattedRecentActivity = recentActivity.map(act => ({
      id: act._id,
      student: act.studentId ? act.studentId.name : 'Unknown Student',
      department: act.studentId ? act.studentId.department : 'CSE',
      platform: act.platform,
      activity: act.description || `${act.activityType} (${act.activityCount})`,
      time: act.activityDate,
      dataSource: act.dataSource || 'Sample'
    }));

    res.status(200).json({
      success: true,
      data: {
        students: {
          total: totalStudents,
          activeToday,
          inactiveToday
        },
        polls: {
          pollTitle: featuredPollTitle,
          responses: pollResponses,
          notResponded,
          participation: participationPercentage,
          totalSubmissions
        },
        platformActivity: {
          leetcode: leetcodeActive,
          codechef: codechefActive,
          github: githubActive,
          verifiedIntegrations: realConnectedStats
        },
        verifiedIntegrations: realConnectedStats,
        recentActivity: formattedRecentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};
