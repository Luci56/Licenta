const express = require("express");
const { getMedicationRecommendations, getMedicationStats } = require("../controllers/medicationController");

const router = express.Router();

// Get medication recommendations for a specific user
router.get("/recommendations/:userId", getMedicationRecommendations);

// Get database medication statistics
router.get("/statistics", getMedicationStats);

module.exports = router;