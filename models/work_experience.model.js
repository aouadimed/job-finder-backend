const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkExperienceSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  employmentType: {
    type: Number,
    default: -1,
  },
  location: {
    type: String,
    default: "",
  },
  locationType: {
    type: Number,
    default: -1,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  description: {
    type: String,
    default: "",
  },
  ifStillWorking: {
    type: Boolean,
    default: false,
  },
});

const WorkExperience = mongoose.model("WorkExperience", WorkExperienceSchema);

module.exports = WorkExperience;
