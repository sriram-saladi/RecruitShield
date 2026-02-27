import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const MODULES = [
  { id: "textAnalyzer",  name: "Text Analyzer",   icon: "T",  color: "#a78bfa", glow: "rgba(167,139,250,0.35)", desc: "Language patterns & urgency", steps: ["Tokenizing input...", "Scanning patterns...", "Urgency detection...", "Done ✓"] },
  { id: "aiClassifier",  name: "AI Classifier",   icon: "AI", color: "#38bdf8", glow: "rgba(56,189,248,0.35)",  desc: "2.4M corpus matching",       steps: ["Loading model...",   "Corpus matching...",  "Scoring...",          "Done ✓"] },
  { id: "domainCheck",   name: "Domain Verifier", icon: "D",  color: "#34d399", glow: "rgba(52,211,153,0.35)",  desc: "TLD reputation & HTTPS",     steps: ["Parsing domain...",  "TLD lookup...",       "Trust score...",      "Done ✓"] },
  { id: "emailChecker",  name: "Email Checker",   icon: "E",  color: "#fb923c", glow: "rgba(251,146,60,0.35)",  desc: "Provider & domain match",    steps: ["Extracting...",      "Provider check...",   "Pattern scan...",     "Done ✓"] },
];

const EXAMPLES = [
  { label: "Crypto MLM", risk: "HIGH RISK", riskColor: "#ef4444", text: "Congratulations! You've been selected for a remote crypto trading position. Earn $5,000/week from home. No experience needed! Send $150 registration fee to unlock your account. Act now — only 3 spots left!" },
  { label: "Phishing",   risk: "DANGER",   riskColor: "#f97316", text: "Dear Candidate, We found your profile online. We offer a paid internship at Google subsidiary. Please click this link to verify your identity: http://g00gle-careers.xyz" },
  { label: "Legit Offer",risk: "SAFE",     riskColor: "#22c55e", text: "We're hiring a Senior React Engineer at Stripe. Salary: $160K–$200K. Full-time, remote-friendly. Apply via stripe.com/careers. Background check via Checkr." },
];

const STATS = [
  { val: "4",     label: "AI Modules"    },
  { val: "Real-Time", label: "Threat Detection" },
  { val: "Secure", label: "Data Handling"  },
  { val: "<2s",   label: "Per Analysis"  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeModule, setActiveModule] = useState(-1);
  const [modStates, setModStates] = useState(MODULES.map(() => ({ done: false, stepIdx: -1 })));
  const [charCount, setCharCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const textareaRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    try { setHistory(JSON.parse(localStorage.getItem("rs_history") || "[]")); } catch {}
  }, []);

  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const runModuleAnimation = () => new Promise(resolve => {
    let mi = 0;
    setModStates(MODULES.map(() => ({ done: false, stepIdx: -1 })));
    const runMod = () => {
      if (mi >= MODULES.length) { resolve(); return; }
      setActiveModule(mi);
      let si = 0;
      const runStep = () => {
        if (si >= MODULES[mi].steps.length) {
          const captured = mi;
          setModStates(p => { const n=[...p]; n[captured]={done:true,stepIdx:si}; return n; });
          mi++; setTimeout(runMod, 280); return;
        }
        const captured = mi;
        setModStates(p => { const n=[...p]; n[captured]={done:false,stepIdx:si}; return n; });
        si++; setTimeout(runStep, 340);
      };
      runStep();
    };
    runMod();
  });

  const handleAnalyze = async () => {
    if (!text.trim()) { textareaRef.current?.focus(); return; }
    setLoading(true);
    try {
      const [res] = await Promise.all([
        axios.post("http://localhost:5000/api/jobs/analyze", { description: text }),
        runModuleAnimation(),
      ]);
      const entry = { id: Date.now(), snippet: text.slice(0, 80) + "...", score: res.data.riskScore, category: res.data.riskCategory, date: new Date().toLocaleString() };
      const updated = [entry, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("rs_history", JSON.stringify(updated));
      navigate("/result", { state: res.data });
    } catch {
      setLoading(false);
      setActiveModule(-1);
      setModStates(MODULES.map(() => ({ done: false, stepIdx: -1 })));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = ev => { setText(ev.target.result); setCharCount(ev.target.result.length); };
      reader.readAsText(file);
    }
  };

  const riskColor = s => s < 30 ? "#22c55e" : s < 70 ? "#eab308" : "#ef4444";

  return (
    <div className="ld-root">
      <div className="ld-cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />
      <div className="ld-bg-grid" />
      <div className="ld-bg-noise" />
      <div className="ld-bg-radial" />

      {/* HEADER */}
      <header className={`ld-header ${mounted ? "ld-header--in" : ""}`}>
        <div className="ld-logo">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path d="M17 2L30 8V18C30 24.627 24.075 30 17 30C9.925 30 4 24.627 4 18V8L17 2Z" stroke="url(#lg)" strokeWidth="1.5" fill="rgba(0,255,200,0.05)"/>
            <path d="M17 8L24 11.5V18C24 21.314 20.866 24 17 24C13.134 24 10 21.314 10 18V11.5L17 8Z" stroke="rgba(0,255,200,0.25)" strokeWidth="1" fill="none"/>
            <text x="17" y="21" textAnchor="middle" fill="#00ffc8" fontSize="9" fontWeight="700" fontFamily="monospace">RS</text>
            <defs>
              <linearGradient id="lg" x1="4" y1="2" x2="30" y2="30">
                <stop stopColor="#00ffc8"/><stop offset="1" stopColor="#38bdf8"/>
              </linearGradient>
            </defs>
          </svg>
          <div>
            <div className="ld-logo-name">RecruitShield</div>
            <div className="ld-logo-sub">AI FRAUD DETECTION</div>
          </div>
        </div>

        <div className="ld-header-right">
          <button className={`ld-nav-btn ${showHistory ? "ld-nav-btn--active" : ""}`} onClick={() => setShowHistory(!showHistory)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            History
            {history.length > 0 && <span className="ld-badge">{history.length}</span>}
          </button>
          <div className="ld-live-indicator">
            <span className="ld-live-dot"/>
            <span>LIVE</span>
          </div>
        </div>
      </header>

      {/* HISTORY DRAWER */}
      {showHistory && (
        <aside className="ld-drawer">
          <div className="ld-drawer-head">
            <span>SCAN HISTORY</span>
            <button className="ld-drawer-close" onClick={() => setShowHistory(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {history.length === 0
            ? <p className="ld-drawer-empty">No scans yet. Run your first analysis below.</p>
            : history.map(h => (
              <div key={h.id} className="ld-drawer-item">
                <div className="ld-drawer-score" style={{ color: riskColor(h.score) }}>
                  {h.score}<small>/100</small>
                </div>
                <div className="ld-drawer-info">
                  <div className="ld-drawer-cat" style={{ color: riskColor(h.score) }}>{h.category}</div>
                  <div className="ld-drawer-snip">{h.snippet}</div>
                  <div className="ld-drawer-date">{h.date}</div>
                </div>
              </div>
            ))
          }
          {history.length > 0 && (
            <button className="ld-drawer-clear" onClick={() => { setHistory([]); localStorage.removeItem("rs_history"); }}>
              Clear history
            </button>
          )}
        </aside>
      )}

      {/* MAIN */}
      <main className={`ld-main ${mounted ? "ld-main--in" : ""}`}>

        {/* HERO */}
        <section className="ld-hero">
          <div className="ld-kicker">
            <span className="ld-kicker-dash"/>
            AI-POWERED RECRUITMENT FRAUD DETECTION
            <span className="ld-kicker-dash ld-kicker-dash--r"/>
          </div>

          <h1 className="ld-h1">
            <span className="ld-h1-dim">Don't Fall For</span>
            <span className="ld-h1-main">
              <span className="ld-h1-stroke">Fake</span>
              <span className="ld-h1-glow"> Jobs.</span>
            </span>
          </h1>

          <p className="ld-hero-desc">
            Paste any job offer. Our 4-module AI engine cross-checks language patterns,
            domain reputation, salary benchmarks, and email authenticity — delivering a
            full threat report in under 2 seconds.
          </p>

          <div className="ld-stats-row">
            {STATS.map((s, i) => (
              <div key={i} className="ld-stat-item">
                <div className="ld-stat-val">{s.val}</div>
                <div className="ld-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ANALYZER */}
        <section className="ld-analyzer">

          {/* Module chips */}
          <div className="ld-mod-strip">
            {MODULES.map((m, i) => (
              <div key={m.id}
                className={`ld-mod-chip ${activeModule === i ? "ld-mod-chip--active" : ""} ${modStates[i].done ? "ld-mod-chip--done" : ""}`}
                style={{ "--mc": m.color, "--mg": m.glow }}>
                <div className="ld-chip-icon">{m.icon}</div>
                <div className="ld-chip-body">
                  <div className="ld-chip-name">{m.name}</div>
                  <div className="ld-chip-step">
                    {modStates[i].done
                      ? "Complete ✓"
                      : activeModule === i
                      ? (m.steps[Math.max(0, modStates[i].stepIdx)] || "Running...")
                      : m.desc
                    }
                  </div>
                </div>
                <div className="ld-chip-indicator">
                  {modStates[i].done
                    ? <span className="ld-chip-check">✓</span>
                    : activeModule === i
                    ? <span className="ld-chip-spinner"/>
                    : <span className="ld-chip-dot"/>
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Input card */}
          <div className={`ld-card ${dragging ? "ld-card--drag" : ""} ${focused ? "ld-card--focus" : ""}`}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}>

            <div className="ld-card-topbar">
              <div className="ld-card-dots">
                <span style={{background:"#ef4444"}}/>
                <span style={{background:"#f59e0b"}}/>
                <span style={{background:"#22c55e"}}/>
              </div>
              <span className="ld-card-file">analyze.sh — input</span>
              <span className="ld-card-chars">{charCount > 0 ? `${charCount} chars` : ""}</span>
            </div>

            <textarea
              ref={textareaRef}
              className="ld-ta"
              rows={8}
              value={text}
              onChange={e => { setText(e.target.value); setCharCount(e.target.value.length); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={"$ paste_job_offer --analyze\n\nPaste the full job description, recruiter email,\nor internship offer here. Drop a .txt file too."}
              disabled={loading}
            />

            <div className="ld-progress-bar">
              <div className="ld-progress-fill" style={{ width: `${Math.min(100, (charCount/2000)*100)}%` }}/>
            </div>

            <div className="ld-card-footer">
              <div className="ld-examples-row">
                <span className="ld-ex-label">Try:</span>
                {EXAMPLES.map(ex => (
                  <button key={ex.label} className="ld-ex-btn"
                    style={{ "--ec": ex.riskColor }}
                    onClick={() => { setText(ex.text); setCharCount(ex.text.length); textareaRef.current?.focus(); }}>
                    <span className="ld-ex-risk" style={{color: ex.riskColor}}>{ex.risk}</span>
                    {ex.label}
                  </button>
                ))}
              </div>

              <button className={`ld-go-btn ${loading ? "ld-go-btn--loading" : ""}`}
                onClick={handleAnalyze} disabled={loading}>
                {loading ? (
                  <><span className="ld-go-spinner"/><span>ANALYZING...</span></>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    <span>ANALYZE THREAT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="ld-features">
          <div className="ld-section-label">WHAT WE DETECT</div>
          <div className="ld-feat-grid">
            {[
              { icon: "◈", color: "#a78bfa", title: "Manipulative Language",  desc: "Detects urgency tactics, vague promises, and psychological pressure used to rush job seekers." },
              { icon: "◎", color: "#38bdf8", title: "Fraud Signatures",        desc: "Matches 40+ known patterns — fake salaries, upfront fees, MLM schemes, and phishing hooks." },
              { icon: "◉", color: "#34d399", title: "Domain Reputation",       desc: "Validates domains against phishing registries, suspicious TLDs (.xyz, .top), and HTTP-only sites." },
              { icon: "◍", color: "#fb923c", title: "Email Authenticity",      desc: "Flags free providers, domain mismatches, suspicious usernames, and off-platform contact requests." },
              { icon: "⬡", color: "#f472b6", title: "Salary Benchmarks",       desc: "Compares offered pay against real market data to catch impossible promises like $5K/week for no work." },
              { icon: "⬢", color: "#facc15", title: "Explainable Risk Score",  desc: "Returns a 0–100 composite score with per-module breakdowns so you understand every flag raised." },
            ].map((f, i) => (
              <div key={i} className="ld-feat" style={{ "--fc": f.color, animationDelay: `${i*55}ms` }}>
                <span className="ld-feat-icon">{f.icon}</span>
                <h3 className="ld-feat-title">{f.title}</h3>
                <p className="ld-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="ld-how">
          <div className="ld-section-label">HOW IT WORKS</div>
          <div className="ld-how-grid">
            {[
              { n: "01", title: "Paste the Offer",     desc: "Drop any job description, recruiter email, or internship posting into the analyzer box." },
              { n: "02", title: "4 Modules Fire",      desc: "Text Analyzer, AI Classifier, Domain Verifier, and Email Checker each run independently." },
              { n: "03", title: "Score Computed",      desc: "Each module contributes a weighted sub-score. The composite 0–100 risk score is assembled." },
              { n: "04", title: "Full Report Delivered",desc: "Detailed breakdown of every flag with severity levels and actionable next-step advice." },
            ].map((s, i) => (
              <div key={i} className="ld-step">
                <div className="ld-step-num">{s.n}</div>
                <div className="ld-step-title">{s.title}</div>
                <div className="ld-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ld-footer">
          <div className="ld-footer-name">RecruitShield</div>
          <div className="ld-footer-copy">Multi-layer AI fraud detection · Not legal or financial advice · © 2025</div>
        </footer>

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          width: 100%; max-width: 100vw; overflow-x: hidden;
          background: #050709; color: #dde1ea;
        }
        #root {
          width: 100%; max-width: 100vw; min-height: 100vh;
          padding: 0 !important; margin: 0 !important; text-align: left !important;
        }

        .ld-root {
          font-family: 'DM Mono', monospace;
          min-height: 100vh; width: 100%; max-width: 100vw;
          background: #050709; color: #dde1ea;
          overflow-x: hidden; position: relative;
        }

        /* CURSOR GLOW */
        .ld-cursor-glow {
          position: fixed; width: 480px; height: 480px; pointer-events: none; z-index: 0;
          background: radial-gradient(circle, rgba(0,255,200,0.045) 0%, transparent 65%);
          border-radius: 50%; transform: translate(-50%,-50%);
          transition: left 0.08s linear, top 0.08s linear;
        }

        /* BG LAYERS */
        .ld-bg-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,255,200,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 40%, black 30%, transparent 100%);
        }
        .ld-bg-noise {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
        .ld-bg-radial {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 55% 45% at 15% 5%, rgba(0,255,200,0.08) 0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 90% 85%, rgba(56,189,248,0.06) 0%, transparent 55%);
        }

        /* HEADER */
        .ld-header {
          position: sticky; top: 0; z-index: 100; width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(16px, 5vw, 52px); height: 62px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          background: rgba(5,7,9,0.88); backdrop-filter: blur(28px);
          opacity: 0; transform: translateY(-10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ld-header--in { opacity: 1; transform: translateY(0); }

        .ld-logo { display: flex; align-items: center; gap: 11px; }
        .ld-logo-name {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800;
          color: #fff; letter-spacing: -0.01em;
        }
        .ld-logo-sub {
          font-size: 7.5px; letter-spacing: 0.22em; color: rgba(0,255,200,0.45);
          margin-top: 2px; display: block;
        }

        .ld-header-right { display: flex; align-items: center; gap: 12px; }
        .ld-nav-btn {
          display: flex; align-items: center; gap: 7px;
          font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.04em;
          padding: 7px 14px; border-radius: 8px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.42); background: transparent;
          transition: all 0.18s;
        }
        .ld-nav-btn:hover, .ld-nav-btn--active {
          border-color: rgba(0,255,200,0.28); color: #00ffc8; background: rgba(0,255,200,0.06);
        }
        .ld-badge {
          background: rgba(0,255,200,0.18); color: #00ffc8;
          font-size: 9px; padding: 1px 6px; border-radius: 99px;
        }
        .ld-live-indicator {
          display: flex; align-items: center; gap: 6px;
          font-size: 9.5px; letter-spacing: 0.18em; color: rgba(0,255,200,0.48);
        }
        .ld-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #00ffc8;
          animation: livepulse 1.6s ease infinite;
        }
        @keyframes livepulse {
          0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,255,200,0.5)}
          50%{opacity:0.55;box-shadow:0 0 0 5px rgba(0,255,200,0)}
        }

        /* DRAWER */
        .ld-drawer {
          position: fixed; right: 0; top: 0; bottom: 0; width: min(340px,90vw); z-index: 200;
          background: rgba(5,7,9,0.98); border-left: 1px solid rgba(255,255,255,0.07);
          overflow-y: auto; padding: 22px 18px;
          animation: drawerin 0.2s ease;
        }
        @keyframes drawerin { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .ld-drawer-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
          font-size: 9.5px; letter-spacing: 0.25em; color: rgba(0,255,200,0.48);
        }
        .ld-drawer-close {
          background: none; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.35);
          cursor: pointer; border-radius: 6px; padding: 4px 5px; display: flex; align-items: center;
          transition: all 0.15s;
        }
        .ld-drawer-close:hover { color: #fff; border-color: rgba(255,255,255,0.18); }
        .ld-drawer-empty { font-size: 11px; color: rgba(255,255,255,0.2); line-height: 1.6; }
        .ld-drawer-item {
          display: flex; gap: 12px; margin-bottom: 10px; padding: 12px;
          border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
        }
        .ld-drawer-score {
          font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 900; line-height: 1; flex-shrink: 0;
        }
        .ld-drawer-score small { font-size: 9px; color: rgba(255,255,255,0.2); }
        .ld-drawer-cat { font-size: 9px; letter-spacing: 0.12em; margin-bottom: 3px; }
        .ld-drawer-snip { font-size: 10px; color: rgba(255,255,255,0.3); margin-bottom: 3px; line-height: 1.5; }
        .ld-drawer-date { font-size: 9px; color: rgba(255,255,255,0.16); }
        .ld-drawer-clear {
          width: 100%; padding: 9px; border-radius: 8px; margin-top: 6px; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em;
          border: 1px solid rgba(239,68,68,0.22); color: rgba(239,68,68,0.55); background: transparent;
          transition: all 0.15s;
        }
        .ld-drawer-clear:hover { background: rgba(239,68,68,0.07); }

        /* MAIN */
        .ld-main {
          position: relative; z-index: 10;
          width: 100%; max-width: min(960px, 100vw);
          margin: 0 auto; padding: 0 clamp(16px, 5vw, 44px) 80px;
          opacity: 0; transform: translateY(18px);
          transition: opacity 0.65s ease 0.18s, transform 0.65s ease 0.18s;
        }
        .ld-main--in { opacity: 1; transform: translateY(0); }

        /* HERO */
        .ld-hero { padding: 68px 0 52px; text-align: center; }
        .ld-kicker {
          display: inline-flex; align-items: center; gap: 14px; margin-bottom: 30px;
          font-size: 9.5px; letter-spacing: 0.32em; color: rgba(0,255,200,0.48);
        }
        .ld-kicker-dash {
          display: inline-block; width: 28px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,255,200,0.4));
        }
        .ld-kicker-dash--r {
          background: linear-gradient(90deg, rgba(0,255,200,0.4), transparent);
        }

        .ld-h1 {
          font-family: 'Instrument Serif', serif; margin-bottom: 22px;
          line-height: 0.95; letter-spacing: -0.03em;
        }
        .ld-h1-dim {
          display: block; font-style: italic; font-size: clamp(40px, 8.5vw, 82px);
          color: rgba(255,255,255,0.55); margin-bottom: 4px;
        }
        .ld-h1-main {
          display: flex; align-items: baseline; justify-content: center; gap: 10px;
          font-size: clamp(44px, 9.5vw, 92px);
        }
        .ld-h1-stroke {
          -webkit-text-stroke: 1.5px #00ffc8; color: transparent;
        }
        .ld-h1-glow {
          color: #00ffc8;
          text-shadow: 0 0 40px rgba(0,255,200,0.4), 0 0 80px rgba(0,255,200,0.15);
        }

        .ld-hero-desc {
          max-width: 500px; margin: 0 auto 34px;
          font-size: 12.5px; line-height: 1.9; color: rgba(255,255,255,0.33);
          font-family: 'DM Mono', monospace;
        }

        .ld-stats-row {
          display: inline-flex; border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; overflow: hidden; background: rgba(255,255,255,0.02);
        }
        .ld-stat-item {
          padding: 14px 24px; border-right: 1px solid rgba(255,255,255,0.06); text-align: center;
        }
        .ld-stat-item:last-child { border-right: none; }
        .ld-stat-val {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 900;
          color: #00ffc8; line-height: 1; margin-bottom: 4px;
        }
        .ld-stat-lbl { font-size: 8.5px; letter-spacing: 0.15em; color: rgba(255,255,255,0.22); }

        /* ANALYZER */
        .ld-analyzer { margin-bottom: 80px; }

        /* Module strip */
        .ld-mod-strip {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 12px;
        }
        @media (max-width: 600px) { .ld-mod-strip { grid-template-columns: 1fr 1fr; } }

        .ld-mod-chip {
          padding: 12px 13px; border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.025);
          display: flex; align-items: flex-start; gap: 9px;
          transition: all 0.22s ease; position: relative; overflow: hidden;
        }
        .ld-mod-chip::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 20% 60%, var(--mg, transparent) 0%, transparent 70%);
          opacity: 0; transition: opacity 0.3s;
        }
        .ld-mod-chip--active {
          border-color: var(--mc);
          box-shadow: 0 0 16px color-mix(in srgb, var(--mc) 18%, transparent),
                      inset 0 0 20px color-mix(in srgb, var(--mc) 6%, transparent);
        }
        .ld-mod-chip--active::after { opacity: 1; }
        .ld-mod-chip--done { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.04); }

        .ld-chip-icon {
          width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 9.5px; font-weight: 700; letter-spacing: -0.03em;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: var(--mc); font-family: 'Syne', sans-serif;
          transition: all 0.2s; position: relative; z-index: 1;
        }
        .ld-mod-chip--active .ld-chip-icon {
          background: color-mix(in srgb, var(--mc) 15%, transparent);
          border-color: color-mix(in srgb, var(--mc) 45%, transparent);
        }
        .ld-chip-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
        .ld-chip-name { font-size: 10px; color: rgba(255,255,255,0.65); margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ld-chip-step { font-size: 9px; color: rgba(255,255,255,0.22); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ld-mod-chip--active .ld-chip-step { color: var(--mc); opacity: 0.8; }
        .ld-mod-chip--done .ld-chip-step { color: #22c55e; }
        .ld-chip-indicator { flex-shrink: 0; position: relative; z-index: 1; margin-top: 2px; }
        .ld-chip-check { color: #22c55e; font-size: 12px; }
        .ld-chip-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.1); display: block; }
        .ld-chip-spinner {
          width: 13px; height: 13px; display: block;
          border: 2px solid color-mix(in srgb, var(--mc) 30%, transparent);
          border-top-color: var(--mc); border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Input card */
        .ld-card {
          border-radius: 16px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: #080c10;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.6), 0 28px 72px rgba(0,0,0,0.5);
          transition: border-color 0.22s, box-shadow 0.22s;
        }
        .ld-card--drag {
          border-color: #00ffc8;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.6), 0 0 40px rgba(0,255,200,0.14), 0 28px 72px rgba(0,0,0,0.5);
        }
        .ld-card--focus {
          border-color: rgba(0,255,200,0.28);
          box-shadow: 0 0 0 3px rgba(0,255,200,0.07), 0 28px 72px rgba(0,0,0,0.5);
        }

        .ld-card-topbar {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 18px; border-bottom: 1px solid rgba(255,255,255,0.055);
          background: rgba(255,255,255,0.018);
        }
        .ld-card-dots { display: flex; gap: 6px; }
        .ld-card-dots span { width: 11px; height: 11px; border-radius: 50%; }
        .ld-card-file { flex: 1; font-size: 10px; color: rgba(255,255,255,0.16); letter-spacing: 0.12em; }
        .ld-card-chars { font-size: 10px; color: rgba(255,255,255,0.14); }

        .ld-ta {
          width: 100%; padding: 20px 20px 14px; background: transparent; resize: none;
          border: none; outline: none;
          font-family: 'DM Mono', monospace; font-size: 12.5px; line-height: 1.8;
          color: rgba(255,255,255,0.82); caret-color: #00ffc8;
        }
        .ld-ta::placeholder { color: rgba(255,255,255,0.12); }
        .ld-ta:disabled { opacity: 0.45; cursor: not-allowed; }

        .ld-progress-bar {
          height: 2px; background: rgba(255,255,255,0.04); margin: 0 18px 0;
        }
        .ld-progress-fill {
          height: 100%; background: linear-gradient(90deg, #00ffc8, #38bdf8);
          transition: width 0.3s ease; border-radius: 99px;
        }

        .ld-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 12px 18px; flex-wrap: wrap;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .ld-examples-row { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .ld-ex-label { font-size: 9px; color: rgba(255,255,255,0.18); letter-spacing: 0.1em; }
        .ld-ex-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: 0.03em;
          padding: 4px 10px; border-radius: 99px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.38); background: transparent;
          transition: all 0.15s;
        }
        .ld-ex-btn:hover {
          border-color: var(--ec);
          color: var(--ec);
          background: color-mix(in srgb, var(--ec) 8%, transparent);
        }
        .ld-ex-risk { font-size: 8px; font-weight: 700; letter-spacing: 0.08em; }

        .ld-go-btn {
          display: flex; align-items: center; gap: 9px; flex-shrink: 0;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 0.16em;
          padding: 11px 24px; border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #00ffc8, #22d3ee);
          color: #000; transition: all 0.18s ease;
          box-shadow: 0 4px 18px rgba(0,255,200,0.22), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .ld-go-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,255,200,0.3), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .ld-go-btn--loading {
          background: rgba(0,255,200,0.07) !important; color: #00ffc8 !important;
          border: 1px solid rgba(0,255,200,0.22) !important;
          box-shadow: none !important; transform: none !important;
        }
        .ld-go-spinner {
          width: 14px; height: 14px; border: 2px solid rgba(0,255,200,0.25);
          border-top-color: #00ffc8; border-radius: 50%; animation: spin 0.65s linear infinite;
        }

        /* FEATURES */
        .ld-features { margin-bottom: 72px; }
        .ld-section-label {
          text-align: center; font-size: 9px; letter-spacing: 0.3em;
          color: rgba(255,255,255,0.18); margin-bottom: 24px;
        }
        .ld-feat-grid {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
        }
        @media (max-width: 600px) { .ld-feat-grid { grid-template-columns: 1fr 1fr; } }

        .ld-feat {
          padding: 20px; border-radius: 13px;
          border: 1px solid rgba(255,255,255,0.055);
          background: rgba(255,255,255,0.018);
          transition: all 0.2s ease; cursor: default;
          animation: fadeup 0.5s ease both;
        }
        .ld-feat:hover {
          border-color: color-mix(in srgb, var(--fc) 28%, transparent);
          background: color-mix(in srgb, var(--fc) 4%, rgba(255,255,255,0.018));
          transform: translateY(-2px);
        }
        .ld-feat-icon { font-size: 20px; color: var(--fc); margin-bottom: 11px; display: block; }
        .ld-feat-title {
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
          color: rgba(255,255,255,0.82); margin-bottom: 7px;
        }
        .ld-feat-desc {
          font-size: 10.5px; color: rgba(255,255,255,0.26); line-height: 1.72;
        }
        @keyframes fadeup { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        /* HOW IT WORKS */
        .ld-how { margin-bottom: 72px; }
        .ld-how-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
          background: rgba(255,255,255,0.012);
        }
        @media (max-width: 680px) { .ld-how-grid { grid-template-columns: 1fr 1fr; } }

        .ld-step {
          padding: 24px 20px; border-right: 1px solid rgba(255,255,255,0.06);
          transition: background 0.2s;
        }
        .ld-step:last-child { border-right: none; }
        .ld-step:hover { background: rgba(0,255,200,0.025); }
        .ld-step-num {
          font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 900;
          color: rgba(0,255,200,0.1); line-height: 1; margin-bottom: 10px; letter-spacing: -0.03em;
        }
        .ld-step-title {
          font-family: 'Syne', sans-serif; font-size: 11.5px; font-weight: 700;
          color: rgba(255,255,255,0.72); margin-bottom: 7px;
        }
        .ld-step-desc { font-size: 10px; color: rgba(255,255,255,0.26); line-height: 1.65; }

        /* FOOTER */
        .ld-footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 28px 0; text-align: center;
        }
        .ld-footer-name {
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800;
          color: rgba(255,255,255,0.2); margin-bottom: 6px;
        }
        .ld-footer-copy { font-size: 9.5px; color: rgba(255,255,255,0.1); letter-spacing: 0.08em; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,200,0.14); border-radius: 4px; }
      `}</style>
    </div>
  );
}