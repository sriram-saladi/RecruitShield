const express = require("express");
const router = express.Router();

const { analyzeJob } = require("../controllers/jobController");

// GET test
router.get("/", (req, res) => {
  res.send("Job Routes Working ✅");
});

// ✅ This is the real analyzer route
router.post("/analyze", analyzeJob);

module.exports = router;