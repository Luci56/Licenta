const axios = require('axios');
const ChatLog = require('../models/ChatLog');
const User = require('../models/User');
const enhancedFallbackService = require('../services/fallbackChatService');


require('dotenv').config();


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';


const USE_OPENAI = process.env.USE_OPENAI !== 'false';

/**
 * Obține sau creează istoricul conversației pentru un utilizator
 * Validează existența utilizatorului și returnează mesajele salvate
 * @param {Request} req - Obiectul request Express cu userId în params
 * @param {Response} res - Obiectul response Express pentru răspuns
 * @returns {Promise<void>} - Răspuns JSON cu istoricul mesajelor
 */
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get chat logs for this user
    let chatHistory = await ChatLog.findOne({ userId });
    
    // If no chat history exists, create an empty one
    if (!chatHistory) {
      chatHistory = new ChatLog({
        userId,
        messages: []
      });
      await chatHistory.save();
    }
    
    // Return messages in the right format for the frontend
    return res.status(200).json(chatHistory.messages);
  } catch (error) {
    console.error('Error getting chat history:', error);
    return res.status(500).json({ message: "Server error getting chat history" });
  }
};

/**
 * Procesează un mesaj nou de la utilizator și generează răspuns AI
 * Folosește baza de cunoștințe locală cu context, apoi OpenAI ca fallback
 * Salvează atât mesajul utilizatorului cât și răspunsul bot-ului în istoric
 * @param {Request} req - Request cu userId și message în body
 * @param {Response} res - Response object pentru trimiterea răspunsului
 * @returns {Promise<void>} - Răspuns JSON cu mesajul bot-ului
 */
const processMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ message: "User ID and message are required" });
    }
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get or create chat history
    let chatHistory = await ChatLog.findOne({ userId });
    if (!chatHistory) {
      chatHistory = new ChatLog({
        userId,
        messages: []
      });
    }
    
    // Add user message to history
    const userMessage = {
      sender: "user",
      content: message,
      timestamp: new Date()
    };
    chatHistory.messages.push(userMessage);
    
    let botResponse;
    
    try {
      
      console.log('Trying local knowledge base first...');
      
      
      const recentHistory = chatHistory.messages.slice(-4);
      
      
      botResponse = enhancedFallbackService.findLocalResponseWithContext(message, recentHistory);
      
      if (!botResponse && USE_OPENAI && OPENAI_API_KEY) {
        // 
        console.log('No local response found, trying OpenAI API...');
        
        const systemMessage = {
          role: "system",
          content: `You are an AI assistant specialized in helping diabetes patients. Respond in Romanian language. Keep responses concise but informative (max 3 paragraphs). Always remind users to consult healthcare professionals for medical advice.`
        };
        
        
        const recentMessages = chatHistory.messages
          .slice(-8)
          .map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content
          }));
        
        const apiMessages = [systemMessage, ...recentMessages];
        
        
        const openaiResponse = await axios.post(
          OPENAI_API_URL,
          {
            model: "gpt-3.5-turbo",
            messages: apiMessages,
            max_tokens: 800,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        
        botResponse = openaiResponse.data.choices[0].message.content;
      }
      
      if (!botResponse) {
        
        botResponse = enhancedFallbackService.getGenericFallback();
      }
      
    } catch (apiError) {
      console.error('API error:', apiError.response?.data || apiError.message);
      
      botResponse = enhancedFallbackService.getGenericFallback();
    }
    
    
    if (!botResponse) {
      botResponse = "Serviciul este momentan indisponibil. Vă rugăm încercați mai târziu.";
    }
    
    
    const botMessage = {
      sender: "bot",
      content: botResponse,
      timestamp: new Date()
    };
    chatHistory.messages.push(botMessage);
    
    
    await chatHistory.save();
    
    
    return res.status(200).json({ message: botResponse });
    
  } catch (error) {
    console.error('Error processing message:', error);
    
    
    const fallbackResponse = "Serviciul este momentan indisponibil. Vă rugăm încercați mai târziu.";
    
    return res.status(200).json({ message: fallbackResponse });
  }
};

/**
 * Șterge complet istoricul conversației pentru un utilizator
 * Validează utilizatorul și resetează array-ul de mesaje
 * @param {Request} req - Request Express cu userId în params
 * @param {Response} res - Response Express pentru confirmare
 * @returns {Promise<void>} - Răspuns JSON cu status-ul operației
 */
const clearChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find and update chat history
    const result = await ChatLog.findOneAndUpdate(
      { userId },
      { $set: { messages: [] } },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ message: "Chat history not found" });
    }
    
    return res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return res.status(500).json({ message: "Server error clearing chat history" });
  }
};

module.exports = {
  getChatHistory,
  processMessage,
  clearChatHistory
};