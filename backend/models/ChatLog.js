const mongoose = require("mongoose");

/**
 * Schema Mongoose pentru istoricul de chat al utilizatorilor.
 * Stocheaza toate mesajele dintr-o conversatie organizate pe utilizator.
 * Include validari pentru tipurile de mesaje si timestamp-uri automate.
 */
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
    timestamps: true, 
  }
);

const ChatLog = mongoose.model("ChatLog", chatLogSchema);

module.exports = ChatLog;