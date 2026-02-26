module.exports = function emailChecker(input) {
  let score = 0;
  const reasons = [];
  const flags = {};

  const { email, company, domain } = input;

  if (!email) {
    score += 25;
    reasons.push("No official email provided.");
    flags.missingEmail = true;
    return { score, reasons, flags };
  }

  const emailLower = email.toLowerCase();

  // 🚩 1. Free Email Providers
  const freeProviders = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];

  const emailDomain = emailLower.split("@")[1];

  if (freeProviders.includes(emailDomain)) {
    score += 20;
    reasons.push("Email uses free provider (Gmail/Yahoo/Outlook).");
    flags.freeEmail = true;
  }

  // 🚩 2. Email Domain ≠ Provided Company Domain
  if (domain && emailDomain !== domain.toLowerCase()) {
    score += 20;
    reasons.push("Email domain does not match official company domain.");
    flags.domainMismatch = true;
  }

  // 🚩 3. Suspicious Keywords in Email
  const suspiciousWords = ["job", "offer", "hr", "recruitment", "career"];

  suspiciousWords.forEach(word => {
    if (emailLower.includes(word)) {
      score += 5;
      reasons.push(`Email contains suspicious keyword: ${word}`);
      flags.suspiciousKeyword = true;
    }
  });

  // 🚩 4. Random numbers in email username
  const username = emailLower.split("@")[0];

  if (/\d{4,}/.test(username)) {
    score += 10;
    reasons.push("Email contains unusual numeric pattern.");
    flags.randomNumbers = true;
  }

  return {
    score,
    reasons,
    flags,
  };
};