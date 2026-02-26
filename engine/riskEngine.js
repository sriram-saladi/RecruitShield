const domainVerifier = require("../modules/domainVerifier");
<<<<<<< HEAD
const aiClassifier = require("../modules/aiClassifier");
// Future modules can be added like this:
// const emailChecker = require("../modules/emailChecker");
// const salaryAnalyzer = require("../modules/salaryAnalyzer");
// const textAnalyzer = require("../modules/textAnalyzer");

module.exports = async function riskEngine(input = {}) {
=======
const emailChecker = require("../modules/emailChecker");

module.exports = async function riskEngine(input) {
>>>>>>> origin/main
  let score = 0;
  const explanations = [];
  const flags = {};

<<<<<<< HEAD
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

=======
  // ================================
  // 1️⃣ Domain Verification Check
  // ================================
  const domainResult = domainVerifier(input);

  if (domainResult) {
    score += Number(domainResult.score || 0);

    if (Array.isArray(domainResult.reasons)) {
      explanations.push(...domainResult.reasons);
    }

    if (domainResult.flags && typeof domainResult.flags === "object") {
      Object.assign(flags, domainResult.flags);
    }
  }

  // ================================
  // 2️⃣ Email Verification Check
  // ================================
  const emailResult = emailChecker(input);

  if (emailResult) {
    score += Number(emailResult.score || 0);

    if (Array.isArray(emailResult.reasons)) {
      explanations.push(...emailResult.reasons);
    }

    if (emailResult.flags && typeof emailResult.flags === "object") {
      Object.assign(flags, emailResult.flags);
    }
  }

  // ================================
  // Final Score Normalization
  // ================================
>>>>>>> origin/main
  score = Math.max(0, Math.min(100, score));

  return {
    riskScore: score,
    riskCategory:
<<<<<<< HEAD
      score <= 35 ? "Safe" :
      score <= 70 ? "Suspicious" :
      "High Risk",
=======
      score <= 35
        ? "Safe"
        : score <= 70
        ? "Suspicious"
        : "High Risk",
>>>>>>> origin/main
    explanations,
    flags,
  };
};