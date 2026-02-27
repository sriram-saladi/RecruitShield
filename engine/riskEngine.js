const domainVerifier = require("../modules/domainVerifier");
const aiClassifier = require("../modules/aiClassifier");
const emailChecker = require("../modules/emailChecker");
const { analyzeText } = require("../modules/textAnalyzer");

module.exports = async function riskEngine(input = {}) {
  let score = 0;
  const explanations = [];
  const flags = {};

  try {
    // Run modules safely
    const domainResult = domainVerifier(input);
    const aiResult = aiClassifier(input);
    const textResult = analyzeText(input.description || "");
    const emailResult = emailChecker(input);

    const results = [domainResult, aiResult, textResult, emailResult];

    results.forEach(result => {
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
    console.error("Risk Engine Error:", error);
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