const express = require("express");
const { getMedicationRecommendations, getMedicationStats } = require("../controllers/medicationController");

const router = express.Router();

// Route to get medication recommendations for a specific user
router.get("/recommendations/:userId", getMedicationRecommendations);

// Route to get medication statistics
router.get("/statistics", getMedicationStats);

module.exports = router;