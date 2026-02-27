const mongoose = require("mongoose");

const scamSignalSchema = new mongoose.Schema(
  {
    domain: { type: String, default: "" },
    email: { type: String, default: "" },
    keyword: { type: String, default: "" },
    riskBoost: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScamSignal", scamSignalSchema);