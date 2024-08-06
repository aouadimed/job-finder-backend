const mongoose = require("mongoose");

const SavedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOffer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SavedJob", SavedJobSchema);
