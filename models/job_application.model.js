const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobApplicationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: 'JobOffer',
    required: true,
  },
  useProfile: {
    type: Boolean,
    required: true,
    default: false,
  },
  cvUpload: {
    type: String,
    required: function() {
      return !this.useProfile;
    },
  },
  motivationLetter: {
    type: String, 
    required: false,
  },
  status: {
    type: String,
    enum: ['sent', 'pending', 'rejected', 'accepted'],
    default: 'sent',
  },
}, {
  timestamps: true,
});

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);

module.exports = JobApplication;
