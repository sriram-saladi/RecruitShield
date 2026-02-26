const domainVerifier = require("../modules/domainVerifier");
const aiClassifier = require("../modules/aiClassifier");
const emailChecker = require("../modules/emailChecker");
const { analyzeText } = require("../modules/textAnalyzer");

// Future modules can be added like this:
// const salaryAnalyzer = require("../modules/salaryAnalyzer");
// const textAnalyzer = require("../modules/textAnalyzer");

module.exports = async function riskEngine(input = {}) {
  let score = 0;
  const explanations = [];
  const flags = {};

  try {
    // Run all modules asynchronously
    const moduleResults = await Promise.all([
      domainVerifier(input),
      emailChecker(input),
      aiClassifier(input),
    ]);

    moduleResults.forEach(result => {
      if (!result || typeof result !== "object") return;

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

<<<<<<< HEAD
  // Clamp score between 0–100
=======
  // ================================
  // 1️⃣.5 Text Analyzer Check
  // ================================
  const textResult = analyzeText(input.description || input.text || "");

  if (textResult) {
    score += Number(textResult.score || 0);

    if (Array.isArray(textResult.reasons)) {
      explanations.push(...textResult.reasons);
    }

    if (Array.isArray(textResult.flags)) {
      flags.textAnalyzer = textResult.flags;
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
    riskCategory: score <= 35 ? "Safe" : score <= 70 ? "Suspicious" : "High Risk",
    explanations,
    flags,
  };
};