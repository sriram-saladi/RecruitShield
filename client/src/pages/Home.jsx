import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

function useTilt() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      el.style.transform = `
        rotateX(${y * -8}deg)
        rotateY(${x * 8}deg)
        scale(1.03)
      `;
    };

    const reset = () => {
      el.style.transform = "rotateX(0) rotateY(0) scale(1)";
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);

    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  return ref;
}

function Home() {
  const navigate = useNavigate();
  const tilt1 = useTilt();
  const tilt2 = useTilt();

  return (
    <div className="home-root">
      <div className="home-bg" />
      <div className="orb orb1" />
      <div className="orb orb2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="home-content"
      >
        <motion.div
          className="shield-logo"
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          🛡️
        </motion.div>

        <h1 className="home-title">RecruitShield</h1>

        <p className="home-sub">
          Choose how you want to validate your recruitment opportunity
        </p>

        <div className="home-grid">
          <div
            ref={tilt1}
            onClick={() => navigate("/verify")}
            className="home-card"
          >
            <div className="card-icon">🏛️</div>
            <h2>Verify from T&P Cell</h2>
            <p>
              Cross-check the opportunity with official Training & Placement
              records and approved campus listings.
            </p>
          </div>

          <div
            ref={tilt2}
            onClick={() => navigate("/scan")}
            className="home-card primary"
          >
            <div className="card-icon">🛡️</div>
            <h2>Check Risk Score</h2>
            <p>
              Analyze job offers using AI fraud detection and get an instant
              risk score with detailed report.
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        .home-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #050709;
          color: #dde1ea;
          font-family: 'Inter', sans-serif;
        }

        .home-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg,#050709,#08131a,#050709);
          background-size: 200% 200%;
          animation: gradientMove 12s ease infinite;
          z-index: 0;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .orb {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.12;
          z-index: 0;
        }

        .orb1 {
          background: #00ffc8;
          top: -120px;
          left: -120px;
          animation: float1 10s ease-in-out infinite alternate;
        }

        .orb2 {
          background: #38bdf8;
          bottom: -120px;
          right: -120px;
          animation: float2 12s ease-in-out infinite alternate;
        }

        @keyframes float1 {
          from { transform: translate(0,0); }
          to { transform: translate(80px,60px); }
        }

        @keyframes float2 {
          from { transform: translate(0,0); }
          to { transform: translate(-60px,-80px); }
        }

        .home-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 1000px;
          padding: 0 24px;
        }

        .shield-logo {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .home-title {
          font-size: clamp(42px, 6vw, 64px);
          font-weight: 700;
          margin-bottom: 18px;
          background: linear-gradient(135deg, #00ffc8, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .home-sub {
          color: rgba(255,255,255,0.55);
          margin-bottom: 60px;
          font-size: 18px;
        }

        .home-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px,1fr));
          gap: 30px;
        }

        .home-card {
          padding: 40px;
          border-radius: 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .home-card:hover {
          border-color: rgba(0,255,200,0.4);
          box-shadow: 0 0 40px rgba(0,255,200,0.18);
        }

        .home-card.primary {
          border-color: rgba(0,255,200,0.3);
        }

        .home-card.primary:hover {
          box-shadow: 0 0 60px rgba(0,255,200,0.28);
        }

        .card-icon {
          font-size: 36px;
          margin-bottom: 20px;
        }

        .home-card h2 {
          font-size: 22px;
          margin-bottom: 12px;
        }

        .home-card p {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default Home;