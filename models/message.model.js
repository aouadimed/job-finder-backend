const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true, required: true },
    receiver: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // Changed to ObjectId
    chat: { type: mongoose.Types.ObjectId, ref: "Chat", required: true },
    readBy: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    deliveredTo: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
