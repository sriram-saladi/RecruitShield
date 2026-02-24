console.log("ROUTES FILE PATH:", __filename);

const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Route Working");
});

router.post("/analyze", (req, res) => {
  res.json({ message: "POST Working" });
});

module.exports = router;