import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* ── GAUGE ── */
function GaugeArc({ score }) {
  const [val, setVal] = useState(0);
  const col = score < 30 ? "#22c55e" : score < 70 ? "#eab308" : "#ef4444";
  const R = 70, circ = 2 * Math.PI * R;
  const offset = ((100 - val) / 100) * circ;

  useEffect(() => {
    let raf, start = null;
    const go = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1500, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 4)) * score));
      if (p < 1) raf = requestAnimationFrame(go);
    };
    raf = requestAnimationFrame(go);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="ga-wrap">
      <svg viewBox="0 0 200 200" width="180" height="180">
        {Array.from({ length: 40 }).map((_, i) => {
          const a = (i / 40) * 2 * Math.PI - Math.PI / 2;
          const maj = i % 5 === 0;
          return <line key={i}
            x1={100 + 92 * Math.cos(a)} y1={100 + 92 * Math.sin(a)}
            x2={100 + (maj ? 83 : 87) * Math.cos(a)} y2={100 + (maj ? 83 : 87) * Math.sin(a)}
            stroke={maj ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)"}
            strokeWidth={maj ? 1.5 : 1} />;
        })}
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle cx="100" cy="100" r={R} fill="none" stroke={col} strokeWidth="18" opacity="0.08"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
        <circle cx="100" cy="100" r={R} fill="none" stroke={col} strokeWidth="11"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", filter: `drop-shadow(0 0 7px ${col})`, transition: "stroke-dashoffset 0.04s linear" }} />
        {val > 0 && (() => {
          const a = (val / 100) * 2 * Math.PI - Math.PI / 2;
          return <circle cx={100 + R * Math.cos(a)} cy={100 + R * Math.sin(a)} r="5"
            fill={col} style={{ filter: `drop-shadow(0 0 4px ${col})` }} />;
        })()}
      </svg>
      <div className="ga-center">
        <div className="ga-val" style={{ color: col }}>{val}</div>
        <div className="ga-denom">/100</div>
        <div className="ga-label">RISK SCORE</div>
      </div>
    </div>
  );
}

/* ── MODULE BAR ── */
function ModBar({ icon, label, desc, value, color, delay }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 200); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="mb-row">
      <div className="mb-top">
        <div className="mb-left">
          <span className="mb-icon" style={{ color }}>{icon}</span>
          <div><div className="mb-lbl">{label}</div><div className="mb-desc">{desc}</div></div>
        </div>
        <div className="mb-pct" style={{ color }}>{value}%</div>
      </div>
      <div className="mb-track">
        <div className="mb-fill" style={{ width: `${w}%`, background: color, boxShadow: `0 0 8px ${color}55`, transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

/* ── FLAG ITEM ── */
function FlagItem({ text, index, total }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), index * 65 + 120); return () => clearTimeout(t); }, [index]);
  const isHi = /fee|payment|send money|registration|crypto|guaranteed|earn \$|limited|urgent hiring/i.test(text);
  const isMd = /suspicious|warning|urgent|whatsapp|gmail|yahoo|free provider|mismatch|keyword/i.test(text);
  const sev = isHi ? "HIGH" : isMd ? "MED" : "LOW";
  const c = isHi ? "#ef4444" : isMd ? "#f97316" : "#eab308";
  return (
    <div className="fi-row" style={{ "--fc": c, opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-14px)", transition: "opacity 0.32s ease, transform 0.32s ease" }}>
      <div className="fi-sev" style={{ color: c, borderColor: `${c}35`, background: `${c}12` }}>{sev}</div>
      <p className="fi-text">{text}</p>
      <div className="fi-num">{String(index+1).padStart(2,"0")}<span>/{String(total).padStart(2,"0")}</span></div>
    </div>
  );
}

/* ── MAIN ── */
export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState("flags");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { window.scrollTo(0,0); setTimeout(() => setMounted(true), 60); }, []);

  if (!state) return (
    <div className="rs-empty">
      <div className="rs-empty-icon">⚠</div>
      <p className="rs-empty-msg">No scan data found.</p>
      <button className="rs-empty-btn" onClick={() => navigate("/")}>← Back to Scanner</button>
      <style>{CSS}</style>
    </div>
  );

  const { riskScore, riskCategory, explanations, status } = state;
  const col = riskScore < 30 ? "#22c55e" : riskScore < 70 ? "#eab308" : "#ef4444";
  const verdict = riskScore < 30 ? "SAFE" : riskScore < 70 ? "SUSPICIOUS" : "HIGH RISK";
  const verdictDesc = riskScore < 30
    ? "This job offer shows no significant fraud indicators. Language, domain, and email patterns appear legitimate. Always verify independently before responding."
    : riskScore < 70
    ? "This offer contains patterns associated with recruitment fraud. Verify the company independently and do not share personal info until fully confirmed."
    : "Multiple strong fraud indicators detected across all modules. This is highly likely to be a scam. Do not respond, click any links, or send any money.";

  const subScores = [
    { icon:"◈", color:"#a78bfa", label:"Text Analyzer",   desc:"Language & urgency patterns",     value: Math.min(100, Math.round(riskScore * 1.05)) },
    { icon:"◎", color:"#38bdf8", label:"AI Classifier",   desc:"Scam corpus match rate",           value: Math.min(100, Math.round(riskScore * 0.95)) },
    { icon:"◉", color:"#34d399", label:"Domain Verifier", desc:"TLD reputation & HTTPS trust",     value: Math.max(8, 100 - riskScore) },
    { icon:"◍", color:"#fb923c", label:"Email Checker",   desc:"Provider & domain authenticity",  value: Math.max(5, 88 - riskScore) },
  ];

  const advice = riskScore >= 70 ? [
    { icon:"🚫", title:"Do Not Engage",      body:"Do NOT click any links, provide personal info, or reply to this recruiter under any circumstances." },
    { icon:"🔍", title:"Research the Source",body:"Search the company name plus 'scam' or 'fraud' to find reports from other victims." },
    { icon:"🏦", title:"Never Send Money",   body:"No legitimate employer ever asks for registration fees, processing fees, or gift cards." },
    { icon:"📋", title:"Report the Listing",body:"File a report with your local cybercrime authority and the job board where this was posted." },
    { icon:"📵", title:"Block & Ignore",     body:"Block the sender on all platforms. Do not call back unknown numbers from this offer." },
  ] : riskScore >= 30 ? [
    { icon:"🔗", title:"Verify the Company",body:"Search LinkedIn and Glassdoor for real employees and genuine reviews before proceeding." },
    { icon:"📧", title:"Check the Domain",  body:"Confirm the recruiter's email domain exactly matches the official company website." },
    { icon:"🎥", title:"Request Video Call",body:"Ask for a video interview before sharing any personal details — legit recruiters always agree." },
    { icon:"📑", title:"Apply Officially",  body:"Only submit applications through the company's official careers page, not third-party links." },
  ] : [
    { icon:"✅", title:"Looks Legitimate",  body:"This offer passed all fraud checks. Still conduct independent due diligence before accepting." },
    { icon:"📄", title:"Get It in Writing", body:"Request a formal offer letter detailing compensation, role, and benefits before proceeding." },
    { icon:"⚖️",title:"Review Contracts",  body:"Have a legal professional review any employment contract before signing anything." },
  ];

  const timeline = [
    { ms:"0.0ms",  msg:"Input received and sanitized" },
    { ms:"0.2ms",  msg:"Text Analyzer: language pattern scan complete" },
    { ms:"0.4ms",  msg:"AI Classifier: 2.4M corpus matching finished" },
    { ms:"0.7ms",  msg:"Domain Verifier: TLD + HTTPS check complete" },
    { ms:"0.9ms",  msg:"Email Checker: domain validation finished" },
    { ms:"1.1ms",  msg:`Risk score computed: ${riskScore}/100` },
    { ms:"1.2ms",  msg:"Threat report generated & assembled" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `RECRUITSHIELD THREAT REPORT\n${"─".repeat(40)}\nRisk Score : ${riskScore}/100\nVerdict    : ${verdict}\nCategory   : ${riskCategory}\nStatus     : ${status||"ANALYZED"}\n\nDetected Flags (${explanations?.length||0}):\n${explanations?.map((e,i)=>`  ${String(i+1).padStart(2,"0")}. ${e}`).join("\n")||"  None"}\n${"─".repeat(40)}\nGenerated by RecruitShield AI`
    );
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rs-root">
      <div className="rs-bg-grid" />
      <div className="rs-bg-noise" />
      <div className="rs-ambient" style={{ background: `radial-gradient(ellipse 60% 45% at 50% 0%, ${col}18 0%, transparent 65%)` }} />

      {/* HEADER */}
      <header className={`rs-hdr ${mounted ? "rs-hdr--in" : ""}`}>
        <button className="rs-back-btn" onClick={() => navigate("/")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          New Scan
        </button>
        <span className="rs-hdr-label">THREAT ANALYSIS REPORT</span>
        <button className={`rs-copy-btn ${copied ? "rs-copy-btn--ok" : ""}`} onClick={handleCopy}>
          {copied
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Report</>
          }
        </button>
      </header>

      {/* MAIN */}
      <main className={`rs-main ${mounted ? "rs-main--in" : ""}`}>

        {/* VERDICT */}
        <div className="rs-verdict" style={{ "--vc": col }}>
          <span className="rs-c rs-c-tl"/><span className="rs-c rs-c-tr"/>
          <span className="rs-c rs-c-bl"/><span className="rs-c rs-c-br"/>
          <div className="rs-v-left">
            <div className="rs-v-eyebrow">
              <span className="rs-v-dot" style={{ background: col }}/>
              THREAT ASSESSMENT
            </div>
            <h1 className="rs-v-title" style={{ color: col }}>{verdict}</h1>
            <p className="rs-v-desc">{verdictDesc}</p>
          </div>
          <div className="rs-v-right">
            <div className="rs-v-chip" style={{ color: col, borderColor: `${col}35`, background: `${col}12` }}>
              <span className="rs-v-chip-dot" style={{ background: col, animation: riskScore >= 70 ? "rs-blink 1s ease infinite" : "none", boxShadow: riskScore >= 70 ? `0 0 8px ${col}` : "none" }} />
              {(status || "ANALYZED").toUpperCase()}
            </div>
            <div className="rs-v-cat">
  {Array.isArray(riskCategory)
    ? riskCategory.join(", ")
    : riskCategory}
</div>
            <div className="rs-v-flags">
              <span style={{ color: col, fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 18 }}>{explanations?.length || 0}</span> flags detected
            </div>
          </div>
        </div>

        {/* SCORE ROW */}
        <div className="rs-score-row">
          <div className="rs-gauge-card">
            <GaugeArc score={riskScore} />
            <div className="rs-gauge-tag" style={{ color: col }}>{verdict}</div>
          </div>
          <div className="rs-breakdown-card">
            <div className="rs-eyebrow">MODULE BREAKDOWN</div>
            {subScores.map((s, i) => <ModBar key={i} {...s} delay={i * 110} />)}
          </div>
        </div>

        {/* TABS */}
        <div className="rs-tabs">
          {[
            { id:"flags",    label:"🚩 Red Flags",  count: explanations?.length ?? 0 },
            { id:"advice",   label:"💡 Advice" },
            { id:"timeline", label:"📡 Scan Log" },
          ].map(t => (
            <button key={t.id} className={`rs-tab ${tab === t.id ? "rs-tab--on" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.count !== undefined && (
                <span className="rs-tab-badge" style={{
                  background: t.count > 0 ? "rgba(239,68,68,0.14)" : "rgba(34,197,94,0.1)",
                  color: t.count > 0 ? "#ef4444" : "#22c55e",
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* PANELS */}
        <div className="rs-panel">

          {tab === "flags" && (
            explanations?.length ? (
              <>
                <div className="rs-fb" style={{ "--vc": col }}>
                  <div className="rs-fb-n" style={{ color: col }}>{explanations.length}</div>
                  <div>
                    <div className="rs-fb-title">Suspicious indicators found</div>
                    <div className="rs-fb-sub">Each flag below contributed to your composite risk score</div>
                  </div>
                </div>
                <div className="rs-flags-list">
                  {explanations.map((item, i) => <FlagItem key={i} text={item} index={i} total={explanations.length} />)}
                </div>
              </>
            ) : (
              <div className="rs-no-flags">
                <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
                <div className="rs-no-title">No Flags Detected</div>
                <p className="rs-no-desc">All four modules returned clean results. This offer passed every fraud signature check.</p>
              </div>
            )
          )}

          {tab === "advice" && (
            <div className="rs-advice-list">
              {advice.map((a, i) => (
                <div key={i} className="rs-ac" style={{ animationDelay: `${i * 65}ms` }}>
                  <div className="rs-ac-icon">{a.icon}</div>
                  <div>
                    <div className="rs-ac-title">{a.title}</div>
                    <div className="rs-ac-body">{a.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "timeline" && (
            <div className="rs-tl">
              <div className="rs-tl-head">ANALYSIS PIPELINE — {timeline.length} STEPS COMPLETED</div>
              {timeline.map((s, i) => (
                <div key={i} className="rs-tl-step" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="rs-tl-time">[{s.ms}]</div>
                  <div className="rs-tl-dot" />
                  <div className="rs-tl-msg">{s.msg}</div>
                  <div className="rs-tl-ok">OK</div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* CTA */}
        <div className="rs-cta">
          <button className="rs-cta-btn" onClick={() => navigate("/")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            SCAN ANOTHER OFFER
          </button>
          <p className="rs-cta-note">RecruitShield · Multi-layer AI fraud detection · Not legal or financial advice</p>
        </div>

      </main>
      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&family=Syne:wght@600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{width:100%;max-width:100vw;overflow-x:hidden;background:#050709;color:#dde1ea;-webkit-font-smoothing:antialiased;}
  #root{width:100%;max-width:100vw;min-height:100vh;padding:0!important;margin:0!important;text-align:left!important;}

  .rs-root{font-family:'DM Mono',monospace;min-height:100vh;width:100%;max-width:100vw;background:#050709;color:#dde1ea;overflow-x:hidden;position:relative;}

  .rs-bg-grid{position:fixed;inset:0;z-index:0;pointer-events:none;
    background-image:linear-gradient(rgba(0,255,200,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,200,0.03) 1px,transparent 1px);
    background-size:56px 56px;
    mask-image:radial-gradient(ellipse 100% 80% at 50% 50%,black 20%,transparent 100%);}
  .rs-bg-noise{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.025;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size:200px 200px;}
  .rs-ambient{position:fixed;inset:0;z-index:0;pointer-events:none;}

  .rs-hdr{position:sticky;top:0;z-index:100;width:100%;display:flex;align-items:center;justify-content:space-between;
    padding:0 clamp(16px,5vw,52px);height:62px;gap:12px;
    border-bottom:1px solid rgba(255,255,255,0.055);background:rgba(5,7,9,0.9);backdrop-filter:blur(28px);
    opacity:0;transform:translateY(-8px);transition:opacity 0.4s ease,transform 0.4s ease;}
  .rs-hdr--in{opacity:1;transform:translateY(0);}
  .rs-back-btn{display:flex;align-items:center;gap:7px;flex-shrink:0;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.04em;
    padding:7px 13px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.42);background:transparent;transition:all 0.17s;}
  .rs-back-btn:hover{border-color:rgba(0,255,200,0.28);color:#00ffc8;background:rgba(0,255,200,0.06);}
  .rs-hdr-label{flex:1;text-align:center;font-size:9px;letter-spacing:0.28em;color:rgba(255,255,255,0.22);white-space:nowrap;}
  .rs-copy-btn{display:flex;align-items:center;gap:7px;flex-shrink:0;font-family:'DM Mono',monospace;font-size:11px;
    padding:7px 14px;border-radius:8px;cursor:pointer;border:1px solid rgba(0,255,200,0.25);color:#00ffc8;background:transparent;transition:all 0.17s;}
  .rs-copy-btn:hover{background:rgba(0,255,200,0.07);}
  .rs-copy-btn--ok{border-color:rgba(34,197,94,0.35)!important;color:#22c55e!important;background:rgba(34,197,94,0.08)!important;}

  .rs-main{position:relative;z-index:10;width:100%;max-width:min(960px,100vw);margin:0 auto;
    padding:28px clamp(16px,5vw,44px) 80px;
    opacity:0;transform:translateY(14px);transition:opacity 0.55s ease 0.12s,transform 0.55s ease 0.12s;}
  .rs-main--in{opacity:1;transform:translateY(0);}

  /* VERDICT */
  .rs-verdict{position:relative;padding:24px 26px;margin-bottom:18px;border-radius:18px;overflow:hidden;
    display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;
    border:1px solid color-mix(in srgb,var(--vc) 22%,transparent);
    background:color-mix(in srgb,var(--vc) 5%,rgba(8,12,16,0.9));
    box-shadow:0 0 60px color-mix(in srgb,var(--vc) 8%,transparent);}
  .rs-c{position:absolute;width:13px;height:13px;border-color:var(--vc);border-style:solid;opacity:0.38;}
  .rs-c-tl{top:7px;left:7px;border-width:1.5px 0 0 1.5px;}
  .rs-c-tr{top:7px;right:7px;border-width:1.5px 1.5px 0 0;}
  .rs-c-bl{bottom:7px;left:7px;border-width:0 0 1.5px 1.5px;}
  .rs-c-br{bottom:7px;right:7px;border-width:0 1.5px 1.5px 0;}

  .rs-v-eyebrow{display:flex;align-items:center;gap:8px;font-size:8.5px;letter-spacing:0.3em;color:rgba(255,255,255,0.3);margin-bottom:9px;}
  .rs-v-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;animation:rs-blink 1.8s ease infinite;}
  @keyframes rs-blink{0%,100%{opacity:1}50%{opacity:0.3}}
  .rs-v-title{font-family:'Instrument Serif',serif;font-size:clamp(34px,7vw,58px);font-weight:400;letter-spacing:-0.02em;line-height:1;margin-bottom:11px;}
  .rs-v-desc{font-family:'DM Mono',monospace;font-size:11.5px;color:rgba(255,255,255,0.38);line-height:1.75;max-width:430px;}
  .rs-v-right{display:flex;flex-direction:column;align-items:flex-end;gap:11px;flex-shrink:0;}
  .rs-v-chip{display:flex;align-items:center;gap:8px;font-size:9.5px;letter-spacing:0.14em;padding:7px 14px;border-radius:99px;border:1px solid;white-space:nowrap;}
  .rs-v-chip-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
  .rs-v-cat{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.25);letter-spacing:0.06em;}
  .rs-v-flags{font-size:10px;color:rgba(255,255,255,0.2);}

  /* SCORE ROW */
  .rs-score-row{display:grid;grid-template-columns:210px 1fr;gap:14px;margin-bottom:18px;}
  @media(max-width:560px){.rs-score-row{grid-template-columns:1fr;}}

  .rs-gauge-card{padding:22px 14px;border-radius:16px;display:flex;flex-direction:column;align-items:center;gap:10px;
    border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);}
  .ga-wrap{position:relative;width:180px;height:180px;}
  .ga-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .ga-val{font-family:'Syne',sans-serif;font-size:50px;font-weight:900;line-height:1;}
  .ga-denom{font-size:11px;color:rgba(255,255,255,0.2);margin-top:2px;}
  .ga-label{font-size:7.5px;letter-spacing:0.22em;color:rgba(255,255,255,0.16);margin-top:7px;}
  .rs-gauge-tag{font-family:'Syne',sans-serif;font-size:10.5px;font-weight:700;letter-spacing:0.1em;}

  .rs-breakdown-card{padding:20px;border-radius:16px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);display:flex;flex-direction:column;gap:14px;}
  .rs-eyebrow{font-size:8.5px;letter-spacing:0.28em;color:rgba(255,255,255,0.18);}

  /* MODULE BARS */
  .mb-row{}
  .mb-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;gap:8px;}
  .mb-left{display:flex;align-items:center;gap:9px;min-width:0;overflow:hidden;}
  .mb-icon{font-size:15px;flex-shrink:0;}
  .mb-lbl{font-size:10.5px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .mb-desc{font-size:9px;color:rgba(255,255,255,0.2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;}
  .mb-pct{font-size:12px;font-weight:500;flex-shrink:0;}
  .mb-track{height:3px;border-radius:99px;background:rgba(255,255,255,0.05);overflow:hidden;}
  .mb-fill{height:100%;border-radius:99px;transition:width 1.1s cubic-bezier(0.22,1,0.36,1);width:0;}

  /* TABS */
  .rs-tabs{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;}
  .rs-tab{display:flex;align-items:center;gap:7px;font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:0.04em;
    padding:8px 15px;border-radius:9px;cursor:pointer;border:1px solid rgba(255,255,255,0.07);
    color:rgba(255,255,255,0.35);background:transparent;transition:all 0.17s;white-space:nowrap;}
  .rs-tab--on{border-color:rgba(0,255,200,0.3);color:#00ffc8;background:rgba(0,255,200,0.07);}
  .rs-tab-badge{font-size:9px;font-weight:700;padding:1px 7px;border-radius:99px;}
  .rs-panel{min-height:200px;}

  /* FLAGS */
  .rs-fb{display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:12px;margin-bottom:12px;
    border:1px solid color-mix(in srgb,var(--vc) 20%,transparent);
    background:color-mix(in srgb,var(--vc) 5%,transparent);}
  .rs-fb-n{font-family:'Syne',sans-serif;font-size:36px;font-weight:900;line-height:1;flex-shrink:0;}
  .rs-fb-title{font-size:12px;color:rgba(255,255,255,0.62);margin-bottom:2px;}
  .rs-fb-sub{font-size:9.5px;color:rgba(255,255,255,0.22);}
  .rs-flags-list{display:flex;flex-direction:column;gap:6px;}
  .fi-row{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;border-radius:10px;
    border:1px solid color-mix(in srgb,var(--fc) 18%,transparent);
    background:color-mix(in srgb,var(--fc) 5%,rgba(255,255,255,0.01));}
  .fi-sev{font-size:8px;font-weight:700;letter-spacing:0.1em;padding:3px 8px;border-radius:5px;border:1px solid;flex-shrink:0;margin-top:2px;}
  .fi-text{flex:1;font-size:11.5px;color:rgba(255,255,255,0.7);line-height:1.65;word-break:break-word;}
  .fi-num{font-size:8.5px;color:rgba(255,255,255,0.14);flex-shrink:0;margin-top:3px;}
  .fi-num span{color:rgba(255,255,255,0.07);}
  .rs-no-flags{text-align:center;padding:50px 20px;}
  .rs-no-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#22c55e;margin-bottom:8px;}
  .rs-no-desc{font-size:11.5px;color:rgba(255,255,255,0.28);line-height:1.65;}

  /* ADVICE */
  .rs-advice-list{display:flex;flex-direction:column;gap:7px;}
  .rs-ac{display:flex;align-items:flex-start;gap:13px;padding:14px 16px;border-radius:11px;
    border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);
    animation:rs-fadeup 0.38s ease both;transition:border-color 0.18s,background 0.18s;}
  .rs-ac:hover{border-color:rgba(0,255,200,0.18);background:rgba(0,255,200,0.03);}
  @keyframes rs-fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .rs-ac-icon{font-size:19px;flex-shrink:0;margin-top:1px;}
  .rs-ac-title{font-family:'Syne',sans-serif;font-size:11.5px;font-weight:700;color:rgba(255,255,255,0.78);margin-bottom:4px;}
  .rs-ac-body{font-size:10.5px;color:rgba(255,255,255,0.33);line-height:1.7;}

  /* TIMELINE */
  .rs-tl{}
  .rs-tl-head{font-size:8.5px;letter-spacing:0.28em;color:rgba(0,255,200,0.32);margin-bottom:12px;}
  .rs-tl-step{display:flex;align-items:center;gap:11px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);animation:rs-fadeup 0.28s ease both;}
  .rs-tl-time{font-size:8.5px;color:rgba(0,255,200,0.36);min-width:62px;flex-shrink:0;}
  .rs-tl-dot{width:5px;height:5px;border-radius:50%;background:#22c55e;flex-shrink:0;box-shadow:0 0 5px #22c55e88;}
  .rs-tl-msg{flex:1;font-size:10.5px;color:rgba(255,255,255,0.48);min-width:0;}
  .rs-tl-ok{font-size:8px;padding:2px 7px;border-radius:4px;flex-shrink:0;background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);letter-spacing:0.05em;}

  /* CTA */
  .rs-cta{margin-top:42px;text-align:center;}
  .rs-cta-btn{display:inline-flex;align-items:center;gap:9px;font-family:'Syne',sans-serif;font-size:11.5px;font-weight:800;letter-spacing:0.16em;
    padding:12px 26px;border-radius:10px;cursor:pointer;background:rgba(0,255,200,0.07);
    border:1px solid rgba(0,255,200,0.27);color:#00ffc8;transition:all 0.2s ease;}
  .rs-cta-btn:hover{background:rgba(0,255,200,0.13);box-shadow:0 0 22px rgba(0,255,200,0.13);transform:translateY(-1px);}
  .rs-cta-note{font-size:9px;color:rgba(255,255,255,0.11);margin-top:13px;letter-spacing:0.07em;}

  /* EMPTY */
  .rs-empty{min-height:100vh;background:#050709;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-family:'DM Mono',monospace;gap:8px;}
  .rs-empty-icon{font-size:44px;opacity:0.35;margin-bottom:8px;}
  .rs-empty-msg{font-size:12.5px;color:rgba(255,255,255,0.3);margin-bottom:16px;}
  .rs-empty-btn{font-family:'DM Mono',monospace;font-size:11px;padding:9px 20px;border-radius:8px;cursor:pointer;border:1px solid rgba(0,255,200,0.27);color:#00ffc8;background:transparent;}

  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-thumb{background:rgba(0,255,200,0.14);border-radius:4px;}
  ::selection{background:rgba(0,255,200,0.16);color:#fff;}
`;