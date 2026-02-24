const Job = require("../models/Job");

exports.analyzeJob = async (req, res) => {
  const { title, company, salary, description, email, domain } = req.body;

  let riskScore = 0;

  if (salary && salary.includes("1000000")) riskScore += 20;
  if (description && description.toLowerCase().includes("urgent")) riskScore += 15;
  if (email && email.includes("gmail")) riskScore += 20;

  const newJob = new Job({
    title,
    company,
    salary,
    description,
    email,
    domain,
    riskScore
  });

  await newJob.save();

  res.json({
    message: "Analysis Complete",
    riskScore,
    status: riskScore > 30 ? "High Risk 🚨" : "Low Risk ✅"
  });
};