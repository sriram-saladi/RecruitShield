const Job = require("../models/Job");
const riskEngine = require("../engine/riskEngine");

exports.analyzeJob = async (req, res) => {
  try {
    const { title, company, salary, description, email, domain } = req.body;

    // Run risk engine
    const analysis = await riskEngine({
      title,
      company,
      salary,
      description,
      email,
      domain,
    });

    // Save to DB
    const newJob = new Job({
      title,
      company,
      salary,
      description,
      email,
      domain,
      riskScore: analysis.riskScore,
      riskCategory: analysis.riskCategory,
      explanations: analysis.explanations,
      flags: analysis.flags,
      status: "PENDING",
    });

    await newJob.save();

    res.json({
      message: "Analysis Complete",
      ...analysis,
      status: "PENDING",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};