// engine/riskEngine.js

const domainVerifier = require("../modules/domainVerifier");
const aiClassifier = require("../modules/aiClassifier");
const emailChecker = require("../modules/emailChecker");
const { analyzeText } = require("../modules/textAnalyzer");

/**
 * Task 1: Risk Category Mapping
 * Maps flagged reasons to human-readable categories
 */
function mapRiskCategory(reasons = []) {
  const mapping = {
    "registration fee": "Financial Scam",
    "payment": "Financial Scam",
    "whatsapp": "Financial Scam",
    "job": "Financial Scam",
    "resume phishing": "Data Theft",
    "mlm": "MLM Scheme",
    "fake internship fee": "Fake Internship"
  };

  const categories = new Set();

  reasons.forEach(reason => {
    for (const key in mapping) {
      if (reason.toLowerCase().includes(key.toLowerCase())) {
        categories.add(mapping[key]);
      }
    }
  });

  return Array.from(categories); // returns array of categories
}

/**
 * Task 2: Verdict + Confidence Logic
 */
function getVerdictAndConfidence(score, moduleCount) {
  let verdict;
  if (score <= 30) verdict = "Safe";
  else if (score <= 60) verdict = "Suspicious";
  else verdict = "Highly Suspicious";

  let confidence;
  if (moduleCount === 1) confidence = "Low";
  else if (moduleCount <= 3) confidence = "Medium";
  else confidence = "High";

  return { verdict, confidence };
}

/**
 * Task 3: Human Explanation Generator
 */
function generateExplanation(reasons = []) {
  if (!Array.isArray(reasons) || reasons.length === 0) return "No major issues detected.";

  const phraseMap = {
    "registration fee": "requires a suspicious registration fee",
    "payment": "mentions payment or fee",
    "whatsapp": "requests contact via WhatsApp",
    "job": "contains suspicious keywords in email",
    "resume phishing": "tries to steal resume information",
    "mlm": "promotes a multi-level marketing scheme",
    "fake internship fee": "asks for a fake internship fee",
    "http": "website is not secure (HTTP)",
    "xyz": "uses a suspicious TLD (.xyz)"
  };

  const simplified = [];

  reasons.forEach(reason => {
    for (const key in phraseMap) {
      if (reason.toLowerCase().includes(key.toLowerCase()) && !simplified.includes(phraseMap[key])) {
        simplified.push(phraseMap[key]);
      }
    }
  });

  return `This job offer appears suspicious because it ${simplified.join(", ")}.`;
}

module.exports = async function riskEngine(input = {}) {
  let score = 0;
  const explanations = [];
  const flags = {};

  let moduleResults = [];
  let textResult = {};
  let emailResult = {};

  try {
    // Run main modules asynchronously
    const moduleResults = await Promise.all([
      domainVerifier(input),
      aiClassifier(input),
    ]);

    moduleResults.forEach(result => {
      if (!result || typeof result !== "object") return;
      score += Number(result.score || 0);
      if (Array.isArray(result.reasons)) explanations.push(...result.reasons);
      if (result.flags && typeof result.flags === "object") Object.assign(flags, result.flags);
    });

    // Text Analyzer
    const textResult = analyzeText(input.description || input.text || "");
    if (textResult) {
      score += Number(textResult.score || 0);
      if (Array.isArray(textResult.reasons)) explanations.push(...textResult.reasons);
      if (Array.isArray(textResult.flags)) flags.textAnalyzer = textResult.flags;
    }

    // Email Checker
    const emailResult = emailChecker(input);
    if (emailResult) {
      score += Number(emailResult.score || 0);
      if (Array.isArray(emailResult.reasons)) explanations.push(...emailResult.reasons);
      if (emailResult.flags && typeof emailResult.flags === "object") Object.assign(flags, emailResult.flags);
    }

  } catch (error) {
    console.error("Risk Engine Error:", error);
  }

  score = Math.max(0, Math.min(100, score));

  // Task 1: Map explanations to risk categories
  const riskCategories = mapRiskCategory(explanations);

  // Task 2: Count modules triggered individually
  const triggeredModules = [
    ...(Array.isArray(moduleResults) ? moduleResults : []),
    textResult,
    emailResult
  ].filter(r => r && r.score > 0).length;

  const verdictConfidence = getVerdictAndConfidence(score, triggeredModules);

  // Task 3: Generate human-friendly explanation
  const humanExplanation = generateExplanation(explanations);

  return {
    riskScore: score,
    riskCategory: score <= 35 ? "Safe" : score <= 70 ? "Suspicious" : "High Risk",
    explanations,
    flags,
    humanExplanation
  };
};