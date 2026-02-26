const domainVerifier = require("../modules/domainVerifier");

module.exports = async function riskEngine(input) {
  let score = 0;
  const explanations = [];
  const flags = {};

  const result = domainVerifier(input);

  if (result) {
    score += Number(result.score || 0);

    if (Array.isArray(result.reasons)) {
      explanations.push(...result.reasons);
    }

    if (result.flags && typeof result.flags === "object") {
      Object.assign(flags, result.flags);
    }
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return {
    riskScore: score,
    riskCategory:
      score <= 35 ? "Safe" :
      score <= 70 ? "Suspicious" :
      "High Risk",
    explanations,
    flags,
  };
};