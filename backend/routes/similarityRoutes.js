const express = require("express");
const { calculatePatientSimilarity } = require("../controllers/similarityController");

const router = express.Router();

router.get("/calculate/:userId", calculatePatientSimilarity);

module.exports = router;