import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiAward, FiTarget, FiZap, FiUser, FiBarChart2 } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

const Leaderboard = ({ batchId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!batchId) return;
    (async () => {
      try {
        const res = await axios.get(`${API}/api/leaderboard/${batchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data?.data || []);
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [batchId]);

  const rankColor = (rank) => {
    if (rank === 1) return { bg: "linear-gradient(135deg,#f59e0b 0%,#fbbf24 100%)", color: "#78350f", shadow: "0 10px 20px rgba(245,158,11,0.3)" };
    if (rank === 2) return { bg: "linear-gradient(135deg,#94a3b8 0%,#cbd5e1 100%)", color: "#1e293b", shadow: "0 10px 20px rgba(148,163,184,0.3)" };
    if (rank === 3) return { bg: "linear-gradient(135deg,#cd7c2f 0%,#d97706 100%)", color: "#fff", shadow: "0 10px 20px rgba(205,124,47,0.3)" };
    return { bg: "#f8fafc", color: "#64748b", shadow: "none" };
  };

  const rankEmoji = (r) => (r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`);

  if (loading) {
    return (
      <div className="lb-glass-card p-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="app-skeleton-shine" style={{ width: 40, height: 40, borderRadius: 12 }}></div>
          <div className="app-skeleton-shine" style={{ width: 140, height: 24, borderRadius: 8 }}></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div className="d-flex align-items-center gap-3 mb-4" key={i}>
            <div className="app-skeleton-shine" style={{ width: 44, height: 44, borderRadius: "50%" }}></div>
            <div className="flex-grow-1">
              <div className="app-skeleton-shine mb-2" style={{ width: "40%", height: 16 }}></div>
              <div className="app-skeleton-shine" style={{ width: "100%", height: 8 }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) return (
    <div className="lb-glass-card p-5 text-center">
      <div className="display-4 mb-3 opacity-20">🏆</div>
      <h5 className="fw-black mb-1">No performance data yet.</h5>
      <p className="text-muted small">Complete tests and quizzes to mark your place on the board.</p>
    </div>
  );

  return (
    <div className="lb-glass-card shadow-2xl">
      <style>{`
        .lb-glass-card { background: #fff; border-radius: 32px; border: 1px solid #f1f5f9; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05); }
        .lb-row { display: flex; align-items: center; gap: 18px; padding: 18px 0; border-bottom: 1px dashed #f1f5f9; position: relative; }
        .lb-row:last-child { border-bottom: none; }
        .lb-rank-badge { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; flex-shrink: 0; position: relative; z-index: 1; }
        .lb-avatar-frame { width: 42px; height: 42px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; border: 2px solid #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .lb-progress-container { flex-grow: 1; min-width: 0; }
        .lb-meter-bg { background: #f1f5f9; border-radius: 999px; height: 8px; overflow: hidden; position: relative; }
        .lb-meter-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6366f1, #a855f7); position: relative; }
        .lb-meter-fill::after { content: ""; position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: sweep 2s infinite; }
        @keyframes sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .lb-top-glow { position: absolute; inset: -4px; border-radius: 50%; filter: blur(8px); opacity: 0.5; }
      `}</style>
      
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-4 text-primary fs-4"><FiAward /></div>
          <h4 className="fw-black mb-0" style={{ letterSpacing: '-0.5px' }}>Top Performers</h4>
        </div>
        <div className="small fw-bold text-muted px-3 py-1 bg-light rounded-pill">BATCH METRICS</div>
      </div>

      <div className="lb-list">
        {data.map((entry, i) => {
          const pct = entry.totalScore?.toFixed(1) || "0.0";
          const bar = Math.min(100, parseFloat(pct));
          const rc = rankColor(entry.rank);
          
          return (
            <motion.div key={entry._id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="lb-row">
              <div className="position-relative">
                {entry.rank <= 3 && <div className="lb-top-glow" style={{ background: rc.bg }} />}
                <div className="lb-rank-badge shadow-lg" style={{ background: rc.bg, color: rc.color, boxShadow: rc.shadow }}>
                  {rankEmoji(entry.rank)}
                </div>
              </div>
              
              <div className="lb-avatar-frame text-primary fw-bold">
                 {entry.student?.name?.[0]?.toUpperCase() || <FiUser />}
              </div>
              
              <div className="lb-progress-container">
                <div className="d-flex justify-content-between align-items-end mb-2">
                   <div>
                     <div className="fw-black text-dark" style={{ fontSize: '0.95rem', lineHeight: 1 }}>{entry.student?.name || "Anonymous Student"}</div>
                     <div className="d-flex gap-3 mt-1" style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>
                        <span className="d-flex align-items-center gap-1"><FiZap className="text-warning"/> {entry.quizScore?.toFixed(0)}%</span>
                        <span className="d-flex align-items-center gap-1"><FiTarget className="text-primary"/> {entry.testScore?.toFixed(0)}%</span>
                        <span className="d-flex align-items-center gap-1"><FiBarChart2 className="text-success"/> {entry.attendanceScore?.toFixed(0)}%</span>
                     </div>
                   </div>
                   <div className="text-end">
                      <div className="fw-black text-primary" style={{ fontSize: '1.1rem' }}>{pct}%</div>
                   </div>
                </div>
                <div className="lb-meter-bg">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${bar}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="lb-meter-fill" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-top border-light d-flex align-items-center justify-content-between">
         <div className="small text-muted fw-semibold">Weights: Quizzes (50%) | Tests (30%) | Attendance (20%)</div>
         <div className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>LIVE RANKINGS</div>
      </div>
    </div>
  );
};

export default Leaderboard;
