const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update timestamp saat disimpan
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now;
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);