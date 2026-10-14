const mongoose = require('mongoose');

/**
 * PollResponse Schema
 * Tracks student submission to polls.
 * 
 * IMPORTANT:
 * - status: "responded" vs "not_responded"
 * - answer: "Interested" vs "Not Interested" vs "Yes" vs "No" vs null
 * A student who submitted "Not Interested" has status="responded".
 * A student who never submitted has status="not_responded".
 */
const pollResponseSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['responded', 'not_responded'],
    default: 'responded'
  },
  answer: {
    type: String,
    default: null
  },
  respondedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a student can only have one response record per poll
pollResponseSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('PollResponse', pollResponseSchema);
