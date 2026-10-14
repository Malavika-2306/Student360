const mongoose = require('mongoose');

/**
 * Student Schema
 * Stores student profile and their active status across coding platforms.
 */
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide student name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide student email'],
    unique: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: [true, 'Please provide department'],
    enum: ['CSE', 'AI&DS', 'ECE', 'EEE', 'MECH', 'IT', 'CIVIL'],
    trim: true
  },
  year: {
    type: Number,
    default: 3
  },
  platforms: {
    leetcode: {
      type: Boolean,
      default: false
    },
    codechef: {
      type: Boolean,
      default: false
    },
    github: {
      type: Boolean,
      default: false
    }
  },
  activeToday: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', studentSchema);
