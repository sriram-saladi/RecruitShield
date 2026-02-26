const Job = require("../models/Job");
const riskEngine = require("../engine/riskEngine");
const { applyScamSignals } = require("../services/scamSignalsService");

exports.analyzeJob = async (req, res) => {
  try {
    const { title, company, salary, description, email, domain } = req.body;

    // 1) Run risk engine
    const analysis = await riskEngine({
      title,
      company,
      salary,
      description,
      email,
      domain,
    });

    // 2) Apply ScamSignals boost
    const scamResult = await applyScamSignals({ domain, email, description });

    analysis.riskScore = (analysis.riskScore || 0) + (scamResult.boost || 0);
    analysis.explanations = [
      ...(analysis.explanations || []),
      ...(scamResult.explanations || []),
    ];

    // Re-calc category after boost
    if (analysis.riskScore >= 60) analysis.riskCategory = "High Risk";
    else if (analysis.riskScore >= 30) analysis.riskCategory = "Suspicious";
    else analysis.riskCategory = "Safe";

    // 3) Save to DB
    const newJob = new Job({
      title,
      company,
      salary,
      description,
      email,
      domain,
      riskScore: analysis.riskScore,
      riskCategory: analysis.riskCategory,
      verdict: analysis.verdict,
      confidence: analysis.confidence,
      humanExplanation: analysis.humanExplanation,
      explanations: analysis.explanations,
      flags: analysis.flags,
      status: "PENDING",
    });

    await newJob.save();

    // 4) Send response
    return res.json({
      message: "Analysis Complete",
      ...analysis,
      status: "PENDING",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};