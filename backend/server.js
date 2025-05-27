const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const similarityRoutes = require("./routes/similarityRoutes");
const chatRoutes = require("./routes/chatRoutes");
const medicationRoutes = require("./routes/medicationRoutes"); // Add medication routes
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// Middleware-uri
app.use(cors());
app.use(express.json());

// Middleware pentru logare
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Înregistrează rutele
app.use("/api/users", userRoutes);
app.use("/api/similarity", similarityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/medication", medicationRoutes); // Register medication routes

// Rută implicită cu informații despre API
app.get("/", (req, res) => {
  res.json({
    message: "API-ul pentru Patient Similarity Calculator rulează...",
    version: "2.0.0",
    features: [
      "Patient similarity calculation",
      "Medication recommendations",
      "Chat assistant for diabetes",
      "Progress tracking",
      "Clinical data management"
    ],
    endpoints: {
      users: "/api/users",
      similarity: "/api/similarity",
      medication: "/api/medication",
      chat: "/api/chat"
    },
    documentation: {
      populate_database: "npm run populate:medium",
      analyze_database: "npm run analyze:database",
      clear_database: "npm run clear:database"
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: "connected"
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    version: "2.0.0",
    endpoints: {
      "POST /api/users/register": "Register new patient",
      "POST /api/users/login": "Patient login",
      "GET /api/users/:id": "Get patient details",
      "POST /api/users/add-daily-data/:id": "Add daily glucose reading",
      "POST /api/users/add-analysis-data/:id": "Add lab analysis data",
      
      "GET /api/similarity/calculate/:userId": "Calculate patient similarity",
      
      "GET /api/medication/recommendations/:userId": "Get medication recommendations",
      "GET /api/medication/statistics": "Get database medication statistics",
      
      "GET /api/chat/history/:userId": "Get chat history",
      "POST /api/chat/message": "Send message to AI assistant",
      "DELETE /api/chat/clear/:userId": "Clear chat history"
    },
    sampleRequests: {
      register: {
        method: "POST",
        url: "/api/users/register",
        body: {
          email: "patient@example.com",
          password: "password123",
          birthYear: 1975,
          gender: "Masculin",
          height: 175,
          weight: 80,
          diagnosisYear: 2015
        }
      },
      addAnalysis: {
        method: "POST",
        url: "/api/users/add-analysis-data/:id",
        body: {
          systolicPressure: 130,
          diastolicPressure: 85,
          cholesterolHDL: 45,
          cholesterolLDL: 120,
          hemoglobinA1c: 7.2,
          hasHyperlipidemia: false,
          hasHypertension: true,
          diseaseDuration: 8
        }
      }
    }
  });
});

// Middleware pentru gestionarea erorilor
app.use((err, req, res, next) => {
  console.error("Eroare server:", err.stack);
  res.status(500).json({ 
    message: "A apărut o eroare internă de server", 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Eroare internă',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Endpoint not found",
    availableEndpoints: [
      "/api/users",
      "/api/similarity", 
      "/api/medication",
      "/api/chat"
    ],
    documentation: "/api"
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Pornirea serverului
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`💊 Medication Stats: http://localhost:${PORT}/api/medication/statistics`);
  console.log(`\n📖 Available Scripts:`);
  console.log(`   npm run populate:medium  - Generate 100 synthetic patients`);
  console.log(`   npm run analyze:database - Analyze database statistics`);
  console.log(`   npm run clear:database   - Clear all patient data`);
});