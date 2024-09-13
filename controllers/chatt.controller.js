const asyncHandler = require("express-async-handler");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Message = require("../models/message.model");

/**
 * @Desc   : Access or create a one-on-one chat between two users
 * @Route  : POST /api/chat/access
 * @Access : Private
 */
module.exports.accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json("Invalid user ID.");

  try {
    // Check if a chat already exists between the two users
    let chat = await Chat.findOne({
      users: { $all: [req.user._id, userId] },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (chat) {
      chat = await User.populate(chat, {
        path: "latestMessage.sender",
        select: "username email profileImg",
      });
      return res.json(chat);
    } else {
      // If no chat exists, create a new chat
      const chatData = {
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findById(createdChat._id)
        .populate("users", "-password");

      return res.status(200).json(fullChat);
    }
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

/**
 * @Desc   : Get all chats for the logged-in user
 * @Route  : GET /api/chat
 * @Access : Private
 */
module.exports.getChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }); // Sort by most recent

    const results = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username email profileImg",
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/**
 * @Desc   : Update message status (delivered/seen)
 * @Route  : PATCH /api/chat/message/:id/status
 * @Access : Private
 */
module.exports.updateMessageStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const messageId = req.params.id;

  if (!status || !['delivered', 'seen'].includes(status)) {
    return res.status(400).json("Invalid status value.");
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json("Message not found.");

    if (status === 'delivered' && !message.deliveredTo.includes(req.user._id)) {
      message.deliveredTo.push(req.user._id);
    } else if (status === 'seen' && !message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
    }

    await message.save();

    res.json({
      success: true,
      status: {
        delivered: message.deliveredTo.length > 0,
        seen: message.readBy.length > 0,
      },
    });
  } catch (error) {
    res.status(500).json(`Couldn't update message status: ${error.message}`);
  }
});

/**
 * @Desc   : Get all messages within a chat with pagination
 * @Route  : GET /api/chat/messages/:id
 * @Access : Private
 */
module.exports.getAllMessages = asyncHandler(async (req, res) => {
  try {
    const pageSize = 12;
    const page = req.query.page || 1;
    const skipMessage = (page - 1) * pageSize;

    const messages = await Message.find({ chat: req.params.id })
      .populate("sender", "username email profileImg")
      .populate("chat")
      .sort({ createdAt: -1 })
      .skip(skipMessage)
      .limit(pageSize);

    res.json(messages);
  } catch (error) {
    res.status(500).json(error.message);
  }
});
