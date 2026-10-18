const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  alertType: {
    type: String,
    enum: ['inactivity_warning', 'poll_reminder', 'streak_alert'],
    default: 'inactivity_warning'
  },
  targetDate: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    default: 'Email & Student Portal'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'pending'],
    default: 'sent'
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
