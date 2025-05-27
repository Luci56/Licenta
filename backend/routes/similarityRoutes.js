const express = require("express");
const { calculatePatientSimilarity } = require("../controllers/similarityController");

const router = express.Router();

// Rută pentru calculul similarității
router.get("/calculate/:userId", calculatePatientSimilarity);

module.exports = router;