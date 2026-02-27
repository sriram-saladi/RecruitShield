const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 🔥 ADD THIS LINE
app.use(cors());

app.use(express.json());

// routes
const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is undefined. Check .env in project root.");
    }

    console.log("ENV VALUE:", MONGO_URI);

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

start();