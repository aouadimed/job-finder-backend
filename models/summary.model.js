const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxlength: 500,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SummarySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Summary = mongoose.model('Summary', SummarySchema);

module.exports = Summary;
