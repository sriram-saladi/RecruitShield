const ScamSignal = require("../models/ScamSignal");

const norm = (v) => (v || "").toString().trim().toLowerCase();

async function applyScamSignals({ domain, email, description }) {
  try {
    const d = norm(domain);
    const e = norm(email);
    const text = norm(description);

    const signals = await ScamSignal.find({});
    
    let boost = 0;
    const explanations = [];

    for (const s of signals) {
      const sd = norm(s.domain);
      const se = norm(s.email);
      const sk = norm(s.keyword);

      let matched = false;

      if (sd && d.includes(sd)) matched = true;
      if (!matched && se && e.includes(se)) matched = true;
      if (!matched && sk && text.includes(sk)) matched = true;

      if (matched) {
        boost += s.riskBoost;
        explanations.push(
          `ScamSignal matched (${sd || se || sk}) +${s.riskBoost}`
        );
      }
    }

    return { boost, explanations };

  } catch (err) {
    console.error("ScamSignals error:", err.message);
    return { boost: 0, explanations: [] };
  }
}

module.exports = { applyScamSignals };