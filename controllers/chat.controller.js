const asyncHandler = require("express-async-handler");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Message = require("../models/message.model");
const Company = require("../models/company.model");

/**
 * @Desc   : Send a message and create a chat if none exists
 * @Route  : POST /api/chat/message
 * @Access : Private
 */
module.exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, receiver } = req.body;

  if (!content || (!chatId && !receiver)) {
    return res
      .status(400)
      .json("Content and chat ID or receiver are required.");
  }

  try {
    let chat;

    // If no chatId is provided, find or create the chat between the sender and receiver
    if (!chatId) {
      chat = await Chat.findOne({ users: { $all: [req.user._id, receiver] } });

      if (!chat) {
        chat = await Chat.create({ users: [req.user._id, receiver] });
      }
    } else {
      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json("Chat not found.");
    }

    // Create the new message
    await Message.create({
      sender: req.user._id,
      content,
      receiver,
      chat: chat._id,
      readBy: [req.user._id], // The sender automatically reads their own message
    });

    // Return 200 OK without additional data
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    return res.status(500).json(`Couldn't send message: ${error.message}`);
  }
});

/**
 * @Desc   : Get paginated chats for the logged-in user with the latest message and unseen messages count
 * @Route  : GET /api/chat
 * @Access : Private
 */
module.exports.getChats = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if not specified
  const skip = (page - 1) * limit;

  try {
    // Find the chats for the logged-in user with pagination
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .sort({ updatedAt: -1 }) // Sort by most recent
      .skip(skip)
      .limit(limit);

    // For each chat, find the latest message, check for company association, and count unseen messages
    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        // Find the latest message in the chat
        const latestMessage = await Message.findOne({ chat: chat._id })
          .populate("sender", "username email profileImg")
          .sort({ createdAt: -1 });

        // Determine the other participant in the chat (excluding the logged-in user)
        const otherUser = chat.users.find(
          (user) => user._id.toString() !== req.user._id.toString()
        );

        // Check if the other participant has an associated company
        const otherUserCompany = await Company.findOne({ user: otherUser._id });

        const otherUserInfo = otherUserCompany
          ? {
              _id: otherUser._id,
              username: otherUserCompany.companyName,
              email: otherUser.email,
              profileImg: otherUserCompany.logoName
                ? `${process.env.BASE_URL}/companylogos/${otherUserCompany.logoName}`
                : null,
            }
          : {
              _id: otherUser._id,
              username: otherUser.username,
              email: otherUser.email,
              profileImg: otherUser.profileImg
                ? `${process.env.BASE_URL}/userimg/${otherUser.profileImg}`
                : "undefined",
            };

        return {
          _id: chat._id,
          otherUser: otherUserInfo,
          latestMessage,
          unseenMessagesCount: await Message.countDocuments({
            chat: chat._id,
            readBy: { $ne: req.user._id }, // Messages not read by the logged-in user
          }),
        };
      })
    );

    // Get total count of chats for pagination purposes
    const totalChats = await Chat.countDocuments({
      users: { $elemMatch: { $eq: req.user._id } },
    });

    res.status(200).json({
      chats: chatsWithDetails,
      totalPages: Math.ceil(totalChats / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

/**
 * @Desc   : Get all messages for a specific chat with pagination
 * @Route  : GET /api/chat/:chatId/messages
 * @Access : Private
 */
module.exports.getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 16;
  const skip = (page - 1) * limit;

  try {
    const chat = await Chat.findById(chatId).populate('users', 'username email profileImg');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isUserInChat = chat.users.some(user => user._id.toString() === req.user._id.toString());
    if (!isUserInChat) {
      return res.status(403).json({ message: 'You are not authorized to view messages for this chat' });
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ chat: chatId });

    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      sender : msg.sender,
      content: msg.content,
      receiver: msg.receiver,
      readBy: msg.readBy,
      deliveredTo: msg.deliveredTo,
      createdAt: msg.createdAt
    }));

    res.status(200).json({
      chatId: chat._id,
      messages: formattedMessages,
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: `Error retrieving messages: ${error.message}` });
  }
});
