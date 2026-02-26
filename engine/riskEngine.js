const domainVerifier = require("../modules/domainVerifier");
const emailChecker = require("../modules/emailChecker");

module.exports = async function riskEngine(input) {
  let score = 0;
  const explanations = [];
  const flags = {};

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
  score = Math.max(0, Math.min(100, score));

  return {
    riskScore: score,
    riskCategory:
      score <= 35
        ? "Safe"
        : score <= 70
        ? "Suspicious"
        : "High Risk",
    explanations,
    flags,
  };
};