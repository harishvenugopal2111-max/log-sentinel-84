const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ['INFO', 'WARN', 'ERROR', 'CRITICAL'],
      required: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    isAnomaly: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
