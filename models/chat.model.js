const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
