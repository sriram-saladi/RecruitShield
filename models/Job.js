const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  salary: String,
  description: String,
  email: String,
  domain: String,
  riskScore: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Job", JobSchema);