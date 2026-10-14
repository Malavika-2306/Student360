const mongoose = require('mongoose');

/**
 * Activity Schema
 * Records daily platform milestones (LeetCode problems, CodeChef contests, GitHub commits, Polls).
 * Supports explicit dataSource labeling: 'Real' vs 'Sample' vs 'Sync failed'.
 */
const activitySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['LeetCode', 'CodeChef', 'GitHub', 'Poll']
  },
  activityType: {
    type: String,
    required: true,
    enum: [
      'Problem Solved', 
      'Contest Completed', 
      'Commit', 
      'Poll Response', 
      'Practice Session', 
      'Repository Activity', 
      'Public Event'
    ]
  },
  activityCount: {
    type: Number,
    default: 1
  },
  activityDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  dataSource: {
    type: String,
    enum: ['Real', 'Sample', 'Sync failed'],
    default: 'Sample'
  },
  externalId: {
    type: String,
    sparse: true
  },
  syncStatus: {
    type: String,
    enum: ['synced', 'sync_failed', 'sample'],
    default: 'sample'
  }
});

// Compound index to prevent duplicate external events
activitySchema.index({ studentId: 1, externalId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Activity', activitySchema);
