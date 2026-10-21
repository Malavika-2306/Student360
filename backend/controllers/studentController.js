const Student = require('../models/Student');

/**
 * @desc    Get all students
 * @route   GET /api/students
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    // If authenticated user is a student, scope data strictly to their own profile
    if (req.user && req.user.role === 'student') {
      if (!req.user.studentId) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }
      const selfStudent = await Student.findById(req.user.studentId);
      return res.status(200).json({
        success: true,
        count: selfStudent ? 1 : 0,
        data: selfStudent ? [selfStudent] : []
      });
    }

    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 */
exports.getStudentById = async (req, res, next) => {
  try {
    // Ensure student role cannot query other students
    if (req.user && req.user.role === 'student') {
      if (!req.user.studentId || req.user.studentId.toString() !== req.params.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are only authorized to view your own student record.'
        });
      }
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new student
 * @route   POST /api/students
 */
exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, department, year, platforms, activeToday } = req.body;

    // Check if email already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists'
      });
    }

    const student = await Student.create({
      name,
      email,
      department,
      year: year || 3,
      platforms: platforms || { leetcode: false, codechef: false, github: false },
      activeToday: activeToday !== undefined ? activeToday : false
    });

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 */
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 */
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search students by name, email, or department
 * @route   GET /api/students/search?q=Anu or ?name=Anu
 */
exports.searchStudents = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.name || req.query.query;
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query parameter (?q=... or ?name=...)'
      });
    }

    const regex = new RegExp(query.trim(), 'i');
    const students = await Student.find({
      $or: [
        { name: regex },
        { email: regex },
        { department: regex }
      ]
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students active today
 * @route   GET /api/students/active/today
 */
exports.getActiveStudentsToday = async (req, res, next) => {
  try {
    const students = await Student.find({ activeToday: true });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students inactive today
 * @route   GET /api/students/inactive/today
 */
exports.getInactiveStudentsToday = async (req, res, next) => {
  try {
    const students = await Student.find({ activeToday: false });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};
