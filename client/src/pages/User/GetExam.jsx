import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import { FiClock, FiCheckCircle, FiAlertCircle, FiSend, FiX, FiChevronLeft, FiChevronRight, FiFlag, FiBookmark, FiFileText, FiAward, FiTarget, FiZap, FiShield } from "react-icons/fi";

const GetExam = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [currIdx, setCurrIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [stage, setStage] = useState("instruct"); // instruct | exam | result
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/exams/exam/${examId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { exam: examData, questions: questionData } = res.data;
        setExam(examData);
        setQuestions(questionData || []);
        setTimeLeft(parseInt(examData.duration, 10) * 60);
      } catch (err) {
        showToast("Error loading exam environment", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted || stage !== "exam") return;
    const timer = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timer); handleSubmit(true); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted, stage]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleAnswer = (qid, opt) => {
    setAnswers(p => ({ ...p, [qid]: opt }));
  };

  const toggleFlag = (idx) => {
    setFlagged(p => ({ ...p, [idx]: !p[idx] }));
  };

  const handleSubmit = async (auto = false) => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/exams/submit-exam`, {
        examId, answers, email
      }, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data);
      setSubmitted(true);
      setStage("result");
    } catch (err) {
      showToast("Transmission failed. Retrying...", "error");
    } finally { setSubmitting(false); }
  };

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return (Object.keys(answers).length / questions.length) * 100;
  }, [answers, questions]);

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <div style={{ width: "50px", height: "50px", border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      {/* HEADER */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{ padding: "8px", background: "#6366f1", borderRadius: "12px", color: "#fff" }}><FiFileText /></div>
          <div>
            <h5 className="fw-black mb-0">{exam.title}</h5>
            <div style={{ fontSize: "0.65rem", letterSpacing: "1px", fontWeight: "700", color: "#9ca3af" }}>{stage.toUpperCase()} ENVIRONMENT</div>
          </div>
        </div>
        
        {stage === "exam" && (
          <div className="d-flex align-items-center gap-4">
            <div style={{ width: 200 }} className="d-none d-md-block">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: "0.85rem", fontWeight: "700", opacity: 0.7 }}>COMPLETION</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "900" }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ background: "#e2e8f0", height: "6px", borderRadius: "50px", overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "#6366f1", borderRadius: "50px", transition: "width 0.3s" }} />
              </div>
            </div>
            <div style={{ background: "#fef2f2", color: "#ef4444", padding: "10px 20px", borderRadius: "50px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #fee2e2" }}>
              <FiClock /> <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        )}
      </div>

      {/* STAGE: INSTRUCTIONS */}
      {stage === "instruct" && (
        <div style={{ minHeight: "calc(100vh - 150px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div style={{ width: "100%", maxWidth: "800px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "32px", padding: "48px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <div style={{ fontSize: "4rem", marginBottom: "24px" }}>🛡️</div>
              <h2 className="fw-black mb-3" style={{ fontSize: "2.5rem" }}>Examination Protocol</h2>
              <p style={{ color: "#9ca3af", fontSize: "1.1rem" }}>Please review the following rules before initiating the assessment.</p>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="d-flex gap-3">
                  <div style={{ padding: "12px", background: "#f3f4f6", borderRadius: "16px", color: "#6366f1" }}><FiClock size={24} /></div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.25rem" }}>{exam.duration} Mins</div>
                    <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Time Limit</div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex gap-3">
                  <div style={{ padding: "12px", background: "#f3f4f6", borderRadius: "16px", color: "#10b981" }}><FiAward size={24} /></div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.25rem" }}>{exam.totalMarks} Marks</div>
                    <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Maximum Score</div>
                  </div>
                </div>
              </div>
            </div>

            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "12px", marginBottom: "40px", fontWeight: "600", color: "#6b7280" }}>
              <li className="d-flex align-items-center gap-2"><FiCheckCircle style={{ color: "#10b981" }} /> Ensure a stable internet connection.</li>
              <li className="d-flex align-items-center gap-2"><FiCheckCircle style={{ color: "#10b981" }} /> Do not refresh or exit the fullscreen mode.</li>
              <li className="d-flex align-items-center gap-2"><FiCheckCircle style={{ color: "#10b981" }} /> System detects tab switching; results may be voided.</li>
            </ul>

            <button className="btn w-100 fw-black" style={{ fontSize: "1.25rem", padding: "16px 24px", background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", borderRadius: "20px", border: "none" }} onClick={() => setStage("exam")}>
              Initiate Protocol & Start Exam
            </button>
          </div>
        </div>
      )}

      {/* STAGE: EXAM */}
      {stage === "exam" && (
        <div className="d-flex">
          {/* Main Content */}
          <main style={{ flex: 1, padding: "60px", maxHeight: "calc(100vh - 72px)", overflowY: "auto" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span style={{ background: "#eef2ff", color: "#6366f1", padding: "8px 16px", borderRadius: "50px", fontWeight: "700", fontSize: "0.9rem" }}>QUESTION {currIdx + 1} OF {questions.length}</span>
                <button style={{ border: "none", background: "transparent", color: "#f59e0b", padding: 0, fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", cursor: "pointer" }} onClick={() => toggleFlag(currIdx)}>
                  {flagged[currIdx] ? <><FiBookmark /> Marked</> : <><FiFlag /> Mark for Review</>}
                </button>
              </div>

              <h3 className="fw-black lh-base" style={{ fontSize: "1.75rem", marginBottom: "40px" }}>{questions[currIdx].question}</h3>

              <div>
                {['optionA', 'optionB', 'optionC', 'optionD'].map((key, i) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      padding: "24px",
                      borderRadius: "20px",
                      border: answers[questions[currIdx]._id] === questions[currIdx][key] ? "2px solid #6366f1" : "2px solid #f1f5f9",
                      background: answers[questions[currIdx]._id] === questions[currIdx][key] ? "#eef2ff" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      marginBottom: "16px"
                    }}
                    onClick={() => handleAnswer(questions[currIdx]._id, questions[currIdx][key])}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: answers[questions[currIdx]._id] === questions[currIdx][key] ? "#6366f1" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: answers[questions[currIdx]._id] === questions[currIdx][key] ? "#fff" : "#64748b", fontSize: "0.75rem" }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="fw-bold" style={{ fontSize: "1.05rem" }}>{questions[currIdx][key]}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mt-5 pt-4" style={{ borderTop: "1px solid #e2e8f0" }}>
                <button
                  className="app-btn-soft"
                  disabled={currIdx === 0}
                  style={{ borderRadius: "20px", padding: "12px 24px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  onClick={() => setCurrIdx(currIdx - 1)}
                >
                  <FiChevronLeft /> Previous
                </button>
                {currIdx < questions.length - 1 ? (
                  <button
                    className="app-btn-primary"
                    style={{ borderRadius: "20px", padding: "12px 24px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                    onClick={() => setCurrIdx(currIdx + 1)}
                  >
                    Next Question <FiChevronRight />
                  </button>
                ) : (
                  <button
                    style={{ borderRadius: "20px", padding: "12px 24px", background: "#10b981", color: "#fff", border: "none", fontWeight: "900", display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                    onClick={() => { if (window.confirm('Ready to submit your assessment?')) handleSubmit(); }}
                  >
                    Final Submission <FiSend />
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside style={{ width: "340px", background: "#fff", height: "calc(100vh - 72px)", position: "sticky", top: "72px", borderLeft: "1px solid #e2e8f0", padding: "30px", display: "flex", flexDirection: "column", boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}>
            <h6 className="fw-black mb-4 d-flex align-items-center gap-2" style={{ fontSize: "1rem" }}><FiTarget /> Question Map</h6>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "24px" }}>
              {questions.map((q, i) => (
                <div
                  key={q._id}
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    fontSize: "0.85rem",
                    border: currIdx === i ? "2px solid #6366f1" : "2px solid transparent",
                    background: currIdx === i ? "#eef2ff" : answers[q._id] ? "#10b981" : flagged[i] ? "#f59e0b" : "#f1f5f9",
                    color: currIdx === i ? "#6366f1" : answers[q._id] ? "#fff" : flagged[i] ? "#fff" : "#94a3b8"
                  }}
                  onClick={() => setCurrIdx(i)}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "auto", padding: "16px", background: "#f3f4f6", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: "1rem", fontWeight: "700" }}>
                <span>Answered</span>
                <span style={{ color: "#10b981" }}>{Object.keys(answers).length}</span>
              </div>
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: "1rem", fontWeight: "700" }}>
                <span>Flagged</span>
                <span style={{ color: "#f59e0b" }}>{Object.keys(flagged).filter(v => v).length}</span>
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: "1rem", fontWeight: "700" }}>
                <span>Unvisited</span>
                <span style={{ color: "#9ca3af" }}>{questions.length - Object.keys(answers).length}</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* STAGE: RESULT */}
      {stage === "result" && result && (
        <div style={{ padding: "40px 20px", minHeight: "calc(100vh - 72px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: "1000px", background: "#fff", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            {/* Result Header */}
            <div style={{ padding: "40px 48px", textAlign: "center", color: "#fff", background: result.passed ? "#10b981" : "#ef4444" }}>
              <div style={{ fontSize: "5rem", marginBottom: "24px" }}>{result.passed ? '🎉' : '📉'}</div>
              <h1 className="fw-black" style={{ fontSize: "3rem", marginBottom: "16px" }}>{result.passed ? 'EXAM PASSED!' : 'EXAM FAILED'}</h1>
              <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>{result.passed ? 'Incredible work! You have qualified the examination protocol.' : 'Do not despair. Persistence is the key to mastery.'}</p>
            </div>

            {/* Score Cards */}
            <div style={{ padding: "48px", borderBottom: "1px solid #e2e8f0" }}>
              <div className="row g-4 mb-0">
                {[
                  { l: 'OFFICIAL SCORE', v: `${result.score} / ${result.totalMarks}`, ic: <FiTarget />, c: '#6366f1' },
                  { l: 'ACCURACY RATE', v: `${Math.round((result.score / result.totalMarks) * 100)}%`, ic: <FiZap />, c: '#f59e0b' },
                  { l: 'PROTOCOL STATUS', v: result.passed ? 'QUALIFIED' : 'NOT QUALIFIED', ic: <FiShield />, c: '#10b981' }
                ].map(s => (
                  <div key={s.l} className="col-md-4">
                    <div style={{ padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#f9fafb", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "12px", color: s.c }}>{s.ic}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#9ca3af", marginBottom: "8px" }}>{s.l}</div>
                      <div className="fw-black" style={{ fontSize: "1.5rem" }}>{s.v}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Analysis */}
            <div style={{ padding: "48px" }}>
              <h5 className="fw-black mb-4">Detailed Performance Analysis</h5>
              {result.results.map((res, i) => (
                <div key={i} style={{ padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#fff", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#9ca3af" }}>QUESTION {i + 1}</span>
                      <span style={{ background: res.isCorrect ? "#d1fae5" : "#fee2e2", color: res.isCorrect ? "#065f46" : "#991b1b", padding: "4px 12px", borderRadius: "50px", fontSize: "0.6rem", fontWeight: "700" }}>
                        {res.isCorrect ? 'CORRECT' : 'INCORRECT'}
                      </span>
                    </div>
                    <div className="fw-bold mb-3">{res.question}</div>
                    <div style={{ fontSize: "0.9rem", display: "flex", gap: "32px" }}>
                      <span style={{ color: "#6b7280", fontWeight: "700" }}>
                        Selection: <span style={{ color: "#0f172a" }}>{res.selectedAnswer || 'N/A'}</span>
                      </span>
                      <span style={{ color: "#059669", fontWeight: "700" }}>
                        Solution: <span style={{ color: "#0f172a" }}>{res.correctAnswer}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Return Button */}
            <div style={{ padding: "24px 48px", textAlign: "center", borderTop: "1px solid #e2e8f0" }}>
              <button
                style={{ background: "#6366f1", color: "#fff", border: "none", padding: "12px 32px", borderRadius: "50px", fontWeight: "900", fontSize: "1rem", cursor: "pointer" }}
                onClick={() => navigate('/UserDash')}
              >
                Return to Dashboard Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetExam;
