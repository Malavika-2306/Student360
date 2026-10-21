const express = require('express');
const router = express.Router();
const {
  getAllPolls,
  getPollById,
  createPoll,
  updatePoll,
  deletePoll,
  submitPollResponse,
  getPollResponses,
  getPollNotResponded,
  getPollSummary
} = require('../controllers/pollController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Sub-resource routes for specific poll responses
router.post('/:pollId/respond', protect, submitPollResponse);
router.get('/:pollId/responses', protect, authorize('admin'), getPollResponses);
router.get('/:pollId/not-responded', protect, authorize('admin'), getPollNotResponded);
router.get('/:pollId/summary', protect, getPollSummary);

// Root poll CRUD routes
router.route('/')
  .get(protect, getAllPolls)
  .post(protect, authorize('admin'), createPoll);

router.route('/:id')
  .get(protect, getPollById)
  .put(protect, authorize('admin'), updatePoll)
  .delete(protect, authorize('admin'), deletePoll);

module.exports = router;
