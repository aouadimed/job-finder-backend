// models/Project.js
const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    workExperience: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkExperience",
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
    projectUrl: {
      type: String,
      default: "",

    },
    ifStillWorkingOnIt: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", ProjectSchema);
