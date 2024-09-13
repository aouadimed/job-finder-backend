const express = require("express");
const chatController = require("../controllers/chat.controller");
const protectedRoute = require("../middleware/protectedRoute");

const router = express.Router();

router.use(protectedRoute.requireLogin);

router.post('/chat', chatController.sendMessage);

router.get('/chat', chatController.getChats);

router.get('/chat/:chatId', chatController.getMessages);

module.exports = router;
