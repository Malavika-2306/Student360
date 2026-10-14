const mongoose = require('mongoose');

/**
 * Poll Schema
 * Represents college institutional surveys or technical workshop interest polls.
 */
const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide poll title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Poll', pollSchema);
