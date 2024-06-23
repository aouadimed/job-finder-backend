const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EducationSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    default: "",
  },
  field_of_study: {
    type: String,
    default: "",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  grade: {
    type: String,
    default: "",
  },
  activities_and_societies: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});

const Education = mongoose.model("Education", EducationSchema);

module.exports = Education;
