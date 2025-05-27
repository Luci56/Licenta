const express = require("express");
const { getChatHistory, processMessage, clearChatHistory } = require("../controllers/chatbotController");

const router = express.Router();

// Route to get chat history for a specific user
router.get("/history/:userId", getChatHistory);

// Route to send a message and get a response
router.post("/message", processMessage);

// Route to clear chat history
router.delete("/clear/:userId", clearChatHistory);

module.exports = router;