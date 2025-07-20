const express = require("express");
const { getMedicationRecommendations, getMedicationStats } = require("../controllers/medicationController");

const router = express.Router();


router.get("/recommendations/:userId", getMedicationRecommendations);


router.get("/statistics", getMedicationStats);

module.exports = router;