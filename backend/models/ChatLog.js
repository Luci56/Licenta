const mongoose = require("mongoose");

// Define schema for chat messages
const chatLogSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "bot"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isError: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create the ChatLog model
const ChatLog = mongoose.model("ChatLog", chatLogSchema);

module.exports = ChatLog;