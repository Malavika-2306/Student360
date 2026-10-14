const Poll = require('../models/Poll');
const PollResponse = require('../models/PollResponse');
const Student = require('../models/Student');

/**
 * @desc    Get all polls
 * @route   GET /api/polls
 */
exports.getAllPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find().sort({ createdDate: -1 });

    // Enhance each poll with live counts
    const totalStudents = await Student.countDocuments();

    const pollsWithStats = await Promise.all(
      polls.map(async (poll) => {
        const respondedCount = await PollResponse.countDocuments({
          pollId: poll._id,
          status: 'responded'
        });
        const notRespondedCount = Math.max(0, totalStudents - respondedCount);
        const participationPercentage = totalStudents > 0 
          ? Math.round((respondedCount / totalStudents) * 100) 
          : 0;

        return {
          ...poll.toObject(),
          totalStudents,
          responded: respondedCount,
          notResponded: notRespondedCount,
          participationPercentage
        };
      })
    );

    res.status(200).json({
      success: true,
      count: pollsWithStats.length,
      data: pollsWithStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single poll by ID
 * @route   GET /api/polls/:id
 */
exports.getPollById = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const totalStudents = await Student.countDocuments();
    const respondedCount = await PollResponse.countDocuments({
      pollId: poll._id,
      status: 'responded'
    });
    const notRespondedCount = Math.max(0, totalStudents - respondedCount);
    const participationPercentage = totalStudents > 0 
      ? Math.round((respondedCount / totalStudents) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...poll.toObject(),
        totalStudents,
        responded: respondedCount,
        notResponded: notRespondedCount,
        participationPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new poll
 * @route   POST /api/polls
 */
exports.createPoll = async (req, res, next) => {
  try {
    const { title, description, active } = req.body;
    const poll = await Poll.create({
      title,
      description,
      active: active !== undefined ? active : true
    });

    res.status(201).json({
      success: true,
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update poll
 * @route   PUT /api/polls/:id
 */
exports.updatePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: poll
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete poll
 * @route   DELETE /api/polls/:id
 */
exports.deletePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Also delete associated poll responses
    await PollResponse.deleteMany({ pollId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Poll and associated responses deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit student poll response
 * @route   POST /api/polls/:pollId/respond
 */
exports.submitPollResponse = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const { studentId, answer } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required to submit a poll response'
      });
    }

    // Verify poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Upsert response (update if already exists, else create)
    const response = await PollResponse.findOneAndUpdate(
      { pollId, studentId },
      {
        pollId,
        studentId,
        status: 'responded', // Automatically set status = responded
        answer: answer || 'Interested',
        respondedAt: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    ).populate('studentId', 'name email department year');

    res.status(200).json({
      success: true,
      message: 'Poll response submitted successfully',
      data: response
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students who responded to a poll
 * @route   GET /api/polls/:pollId/responses
 * Note: Includes students who voted "Not Interested" as valid responded submissions.
 */
exports.getPollResponses = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const responses = await PollResponse.find({
      pollId,
      status: 'responded'
    }).populate('studentId', 'name email department year platforms activeToday');

    res.status(200).json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students who did NOT respond to a poll
 * @route   GET /api/polls/:pollId/not-responded
 * Note: Finds all eligible students who have NO response record for this poll.
 */
exports.getPollNotResponded = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Get all student IDs who have submitted a response to this poll
    const respondedRecords = await PollResponse.find({
      pollId,
      status: 'responded'
    }).select('studentId');

    const respondedStudentIds = respondedRecords.map((r) => r.studentId);

    // Find all students who are NOT in the responded list
    const notRespondedStudents = await Student.find({
      _id: { $nin: respondedStudentIds }
    }).sort({ department: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: notRespondedStudents.length,
      data: notRespondedStudents.map((s) => ({
        student: s,
        status: 'not_responded',
        answer: null,
        respondedAt: null
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get summary statistics for a poll
 * @route   GET /api/polls/:pollId/summary
 */
exports.getPollSummary = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    const totalStudents = await Student.countDocuments();
    const responded = await PollResponse.countDocuments({
      pollId,
      status: 'responded'
    });
    const notResponded = Math.max(0, totalStudents - responded);
    const participationPercentage = totalStudents > 0 
      ? Math.round((responded / totalStudents) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        pollTitle: poll.title,
        totalStudents,
        responded,
        notResponded,
        participationPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};
