function normalizeDomain(input) {
  if (!input) return null;

  const raw = String(input).trim();
  const hasScheme = raw.startsWith("http://") || raw.startsWith("https://");
  const urlStr = hasScheme ? raw : `https://${raw}`;

  try {
    const u = new URL(urlStr);
    return {
      hostname: u.hostname.toLowerCase(),
      protocol: hasScheme ? u.protocol : null,
    };
  } catch {
    return null;
  }
}

function getTLD(hostname) {
  const parts = hostname.split(".");
  if (parts.length < 2) return null;
  return parts[parts.length - 1];
}

module.exports = function domainVerifier({ domain }) {
  const parsed = normalizeDomain(domain);

  if (!parsed) {
    return {
      score: 15,
      reasons: ["Domain/URL is invalid or cannot be parsed."],
    };
  }

  const { hostname, protocol } = parsed;
  let score = 0;
  const reasons = [];

  const suspiciousTLDs = new Set([
    "xyz", "top", "online", "site", "icu", "buzz"
  ]);

  const tld = getTLD(hostname);

  if (tld && suspiciousTLDs.has(tld)) {
    score += 15;
    reasons.push(`Suspicious TLD detected (.${tld}).`);
  }

  if (protocol === "http:") {
    score += 10;
    reasons.push("Website URL uses HTTP instead of HTTPS.");
  }

  return { score, reasons };
};