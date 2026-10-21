const User = require('../models/User');
const Student = require('../models/Student');

/**
 * @desc    Login user (Admin or Student)
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Server-side validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const cleanEmail = email.toString().toLowerCase().trim();

    // Query user and explicitly select password hash
    const user = await User.findOne({ email: cleanEmail })
      .select('+password')
      .populate('studentId');

    if (!user) {
      // Generic error message to prevent account enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password match using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate signed JWT
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        student: user.studentId || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear token session
 * @route   POST /api/auth/logout
 * @access  Public
 */
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

/**
 * @desc    Get currently authenticated user & linked student profile
 * @route   GET /api/auth/me
 * @access  Private (Authenticated)
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('studentId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        student: user.studentId || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    One-time initial Admin account bootstrap
 * @route   POST /api/auth/bootstrap-admin
 * @access  Public (Protected by ADMIN_BOOTSTRAP_KEY, permanently disabled once any admin exists)
 */
exports.bootstrapAdmin = async (req, res, next) => {
  try {
    // 1. Check if an administrator already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin bootstrap is permanently disabled because an administrator account already exists.'
      });
    }

    const { name, email, password, bootstrapKey } = req.body;

    // 2. Validate bootstrap secret key from environment
    const configuredKey = process.env.ADMIN_BOOTSTRAP_KEY;
    if (!configuredKey || bootstrapKey !== configuredKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid admin bootstrap authorization key.'
      });
    }

    // 3. Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Create the initial admin account
    const adminUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'admin',
      studentId: null
    });

    const token = adminUser.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Initial administrator account created successfully. Bootstrap is now permanently disabled.',
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Provision a login account for an existing or new student
 * @route   POST /api/auth/provision-student
 * @access  Private (Admin only)
 */
exports.provisionStudent = async (req, res, next) => {
  try {
    const { studentId, email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and initial password for the student.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Student password must be at least 6 characters.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify student profile exists
    let student = null;
    if (studentId) {
      student = await Student.findById(studentId);
    } else {
      student = await Student.findOne({ email: cleanEmail });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No matching student record found. Please specify a valid studentId or matching student email.'
      });
    }

    // Check if login user already exists for this email
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account already exists for ${cleanEmail}.`
      });
    }

    // Create Student user account
    const studentUser = await User.create({
      name: name ? name.trim() : student.name,
      email: cleanEmail,
      password,
      role: 'student',
      studentId: student._id
    });

    res.status(201).json({
      success: true,
      message: `Student login account created successfully for ${student.name}.`,
      user: {
        id: studentUser._id,
        name: studentUser.name,
        email: studentUser.email,
        role: studentUser.role,
        studentId: studentUser.studentId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List all provisioned user accounts (metadata only, no hashes)
 * @route   GET /api/auth/users
 * @access  Private (Admin only)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('studentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Public student account registration
 * @route   POST /api/auth/register
 * @access  Public (Role strictly locked to 'student')
 */
exports.registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, department, year } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, institutional email, and password.'
      });
    }

    const cleanEmail = email.toString().toLowerCase().trim();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Ensure email is not already registered
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.'
      });
    }

    // Find or create associated Student record
    let student = await Student.findOne({ email: cleanEmail });
    if (!student) {
      const validDepts = ['CSE', 'AI&DS', 'ECE', 'EEE', 'MECH', 'IT', 'CIVIL'];
      const assignedDept = validDepts.includes(department) ? department : 'CSE';

      student = await Student.create({
        name: name.trim(),
        email: cleanEmail,
        department: assignedDept,
        year: year ? parseInt(year, 10) : 3,
        platforms: { leetcode: false, codechef: false, github: false },
        activeToday: true
      });
    }

    // Create User record — STRICTLY role: 'student', completely ignoring any user-supplied role
    const studentUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'student',
      studentId: student._id
    });

    const token = studentUser.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: {
        id: studentUser._id,
        name: studentUser.name,
        email: studentUser.email,
        role: studentUser.role,
        student: student
      }
    });
  } catch (error) {
    next(error);
  }
};
