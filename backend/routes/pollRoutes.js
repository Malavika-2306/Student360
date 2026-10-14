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

// Sub-resource routes for specific poll responses
router.post('/:pollId/respond', submitPollResponse);
router.get('/:pollId/responses', getPollResponses);
router.get('/:pollId/not-responded', getPollNotResponded);
router.get('/:pollId/summary', getPollSummary);

// Root poll CRUD routes
router.route('/')
  .get(getAllPolls)
  .post(createPoll);

router.route('/:id')
  .get(getPollById)
  .put(updatePoll)
  .delete(deletePoll);

module.exports = router;
