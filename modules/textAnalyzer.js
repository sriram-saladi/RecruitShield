function analyzeText(rawText = "") {
  const text = String(rawText || "").toLowerCase();

  let score = 0;
  const flags = [];
  const reasons = [];

  if (text.includes("urgent")) {
    score += 15;
    flags.push("URGENCY");
    reasons.push("Urgency language detected.");
  }

  if (text.includes("fee") || text.includes("payment")) {
    score += 25;
    flags.push("PAYMENT_REQUEST");
    reasons.push("Mentions fee/payment which is common in scams.");
  }

  if (text.includes("whatsapp")) {
    score += 10;
    flags.push("OFF_PLATFORM_CONTACT");
    reasons.push("Requests contact via WhatsApp.");
  }

  return { score, reasons, flags };
}

module.exports = { analyzeText };