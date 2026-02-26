const domainVerifier = require("../modules/domainVerifier");
const aiClassifier = require("../modules/aiClassifier");
// Future modules can be added like this:
// const emailChecker = require("../modules/emailChecker");
// const salaryAnalyzer = require("../modules/salaryAnalyzer");
// const textAnalyzer = require("../modules/textAnalyzer");

module.exports = async function riskEngine(input = {}) {
  let score = 0;
  const explanations = [];
  const flags = {};

  try {
    const moduleResults = [
      domainVerifier(input),
      aiClassifier(input),
    ];

    moduleResults.forEach(result => {
      if (!result) return;

      score += Number(result.score || 0);

      if (Array.isArray(result.reasons)) {
        explanations.push(...result.reasons);
      }

      if (result.flags && typeof result.flags === "object") {
        Object.assign(flags, result.flags);
      }
    });

  } catch (error) {
    console.error("Risk Engine Error:", error.message);
  }

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