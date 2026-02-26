module.exports = function aiClassifier(input = {}) {
  try {
    const { title = "", description = "" } = input;

    let score = 0;
    const reasons = [];
    const flags = {};

    // Combine text safely
    const text = `${title} ${description}`.toLowerCase();

    // Suspicious scam-related keywords
    const suspiciousKeywords = [
      "urgent hiring",
      "registration fee",
      "limited seats",
      "guaranteed placement",
      "work from home and earn",
      "processing fee",
      "send money",
      "easy income",
      "no experience required",
      "earn instantly"
    ];

    suspiciousKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 10;

        reasons.push(`Suspicious phrase detected: "${keyword}"`);

        // Safe flag key (no spaces)
        const flagKey = keyword.replace(/\s+/g, "_");
        flags[flagKey] = true;
      }
    });

    // Clamp score (extra safety)
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      reasons,
      flags
    };

  } catch (error) {
    // Fail-safe: never break risk engine
    return {
      score: 0,
      reasons: [],
      flags: {}
    };
  }
};