import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiSend,
  FiX,
} from "react-icons/fi";

const GetExam = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://computer-excellance-academy.onrender.com/api/exams/exam/${examId}`);
        const { exam: examData, questions: questionData } = res.data;

        setExam(examData);
        setQuestions(questionData || []);
        setTimeLeft(parseInt(examData.duration, 10) * 60);
      } catch (err) {
        showToast(err.response?.data?.error || "Failed to load exam", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted || !testStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, testStarted]);

  const formatTime = (seconds) => {
    if (seconds === null) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    if (!testStarted) setTestStarted(true);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitted || submitting) return;

    try {
      setSubmitting(true);

      const res = await axios.post("https://computer-excellance-academy.onrender.com/api/exams/submit-exam", {
        examId,
        answers,
        email,
      });

      setResult(res.data);
      setSubmitted(true);
      showToast(autoSubmit ? "Time is up. Exam submitted automatically." : "Exam submitted successfully");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to submit exam", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const goToProfile = () => {
    navigate("/userdash/profile");
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="ge-page">
          <div className="container py-4">
            <div className="ge-panel p-5 text-center">Loading exam...</div>
          </div>
        </div>
      </>
    );
  }

  if (!exam || !questions.length) {
    return (
      <>
        <style>{styles}</style>
        <div className="ge-page">
          <div className="container py-4">
            <div className="ge-panel p-5 text-center text-muted">No exam data found.</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="ge-page">
        <div className="container py-4">
          {toast.show && (
            <div className={`ge-toast ${toast.type === "error" ? "error" : "success"}`}>
              <div className="ge-toast-content">
                {toast.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                className="ge-toast-close"
                onClick={() => setToast({ show: false, message: "", type: "success" })}
              >
                <FiX />
              </button>
            </div>
          )}

          {!submitted && (
            <div className="ge-timer-bar">
              <div className="ge-timer-left">
                <FiClock />
                <span>Time Left</span>
              </div>
              <strong className={timeLeft <= 60 ? "danger" : ""}>{formatTime(timeLeft)}</strong>
            </div>
          )}

          <div className="ge-hero mb-4">
            <div className="row g-4 align-items-center">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">{exam.title}</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Read each question carefully and submit before the timer ends.
                </p>
              </div>

              <div className="col-lg-4">
                <div className="ge-hero-stat">
                  <div className="ge-stat-line">
                    <span>Duration</span>
                    <strong>{exam.duration} mins</strong>
                  </div>
                  <div className="ge-stat-line">
                    <span>Total Marks</span>
                    <strong>{exam.totalMarks}</strong>
                  </div>
                  <div className="ge-stat-line">
                    <span>Passing Marks</span>
                    <strong>{exam.passingMarks}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {submitted && result ? (
            <div className="ge-panel p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Exam Result</h4>
                  <p className="text-muted mb-0">Your submission has been recorded successfully.</p>
                </div>

                <span className={`ge-result-badge ${result.passed ? "pass" : "fail"}`}>
                  {result.passed ? "Passed" : "Failed"}
                </span>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="ge-stat-card">
                    <div className="text-muted mb-2">Score</div>
                    <h4 className="fw-bold mb-0">
                      {result.score} / {result.totalMarks}
                    </h4>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="ge-stat-card">
                    <div className="text-muted mb-2">Status</div>
                    <h4 className="fw-bold mb-0">{result.passed ? "Qualified" : "Not Qualified"}</h4>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="ge-stat-card">
                    <div className="text-muted mb-2">Questions</div>
                    <h4 className="fw-bold mb-0">{result.results?.length || 0}</h4>
                  </div>
                </div>
              </div>

              <h5 className="fw-bold mb-3">Answer Details</h5>

              <div className="row g-3">
                {result.results.map((res, index) => (
                  <div className="col-12" key={index}>
                    <div className="ge-result-card">
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                        <strong>Q{index + 1}</strong>
                        <span className={`ge-mini-badge ${res.isCorrect ? "correct" : "incorrect"}`}>
                          {res.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>

                      <div className="fw-semibold mb-2">{res.question}</div>
                      <div className="text-primary small mb-1">
                        Your Answer: {res.selectedAnswer || "Not answered"}
                      </div>
                      <div className="text-success small">
                        Correct Answer: {res.correctAnswer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <button type="button" className="ge-btn-primary" onClick={goToProfile}>
                  Go To Profile
                </button>
              </div>
            </div>
          ) : (
            <>
              {!testStarted && (
                <div className="ge-warning mb-4">
                  <FiAlertCircle />
                  <span>Please start the test by selecting an answer.</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(false);
                }}
              >
                <div className="row g-3">
                  {questions.map((q, index) => (
                    <div key={q._id} className="col-12">
                      <div className="ge-question-card">
                        <div className="ge-question-top">
                          <span className="ge-question-number">Q{index + 1}</span>
                          <FiFileText />
                        </div>

                        <h5 className="ge-question-text">{q.question}</h5>

                        <div className="row g-3">
                          {[q.optionA, q.optionB, q.optionC, q.optionD].map((opt, i) => (
                            <div className="col-md-6" key={i}>
                              <label
                                htmlFor={`opt-${q._id}-${i}`}
                                className={`ge-option ${
                                  answers[q._id] === opt ? "selected" : ""
                                }`}
                              >
                                <input
                                  type="radio"
                                  id={`opt-${q._id}-${i}`}
                                  name={`question-${q._id}`}
                                  value={opt}
                                  checked={answers[q._id] === opt}
                                  onChange={() => handleAnswerChange(q._id, opt)}
                                  disabled={submitted}
                                />
                                <span>{opt}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-4">
                  <button type="submit" className="ge-btn-primary ge-submit-btn" disabled={submitted || submitting}>
                    <FiSend className="me-2" />
                    {submitting ? "Submitting..." : "Submit Exam"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const styles = `
  .ge-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  }

  .ge-timer-bar {
    position: sticky;
    top: 16px;
    z-index: 50;
    margin-bottom: 16px;
    padding: 14px 18px;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ge-timer-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #334155;
    font-weight: 600;
  }

  .ge-timer-bar strong {
    color: #1d4ed8;
    font-size: 18px;
  }

  .ge-timer-bar strong.danger {
    color: #dc2626;
  }

  .ge-hero {
    padding: 32px;
    border-radius: 28px;
    color: #fff;
    background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
    box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
  }

  .ge-hero-stat {
    padding: 18px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(8px);
  }

  .ge-stat-line {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
  }

  .ge-panel,
  .ge-question-card,
  .ge-result-card,
  .ge-stat-card {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    border: 0;
  }

  .ge-stat-card {
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    height: 100%;
  }

  .ge-warning {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
  }

  .ge-question-card {
    padding: 24px;
  }

  .ge-question-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #64748b;
    margin-bottom: 12px;
  }

  .ge-question-number {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 999px;
    background: #dbeafe;
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 700;
  }

  .ge-question-text {
    margin-bottom: 18px;
    color: #0f172a;
    font-weight: 700;
  }

  .ge-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid #dbe3f0;
    border-radius: 16px;
    cursor: pointer;
    transition: 0.2s ease;
    background: #fff;
  }

  .ge-option:hover {
    border-color: #93c5fd;
    background: #f8fbff;
  }

  .ge-option.selected {
    border-color: #2563eb;
    background: #eff6ff;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
  }

  .ge-option input {
    margin: 0;
  }

  .ge-btn-primary {
    border: none;
    color: #fff;
    font-weight: 600;
    border-radius: 14px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
  }

  .ge-submit-btn {
    min-width: 220px;
  }

  .ge-result-badge,
  .ge-mini-badge {
    display: inline-block;
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
  }

  .ge-result-badge.pass,
  .ge-mini-badge.correct {
    background: #dcfce7;
    color: #166534;
  }

  .ge-result-badge.fail,
  .ge-mini-badge.incorrect {
    background: #fee2e2;
    color: #991b1b;
  }

  .ge-result-card {
    padding: 18px;
    border-radius: 18px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  }

  .ge-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 280px;
    color: #fff;
    padding: 14px 16px;
    border-radius: 16px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .ge-toast.success {
    background: linear-gradient(135deg, #2563eb, #4f46e5);
  }

  .ge-toast.error {
    background: linear-gradient(135deg, #dc2626, #ef4444);
  }

  .ge-toast-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ge-toast-close {
    border: none;
    background: transparent;
    color: #fff;
    font-size: 16px;
  }

  @media (max-width: 767px) {
    .ge-hero {
      padding: 24px;
    }

    .ge-question-card {
      padding: 18px;
    }
  }
`;

export default GetExam;
