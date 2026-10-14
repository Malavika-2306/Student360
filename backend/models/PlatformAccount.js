const mongoose = require('mongoose');

/**
 * PlatformAccount Schema
 * Stores authorized integration connections for each student.
 * 
 * SECURITY RULES:
 * 1. accessToken is marked `select: false` so it is NEVER returned to React or general API responses.
 * 2. Passwords are never stored.
 * 3. Scope is limited to read-only access (e.g. `read:user`).
 * 4. Tokens belong exclusively to individual students and are never shared.
 */
const platformAccountSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['github', 'leetcode', 'codechef']
  },
  username: {
    type: String,
    trim: true,
    default: ''
  },
  profileUrl: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  // Private token stored exclusively on backend. NEVER exposed to frontend.
  accessToken: {
    type: String,
    select: false
  },
  tokenType: {
    type: String,
    default: 'bearer'
  },
  scope: {
    type: String,
    default: 'read:user'
  },
  connected: {
    type: Boolean,
    default: false
  },
  syncStatus: {
    type: String,
    enum: ['connected', 'syncing', 'synced', 'sync_failed', 'not_connected', 'unavailable'],
    default: 'not_connected'
  },
  dataSource: {
    type: String,
    enum: ['Real', 'Sample', 'Not connected', 'Unavailable', 'Sync failed'],
    default: 'Not connected'
  },
  authMethod: {
    type: String,
    enum: ['oauth', 'personal_token', 'username_profile', 'none'],
    default: 'none'
  },
  lastSyncedAt: {
    type: Date
  },
  lastError: {
    type: String,
    default: ''
  },
  metrics: {
    // GitHub verified metrics
    publicRepos: { type: Number, default: 0 },
    publicGists: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    recentEventsCount: { type: Number, default: 0 },
    recentPushEventsCount: { type: Number, default: 0 },
    recentRepositories: [
      {
        name: String,
        fullName: String,
        url: String,
        description: String,
        language: String,
        stars: Number,
        forks: Number,
        updatedAt: Date
      }
    ],
    // LeetCode metrics (if verified)
    ranking: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    // CodeChef metrics (if verified)
    rating: { type: Number, default: 0 },
    stars: { type: String, default: '' },
    globalRank: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a student has at most one record per platform
platformAccountSchema.index({ studentId: 1, platform: 1 }, { unique: true });

platformAccountSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PlatformAccount', platformAccountSchema);
