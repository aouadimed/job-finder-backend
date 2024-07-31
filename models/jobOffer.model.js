const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobOfferSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  subcategoryId: { 
    type: String,
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true
  },
  employmentTypeIndex: {
    type: Number,
    required: true,
    index: true
  },
  locationTypeIndex: {
    type: Number,
    required: true,
    index: true
  },
  jobDescription: {
    type: String,
    required: true,
    maxlength: 500
  },
  minimumQualifications: {
    type: String,
    required: true,
    maxlength: 500
  },
  requiredSkills: {
    type: [String],
    validate: {
      validator: function (skills) {
        return skills.length >= 3;
      },
      message: 'At least 3 skills are required.'
    },
    index: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

const JobOffer = mongoose.model('JobOffer', JobOfferSchema);

module.exports = JobOffer;
