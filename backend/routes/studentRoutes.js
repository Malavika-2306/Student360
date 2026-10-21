const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getActiveStudentsToday,
  getInactiveStudentsToday
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Specific admin-only sub-routes
router.get('/search', protect, authorize('admin'), searchStudents);
router.get('/active/today', protect, authorize('admin'), getActiveStudentsToday);
router.get('/inactive/today', protect, authorize('admin'), getInactiveStudentsToday);

// Root routes
router.route('/')
  .get(protect, getAllStudents)
  .post(protect, authorize('admin'), createStudent);

// Parameter routes
router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
