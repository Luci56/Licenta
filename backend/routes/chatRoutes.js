const express = require("express");
const { getChatHistory, processMessage, clearChatHistory } = require("../controllers/chatbotController");

const router = express.Router();


router.get("/history/:userId", getChatHistory);


router.post("/message", processMessage);


router.delete("/clear/:userId", clearChatHistory);

module.exports = router;