require("dotenv").config();
const mongoose = require("mongoose");
const ScamSignal = require("../models/ScamSignal");

const signals = [
  { domain: "scamcorp.xyz", riskBoost: 20 },
  { email: "hr@scamcorp.xyz", riskBoost: 20 },
  { keyword: "registration fee", riskBoost: 20 },
  { keyword: "urgent hiring", riskBoost: 10 },
  { keyword: "immediate joining", riskBoost: 10 }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo connected");

    await ScamSignal.deleteMany({});
    await ScamSignal.insertMany(signals);

    console.log("✅ Seeded ScamSignals:", signals.length);
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e.message);
    process.exit(1);
  }
})();