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

// Specific sub-routes first
router.get('/search', searchStudents);
router.get('/active/today', getActiveStudentsToday);
router.get('/inactive/today', getInactiveStudentsToday);

// Root routes
router.route('/')
  .get(getAllStudents)
  .post(createStudent);

// Parameter routes
router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
