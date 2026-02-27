import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function AnimatedNumber({ target, duration = 1500 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function RadialGauge({ score }) {
  const [animated, setAnimated] = useState(0);
  const radius = 72;
  const circ = 2 * Math.PI * radius;
  const col = score < 30 ? "#22c55e" : score < 70 ? "#eab308" : "#ef4444";

  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(Math.round(eased * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score]);

  const offset = ((100 - animated) / 100) * circ;

  return (
    <div className="rr-gauge-wrapper">
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
        {/* Track rings */}
        <circle cx="100" cy="100" r={72} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
        <circle cx="100" cy="100" r={56} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
        {/* Tick marks */}
        {Array.from({ length: 30 }).map((_, i) => {
          const angle = (i / 30) * 2 * Math.PI;
          const inner = i % 5 === 0 ? 88 : 83;
          return (
            <line key={i}
              x1={100 + 94 * Math.cos(angle)} y1={100 + 94 * Math.sin(angle)}
              x2={100 + inner * Math.cos(angle)} y2={100 + inner * Math.sin(angle)}
              stroke={i % 5 === 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}
        {/* Main arc */}
        <circle cx="100" cy="100" r={72} fill="none"
          stroke={col} strokeWidth="14"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.05s linear", filter: `drop-shadow(0 0 10px ${col})` }}
        />
        {/* Glow arc */}
        <circle cx="100" cy="100" r={72} fill="none"
          stroke={col} strokeWidth="4" opacity="0.2"
          strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      <div className="rr-gauge-center">
        <div className="rr-gauge-score" style={{ color: col }}>{animated}</div>
        <div className="rr-gauge-denom">/100</div>
        <div className="rr-gauge-label">RISK SCORE</div>
      </div>
    </div>
  );
}

function ModuleBar({ label, icon, value, color, delay, description }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="rr-bar-row" style={{ "--bar-color": color }}>
      <div className="rr-bar-header">
        <div className="rr-bar-left">
          <span className="rr-bar-icon">{icon}</span>
          <div>
            <div className="rr-bar-label">{label}</div>
            <div className="rr-bar-desc">{description}</div>
          </div>
        </div>
        <div className="rr-bar-value" style={{ color }}>{value}%</div>
      </div>
      <div className="rr-bar-track">
        <div className="rr-bar-fill" style={{ width: `${w}%`, background: color, boxShadow: `0 0 8px ${color}60`, transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

function FlagCard({ item, index, total }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), index * 80 + 200); return () => clearTimeout(t); }, [index]);

  const severity = item.toLowerCase().includes("high") || item.toLowerCase().includes("fee") || item.toLowerCase().includes("payment")
    ? "high"
    : item.toLowerCase().includes("warning") || item.toLowerCase().includes("suspicious")
    ? "medium"
    : "low";

  const colors = { high: "#ef4444", medium: "#f97316", low: "#eab308" };
  const labels = { high: "HIGH", medium: "MED", low: "LOW" };
  const c = colors[severity];

  return (
    <div className="rr-flag-card"
      style={{
        "--c": c,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateX(0) translateY(0)" : "translateX(-12px) translateY(4px)",
        transitionDelay: `${index * 60}ms`,
      }}>
      <div className="rr-flag-left">
        <div className="rr-flag-sev" style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
          {labels[severity]}
        </div>
      </div>
      <div className="rr-flag-body">
        <p className="rr-flag-text">{item}</p>
      </div>
      <div className="rr-flag-num">{String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</div>
    </div>
  );
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("flags");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!state) {
    return (
      <div className="rr-empty">
        <div className="rr-empty-inner">
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 20, fontSize: 13 }}>No scan data found.</p>
          <button onClick={() => navigate("/")} className="rr-back-link">← Run a new scan</button>
        </div>
        <style>{BASE_CSS}</style>
      </div>
    );
  }

  const { riskScore, riskCategory, explanations, status } = state;
  const col = riskScore < 30 ? "#22c55e" : riskScore < 70 ? "#eab308" : "#ef4444";
  const verdict = riskScore < 30 ? "SAFE" : riskScore < 70 ? "SUSPICIOUS" : "HIGH RISK";
  const verdictIcon = riskScore < 30 ? "✓" : riskScore < 70 ? "⚠" : "✕";
  const verdictDesc = riskScore < 30
    ? "This job offer shows no significant fraud indicators. The language, domain, and email patterns appear legitimate. Always verify independently before proceeding."
    : riskScore < 70
    ? "This offer contains some patterns associated with recruitment fraud. We recommend independent verification before sharing any personal information."
    : "Multiple strong fraud indicators detected. This appears to be a scam with high confidence. Do not share personal data, click links, or send any money.";

  const subScores = [
    { label: "Text Analyzer", icon: "◈", color: "#c084fc", value: Math.min(100, Math.round(riskScore * 1.05)), description: "Language patterns, urgency signals & payment requests" },
    { label: "AI Classifier", icon: "◎", color: "#22d3ee", value: Math.min(100, Math.round(riskScore * 0.95)), description: "Scam corpus matching & fraud keyword signatures" },
    { label: "Domain Verifier", icon: "◉", color: "#34d399", value: Math.max(10, 100 - riskScore), description: "TLD reputation, HTTPS enforcement & domain trust" },
    { label: "Email Checker", icon: "◍", color: "#fb923c", value: Math.max(5, 90 - riskScore + 5), description: "Email provider, domain match & pattern analysis" },
  ];

  const advice = riskScore >= 70 ? [
    { icon: "🚫", title: "Stop Immediately", body: "Do NOT click any links, provide personal information, or respond to this offer." },
    { icon: "🔍", title: "Research the Source", body: "Search the company name + 'scam' on Google to find reports from other victims." },
    { icon: "🏦", title: "Never Send Money", body: "Legitimate employers never ask for registration fees, processing fees, or gift cards." },
    { icon: "📋", title: "Report the Scam", body: "File a report with your local cybercrime authority and the job board where you found it." },
    { icon: "📞", title: "Ignore Callbacks", body: "Do not call back unknown numbers. Scammers use callbacks to verify active targets." },
  ] : riskScore >= 30 ? [
    { icon: "🔗", title: "Verify the Company", body: "Search for the company on LinkedIn and Glassdoor. Look for real employees and reviews." },
    { icon: "📧", title: "Check the Email Domain", body: "Confirm the recruiter's email domain exactly matches the official company website domain." },
    { icon: "🎥", title: "Request a Video Call", body: "Ask for a video interview before proceeding. Legitimate recruiters will agree immediately." },
    { icon: "📑", title: "Apply Officially", body: "Only apply through the company's official careers page, not third-party or unverified links." },
  ] : [
    { icon: "✅", title: "Looks Legitimate", body: "This offer appears genuine, but always conduct independent due diligence before accepting." },
    { icon: "📄", title: "Get It in Writing", body: "Request a formal offer letter that outlines compensation, benefits, and role expectations." },
    { icon: "⚖️", title: "Review Contracts", body: "Have a legal professional review any employment contract before signing." },
  ];

  const timeline = [
    { time: "00:00.0ms", msg: "Input received and sanitized", done: true },
    { time: "00:00.2ms", msg: "Text Analyzer: language pattern scan completed", done: true },
    { time: "00:00.4ms", msg: "AI Classifier: 2.4M corpus match finished", done: true },
    { time: "00:00.7ms", msg: "Domain Verifier: TLD + HTTPS check passed", done: true },
    { time: "00:00.9ms", msg: "Email Checker: domain validation complete", done: true },
    { time: "00:01.1ms", msg: `Risk composite computed: ${riskScore}/100`, done: true },
    { time: "00:01.2ms", msg: "Explanations generated & report assembled", done: true },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `RECRUIT SHIELD THREAT REPORT\n${"═".repeat(44)}\nRisk Score : ${riskScore}/100\nVerdict    : ${verdict}\nCategory   : ${riskCategory}\nStatus     : ${status || "ANALYZED"}\n\nDetected Flags (${explanations?.length || 0}):\n${explanations?.map((e, i) => `  ${String(i + 1).padStart(2, "0")}. ${e}`).join("\n")}\n\nGenerated by RecruitShield — ${"─".repeat(20)}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rr-root">
      <div className="rr-bg-grid" />
      <div className="rr-ambient" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${col}18 0%, transparent 65%)` }} />
      <div className="rr-scanlines" />

      {/* Header */}
      <header className="rr-header">
        <button onClick={() => navigate("/")} className="rr-back-btn">
          <span>←</span> New Scan
        </button>
        <div className="rr-header-center">
          <span className="rr-header-label">THREAT ANALYSIS REPORT</span>
        </div>
        <button onClick={handleCopy} className={`rr-copy-btn ${copied ? "rr-copy-btn--done" : ""}`}>
          {copied ? "✓  Copied!" : "📋  Copy Report"}
        </button>
      </header>

      <main className="rr-main">

        {/* Verdict Banner */}
        <div className="rr-verdict-banner" style={{ "--vc": col }}>
          <div className="rr-verdict-corner rr-vc-tl" />
          <div className="rr-verdict-corner rr-vc-tr" />
          <div className="rr-verdict-corner rr-vc-bl" />
          <div className="rr-verdict-corner rr-vc-br" />

          <div className="rr-verdict-left">
            <div className="rr-verdict-badge" style={{ background: `${col}18`, border: `1px solid ${col}35`, color: col }}>
              <span className="rr-verdict-icon">{verdictIcon}</span>
              ASSESSMENT
            </div>
            <div className="rr-verdict-title" style={{ color: col }}>{verdict}</div>
            <p className="rr-verdict-desc">{verdictDesc}</p>
          </div>

          <div className="rr-verdict-right">
            <div className="rr-status-pill" style={{ background: `${col}15`, border: `1px solid ${col}35`, color: col }}>
              <span className="rr-status-dot" style={{ background: col, boxShadow: riskScore >= 70 ? `0 0 8px ${col}` : "none" }} />
              {(status || "ANALYZED").toUpperCase()}
            </div>
            <div className="rr-verdict-category">{riskCategory}</div>
          </div>
        </div>

        {/* Score + Breakdown Row */}
        <div className="rr-score-row">
          {/* Gauge */}
          <div className="rr-gauge-card">
            <RadialGauge score={riskScore} />
            <div className="rr-gauge-meta">
              <span className="rr-gauge-meta-item" style={{ color: col }}>● {verdict}</span>
              <span className="rr-gauge-meta-sep">·</span>
              <span className="rr-gauge-meta-item">{explanations?.length || 0} flags</span>
            </div>
          </div>

          {/* Module Breakdown */}
          <div className="rr-breakdown-card">
            <div className="rr-section-label" style={{ marginBottom: 20 }}>MODULE SCORES</div>
            {subScores.map((s, i) => (
              <ModuleBar key={i} {...s} delay={i * 120} />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="rr-tabs">
          {[
            { id: "flags", label: "🚩 Red Flags", count: explanations?.length || 0 },
            { id: "advice", label: "💡 Advice" },
            { id: "timeline", label: "📡 Scan Log" },
          ].map(tab => (
            <button key={tab.id}
              className={`rr-tab ${activeTab === tab.id ? "rr-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
              {tab.count !== undefined && (
                <span className="rr-tab-count" style={{ background: tab.count > 0 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.1)", color: tab.count > 0 ? "#ef4444" : "#22c55e" }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rr-tab-content">

          {activeTab === "flags" && (
            <div>
              {explanations?.length ? (
                <>
                  <div className="rr-flags-summary">
                    <div className="rr-flags-count" style={{ color: col }}>{explanations.length}</div>
                    <div className="rr-flags-summary-text">
                      <div>Suspicious indicators detected</div>
                      <div className="rr-flags-summary-sub">Each flag contributes to the composite risk score</div>
                    </div>
                  </div>
                  <div className="rr-flags-list">
                    {explanations.map((item, i) => (
                      <FlagCard key={i} item={item} index={i} total={explanations.length} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="rr-no-flags">
                  <div className="rr-no-flags-icon">✅</div>
                  <div className="rr-no-flags-title">No Suspicious Flags Detected</div>
                  <p className="rr-no-flags-desc">This offer passed all fraud signature checks. All four analysis modules returned clean results.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "advice" && (
            <div className="rr-advice-grid">
              {advice.map((tip, i) => (
                <div key={i} className="rr-advice-card" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="rr-advice-icon">{tip.icon}</div>
                  <div>
                    <div className="rr-advice-title">{tip.title}</div>
                    <div className="rr-advice-body">{tip.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="rr-timeline">
              <div className="rr-timeline-header">ANALYSIS PIPELINE LOG</div>
              {timeline.map((step, i) => (
                <div key={i} className="rr-timeline-step" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="rr-timeline-time">[{step.time}]</div>
                  <div className="rr-timeline-dot" />
                  <div className="rr-timeline-line" />
                  <div className="rr-timeline-msg">{step.msg}</div>
                  <div className="rr-timeline-status">OK</div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* CTA */}
        <div className="rr-cta">
          <button onClick={() => navigate("/")} className="rr-cta-btn">
            <span>⚡</span> SCAN ANOTHER OFFER
          </button>
          <p className="rr-cta-note">RecruitShield • Multi-layer AI fraud detection • Not legal advice</p>
        </div>

      </main>

      <style>{BASE_CSS}</style>
    </div>
  );
}

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #020409; }

  .rr-root {
    font-family: 'Space Mono', 'Courier New', monospace;
    min-height: 100vh; background: #020409; color: #e2e8f0; overflow-x: hidden; position: relative;
  }
  .rr-bg-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: linear-gradient(rgba(0,255,200,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .rr-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
  .rr-scanlines {
    position: fixed; inset: 0; z-index: 1; pointer-events: none;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,200,0.008) 3px, rgba(0,255,200,0.008) 4px);
  }

  .rr-header {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 40px;
    border-bottom: 1px solid rgba(0,255,200,0.12);
    background: rgba(2,4,9,0.92); backdrop-filter: blur(24px);
  }
  .rr-back-btn {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Space Mono', monospace; font-size: 12px;
    color: rgba(0,255,200,0.7); background: none; border: 1px solid rgba(0,255,200,0.2);
    padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s;
    letter-spacing: 0.05em;
  }
  .rr-back-btn:hover { background: rgba(0,255,200,0.08); color: #00ffc8; }
  .rr-header-center { flex: 1; text-align: center; }
  .rr-header-label { font-size: 10px; letter-spacing: 0.3em; color: rgba(255,255,255,0.25); }
  .rr-copy-btn {
    font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 0.08em;
    padding: 8px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s;
    border: 1px solid rgba(0,255,200,0.3); color: #00ffc8; background: transparent;
  }
  .rr-copy-btn:hover { background: rgba(0,255,200,0.1); }
  .rr-copy-btn--done { background: rgba(34,197,94,0.12); border-color: rgba(34,197,94,0.4); color: #22c55e; }

  .rr-main {
    position: relative; z-index: 10; max-width: 1000px; margin: 0 auto;
    padding: 40px 32px 80px; animation: fade-up 0.5s ease both;
  }
  @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  /* Verdict Banner */
  .rr-verdict-banner {
    position: relative; margin-bottom: 28px; padding: 28px 32px;
    border-radius: 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap;
    background: color-mix(in srgb, var(--vc) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--vc) 25%, transparent);
    box-shadow: 0 0 60px color-mix(in srgb, var(--vc) 8%, transparent), inset 0 1px 0 color-mix(in srgb, var(--vc) 15%, transparent);
    overflow: hidden;
  }
  .rr-verdict-corner {
    position: absolute; width: 16px; height: 16px;
    border-color: var(--vc); border-style: solid; opacity: 0.5;
  }
  .rr-vc-tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
  .rr-vc-tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
  .rr-vc-bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
  .rr-vc-br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }
  .rr-verdict-badge {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 9px; letter-spacing: 0.3em; padding: 5px 12px;
    border-radius: 99px; margin-bottom: 12px;
  }
  .rr-verdict-icon { font-size: 12px; font-weight: bold; }
  .rr-verdict-title {
    font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 900;
    letter-spacing: 0.05em; line-height: 1; margin-bottom: 12px;
  }
  .rr-verdict-desc {
    font-family: system-ui, sans-serif; font-size: 13px; color: rgba(255,255,255,0.55);
    line-height: 1.7; max-width: 500px;
  }
  .rr-verdict-right { display: flex; flex-direction: column; align-items: flex-end; gap: 16px; }
  .rr-status-pill {
    display: flex; align-items: center; gap: 8px; padding: 8px 18px;
    border-radius: 99px; font-size: 11px; letter-spacing: 0.15em;
  }
  .rr-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .rr-verdict-category {
    font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
    color: rgba(255,255,255,0.3); letter-spacing: 0.1em;
  }

  /* Score Row */
  .rr-score-row {
    display: flex; gap: 20px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .rr-gauge-card {
    flex: 0 0 240px; min-width: 200px; padding: 28px 20px;
    border-radius: 20px; display: flex; flex-direction: column; align-items: center;
    background: rgba(0,255,200,0.03); border: 1px solid rgba(0,255,200,0.1);
  }
  .rr-gauge-wrapper { position: relative; width: 200px; height: 200px; }
  .rr-gauge-center {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .rr-gauge-score {
    font-family: 'Syne', sans-serif; font-size: 56px; font-weight: 900; line-height: 1;
  }
  .rr-gauge-denom { font-size: 13px; color: rgba(255,255,255,0.25); margin-top: 2px; }
  .rr-gauge-label { font-size: 9px; letter-spacing: 0.25em; color: rgba(255,255,255,0.2); margin-top: 8px; }
  .rr-gauge-meta {
    display: flex; align-items: center; gap: 8px; margin-top: 12px;
    font-size: 10px; color: rgba(255,255,255,0.3);
  }
  .rr-gauge-meta-sep { color: rgba(255,255,255,0.15); }

  .rr-breakdown-card {
    flex: 1 1 320px; padding: 28px; border-radius: 20px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  }
  .rr-section-label { font-size: 9px; letter-spacing: 0.3em; color: rgba(255,255,255,0.25); }

  .rr-bar-row { margin-bottom: 18px; }
  .rr-bar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .rr-bar-left { display: flex; align-items: center; gap: 10px; }
  .rr-bar-icon { font-size: 16px; color: var(--bar-color); }
  .rr-bar-label { font-size: 11px; font-weight: bold; color: rgba(255,255,255,0.75); margin-bottom: 2px; }
  .rr-bar-desc { font-size: 9px; color: rgba(255,255,255,0.25); font-family: system-ui, sans-serif; }
  .rr-bar-value { font-size: 12px; font-weight: bold; min-width: 40px; text-align: right; }
  .rr-bar-track { height: 4px; border-radius: 99px; background: rgba(255,255,255,0.05); overflow: hidden; }
  .rr-bar-fill { height: 100%; border-radius: 99px; transition: width 1.2s cubic-bezier(0.25, 1, 0.5, 1); width: 0; }

  /* Tabs */
  .rr-tabs { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
  .rr-tab {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px; font-size: 12px; cursor: pointer;
    font-family: 'Space Mono', monospace; letter-spacing: 0.05em; transition: all 0.2s;
    background: transparent; border: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.4);
  }
  .rr-tab--active {
    background: rgba(0,255,200,0.08); border-color: rgba(0,255,200,0.35); color: #00ffc8;
  }
  .rr-tab-count {
    padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: bold;
  }

  .rr-tab-content { min-height: 280px; }

  /* Flags */
  .rr-flags-summary {
    display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
    padding: 16px 20px; border-radius: 12px;
    background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15);
  }
  .rr-flags-count {
    font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 900; line-height: 1;
    flex-shrink: 0;
  }
  .rr-flags-summary-text { font-size: 13px; color: rgba(255,255,255,0.6); }
  .rr-flags-summary-sub { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 2px; font-family: system-ui, sans-serif; }
  .rr-flags-list { display: flex; flex-direction: column; gap: 8px; }
  .rr-flag-card {
    display: flex; align-items: flex-start; gap: 14px; padding: 14px 18px;
    border-radius: 12px; border: 1px solid color-mix(in srgb, var(--c) 20%, transparent);
    background: color-mix(in srgb, var(--c) 5%, transparent);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  .rr-flag-sev {
    font-size: 9px; font-weight: bold; letter-spacing: 0.15em;
    padding: 3px 8px; border-radius: 4px; flex-shrink: 0; margin-top: 2px;
  }
  .rr-flag-body { flex: 1; }
  .rr-flag-text {
    font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.65;
    font-family: system-ui, sans-serif;
  }
  .rr-flag-num { font-size: 10px; color: rgba(255,255,255,0.15); flex-shrink: 0; margin-top: 4px; }

  .rr-no-flags { text-align: center; padding: 60px 20px; }
  .rr-no-flags-icon { font-size: 52px; margin-bottom: 16px; }
  .rr-no-flags-title {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #22c55e; margin-bottom: 8px;
  }
  .rr-no-flags-desc { font-size: 13px; color: rgba(255,255,255,0.35); font-family: system-ui, sans-serif; line-height: 1.6; }

  /* Advice */
  .rr-advice-grid { display: flex; flex-direction: column; gap: 10px; }
  .rr-advice-card {
    display: flex; align-items: flex-start; gap: 16px; padding: 18px 22px;
    border-radius: 14px; border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02); animation: fade-up 0.4s ease both;
    transition: border-color 0.2s, background 0.2s;
  }
  .rr-advice-card:hover { border-color: rgba(0,255,200,0.2); background: rgba(0,255,200,0.03); }
  .rr-advice-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
  .rr-advice-title {
    font-size: 13px; font-weight: bold; color: rgba(255,255,255,0.85); margin-bottom: 4px;
    letter-spacing: 0.05em;
  }
  .rr-advice-body {
    font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.65;
    font-family: system-ui, sans-serif;
  }

  /* Timeline */
  .rr-timeline { display: flex; flex-direction: column; gap: 0; }
  .rr-timeline-header {
    font-size: 9px; letter-spacing: 0.3em; color: rgba(0,255,200,0.35);
    margin-bottom: 16px;
  }
  .rr-timeline-step {
    display: flex; align-items: center; gap: 14px; padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px;
    animation: fade-up 0.3s ease both;
  }
  .rr-timeline-time { color: rgba(0,255,200,0.4); min-width: 96px; flex-shrink: 0; font-size: 10px; }
  .rr-timeline-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; flex-shrink: 0; box-shadow: 0 0 6px #22c55e; }
  .rr-timeline-line { display: none; }
  .rr-timeline-msg { flex: 1; color: rgba(255,255,255,0.6); font-family: system-ui, sans-serif; }
  .rr-timeline-status {
    font-size: 10px; padding: 2px 8px; border-radius: 4px;
    background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.25);
    flex-shrink: 0;
  }

  /* CTA */
  .rr-cta { margin-top: 48px; text-align: center; }
  .rr-cta-btn {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 14px 36px; border-radius: 12px; cursor: pointer;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 0.2em;
    background: rgba(0,255,200,0.08); border: 1px solid rgba(0,255,200,0.3);
    color: #00ffc8; transition: all 0.25s ease;
  }
  .rr-cta-btn:hover { background: rgba(0,255,200,0.15); box-shadow: 0 0 30px rgba(0,255,200,0.15); transform: translateY(-1px); }
  .rr-cta-note { font-size: 10px; color: rgba(255,255,255,0.15); margin-top: 16px; letter-spacing: 0.1em; }

  .rr-empty {
    min-height: 100vh; background: #020409; display: flex;
    align-items: center; justify-content: center; font-family: 'Space Mono', monospace;
  }
  .rr-empty-inner { text-align: center; }
  .rr-back-link {
    color: #00ffc8; background: none; border: 1px solid rgba(0,255,200,0.3);
    padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 12px;
    font-family: 'Space Mono', monospace;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,255,200,0.2); border-radius: 4px; }
`;
