const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const jobRoutes = require("./routes/jobRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobRoutes);

app.get("/", (req, res) => {
  res.send("SERVER IS THIS PROJECT");
});

console.log("Registered Routes:");
app._router.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});

console.log("ENV VALUE:", process.env.MONGO_URI);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

startServer();