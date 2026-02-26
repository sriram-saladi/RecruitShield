const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  salary: String,
  description: String,
  email: String,
  domain: String,

  riskScore: {
    type: Number,
    default: 0
  },

  riskCategory: {
    type: String,
    default: "Safe"
  },

  explanations: {
    type: [String],
    default: []
  },

  flags: {
    type: Object,
    default: {}
  },

  status: {
    type: String,
    default: "PENDING"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Job", JobSchema);