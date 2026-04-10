import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiCpu, FiEdit3, FiPlus, FiSearch, FiUploadCloud, FiX, FiTrash2 } from "react-icons/fi";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const initialForm = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  subject: "",
};

const initialImportForm = {
  subject: "",
  questionLimit: 10,
  file: null,
};

const initialTopicForm = {
  subject: "",
  topic: "",
  questionLimit: 8,
  difficulty: "medium",
};

const QuestionBank = () => {
  const [formData, setFormData] = useState(initialForm);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [importForm, setImportForm] = useState(initialImportForm);
  const [topicForm, setTopicForm] = useState(initialTopicForm);
  const [generatingTopic, setGeneratingTopic] = useState(false);

  const isEditing = Boolean(editingId);
  const token = localStorage.getItem("adminToken");
  const authConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2600);
  };

  const fetchData = async () => {
    try {
      setFetching(true);
      const [questionRes, subjectRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/question`, authConfig),
        axios.get(`${import.meta.env.VITE_API_URL}/api/subject`),
      ]);
      setQuestions(questionRes?.data?.data || []);
      setSubjects(subjectRes?.data?.data || []);
    } catch (error) {
      showToast("Failed to load question bank", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredQuestions = useMemo(() => {
    const keyword = search.toLowerCase();
    return questions.filter((question) => {
      return (
        question.question?.toLowerCase().includes(keyword) ||
        question.subject?.subjectname?.toLowerCase().includes(keyword) ||
        question.sourceType?.toLowerCase().includes(keyword)
      );
    });
  }, [questions, search]);

  const aiImportedCount = useMemo(
    () => questions.filter((question) => question.sourceType?.includes("ai")).length,
    [questions]
  );

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = { ...formData, correctAnswer: formData.correctAnswer.toUpperCase() };
      if (isEditing) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/question/${editingId}`, payload, authConfig);
        showToast("Question updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/question`, payload, authConfig);
        showToast("Question added successfully");
      }
      closeModal();
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to save question", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleImportSubmit = async (event) => {
    event.preventDefault();
    if (!importForm.subject || !importForm.file) {
      showToast("Select subject and PDF first", "error");
      return;
    }
    try {
      setImporting(true);
      const payload = new FormData();
      payload.append("subject", importForm.subject);
      payload.append("questionLimit", String(importForm.questionLimit || 10));
      payload.append("pdf", importForm.file);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/question/extract-pdf`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setImportForm(initialImportForm);
      const input = document.getElementById("question-pdf-upload");
      if (input) input.value = "";
      showToast(response?.data?.message || "Questions imported successfully");
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "PDF import failed", "error");
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/question/${id}`, authConfig);
      showToast("Question deleted successfully");
      fetchData();
    } catch (error) { showToast("Delete failed", "error"); }
  };

  const handleTopicGenerate = async (event) => {
    event.preventDefault();
    if (!topicForm.subject || !topicForm.topic.trim()) {
      showToast("Select subject and enter topic first", "error");
      return;
    }
    try {
      setGeneratingTopic(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/question/generate-topic`, topicForm, authConfig);
      setTopicForm(initialTopicForm);
      showToast(response?.data?.message || "Questions generated successfully");
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || "Topic generation failed", "error");
    } finally {
      setGeneratingTopic(false);
    }
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Question Bank Intelligence</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Centralized repository for all academic questions. Use manual entry or AI-powered extraction tools.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button type="button" onClick={() => { setFormData(initialForm); setEditingId(null); setModalOpen(true); }} className="app-btn-primary">
                <FiPlus className="me-2" /> Add Question
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {fetching ? (
            <SkeletonStats count={3} />
          ) : (
            <>
              <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">Total Bank Size</div><h4 className="fw-bold mb-0">{questions.length}</h4></div></div>
              <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">AI Generated</div><h4 className="fw-bold mb-0">{aiImportedCount}</h4></div></div>
              <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">Subject Coverage</div><h4 className="fw-bold mb-0">{subjects.length}</h4></div></div>
            </>
          )}
        </div>

        <div style={{ borderRadius: 16, background: "linear-gradient(135deg, #0f172a, #1d4ed8, #22c55e)", color: '#fff', padding: 40, marginBottom: 32, boxShadow: "0 18px 42px rgba(15,23,42,0.16)" }}>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3" style={{ background: "rgba(255,255,255,0.15)" }}><FiCpu /><span className="small fw-bold">Gemini AI Studio</span></div>
              <h3 className="fw-bold mb-3">Rapid content extraction & generation</h3>
              <p style={{ opacity: 0.75 }}>Upload your curriculum PDF or specify a topic to instantly populate your question bank with high-quality MCQs.</p>
            </div>
            <div className="col-lg-4">
              <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 16, padding: 24, transition: "0.3s" }}>
                <h6 className="fw-bold mb-3"><FiUploadCloud className="me-2" style={{ display: 'inline' }} />PDF Extraction</h6>
                <form onSubmit={handleImportSubmit}>
                  <div className="app-input-wrap mb-2">
                    <select className="form-select app-input" value={importForm.subject} onChange={(e) => setImportForm(p => ({ ...p, subject: e.target.value }))}><option value="">Select Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.subjectname}</option>)}</select>
                  </div>
                  <div className="app-input-wrap mb-2">
                    <input type="number" className="form-control app-input" placeholder="Max Questions" value={importForm.questionLimit} onChange={(e) => setImportForm(p => ({ ...p, questionLimit: e.target.value }))} />
                  </div>
                  <div className="app-input-wrap mb-3">
                    <input type="file" id="question-pdf-upload" accept="application/pdf" className="form-control app-input" onChange={(e) => setImportForm(p => ({ ...p, file: e.target.files?.[0] || null }))} />
                  </div>
                  <button type="submit" className="app-btn-primary w-100" disabled={importing}>{importing ? "Processing..." : "Import PDF"}</button>
                </form>
              </div>
            </div>
            <div className="col-lg-4">
              <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.2)", borderRadius: 16, padding: 24, transition: "0.3s" }}>
                <h6 className="fw-bold mb-3"><FiCpu className="me-2" style={{ display: 'inline' }} />Topic Generator</h6>
                <form onSubmit={handleTopicGenerate}>
                  <div className="app-input-wrap mb-2">
                    <select className="form-select app-input" value={topicForm.subject} onChange={(e) => setTopicForm(p => ({ ...p, subject: e.target.value }))}><option value="">Select Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.subjectname}</option>)}</select>
                  </div>
                  <div className="app-input-wrap mb-2">
                    <input className="form-control app-input" placeholder="Enter topic (e.g. Loops in C)" value={topicForm.topic} onChange={(e) => setTopicForm(p => ({ ...p, topic: e.target.value }))} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6"><div className="app-input-wrap"><input type="number" className="form-control app-input" value={topicForm.questionLimit} onChange={(e) => setTopicForm(p => ({ ...p, questionLimit: e.target.value }))} /></div></div>
                    <div className="col-6"><div className="app-input-wrap"><select className="form-select app-input" value={topicForm.difficulty} onChange={(e) => setTopicForm(p => ({ ...p, difficulty: e.target.value }))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div></div>
                  </div>
                  <button type="submit" className="app-btn-primary w-100" disabled={generatingTopic}>{generatingTopic ? "Generating..." : "Generate MCQs"}</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div><h4 className="fw-bold mb-1">Question Inventory</h4><p className="text-muted small">Search and manage your academic content effectively.</p></div>
              <div className="app-search" style={{ minWidth: 320 }}>
                <FiSearch className="app-search__icon" />
                <input type="text" className="form-control app-input" placeholder="Filter by question, subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="table-responsive d-none d-md-block">
              <table className="table align-middle">
                <thead><tr style={{ color: "#475569" }}><th>#</th><th>QUESTION</th><th>SUBJECT</th><th>SOURCE</th><th className="text-end">ACTION</th></tr></thead>
                <tbody>
                  {fetching ? (
                    <tr><td colSpan="5" className="p-0 border-0"><SkeletonTable rows={5} cols={5} /></td></tr>
                  ) : filteredQuestions.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No questions found matching your search.</td></tr>
                  ) : (
                    filteredQuestions.map((q, i) => (
                      <tr key={q._id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td className="fw-bold text-muted small">{i + 1}</td>
                        <td style={{ minWidth: 280 }}>
                          <div className="fw-bold text-dark mb-1">{q.question}</div>
                          <div className="d-flex flex-wrap gap-2 small text-muted"><span className={q.correctAnswer === 'A' ? 'text-primary fw-bold' : ''}>A: {q.optionA}</span><span className={q.correctAnswer === 'B' ? 'text-primary fw-bold' : ''}>B: {q.optionB}</span></div>
                        </td>
                        <td className="fw-bold text-muted">{q.subject?.subjectname || "General"}</td>
                        <td><span className="app-badge" style={{ background: q.sourceType?.includes('ai') ? '#fee2e2' : '#dbeafe', color: q.sourceType?.includes('ai') ? '#991b1b' : '#1e40af' }}>{q.sourceType || 'Manual'}</span></td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button className="app-btn-edit" onClick={() => { setFormData({ question: q.question, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctAnswer: q.correctAnswer, subject: q.subject?._id }); setEditingId(q._id); setModalOpen(true); }}><FiEdit3 /></button>
                            <button className="app-btn-delete" onClick={() => handleDelete(q._id)}><FiTrash2 /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-block d-md-none">
              {fetching ? (
                <div className="text-center py-4">Loading questions...</div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-4 text-muted">No questions found.</div>
              ) : (
                <div className="row g-3">
                  {filteredQuestions.map((q, i) => (
                    <div className="col-12" key={q._id || i}>
                      <div className="app-mobile-card">
                        <strong>#{i + 1} - {q.question.substring(0, 40)}...</strong>
                        <div className="text-muted small mt-1">{q.subject?.subjectname || "General"}</div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span className="app-badge" style={{ background: q.sourceType?.includes('ai') ? '#fee2e2' : '#dbeafe', color: q.sourceType?.includes('ai') ? '#991b1b' : '#1e40af' }}>{q.sourceType || 'Manual'}</span>
                          <div className="d-flex gap-2">
                            <button className="app-btn-edit" onClick={() => { setFormData({ question: q.question, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctAnswer: q.correctAnswer, subject: q.subject?._id }); setEditingId(q._id); setModalOpen(true); }}><FiEdit3 /></button>
                            <button className="app-btn-delete" onClick={() => handleDelete(q._id)}><FiTrash2 /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: 'blur(8px)', display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998, padding: 20 }}>
          <div className="app-panel" style={{ width: "100%", maxWidth: 800, padding: 0, overflow: "hidden" }}>
            <div className="d-flex justify-content-between align-items-center p-4" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <h4 className="fw-bold mb-0">{isEditing ? "Edit Question" : "New Question Entry"}</h4>
              <button type="button" onClick={closeModal} className="btn-close"></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="form-label fw-bold small text-uppercase">Question Content</label>
                <div className="app-input-wrap">
                  <textarea className="form-control app-textarea" rows="3" value={formData.question} onChange={(e) => setFormData(p => ({ ...p, question: e.target.value }))} required />
                </div>
              </div>
              <div className="row g-3 mb-4">
                {['A','B','C','D'].map(opt => (
                  <div className="col-md-6" key={opt}>
                    <label className="form-label fw-bold small text-uppercase">Option {opt}</label>
                    <div className="app-input-wrap">
                      <input className="form-control app-input" value={formData[`option${opt}`]} onChange={(e) => setFormData(p => ({ ...p, [`option${opt}`]: e.target.value }))} required />
                    </div>
                  </div>
                ))}
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-uppercase">Correct Choice</label>
                  <div className="app-input-wrap">
                    <select className="form-select app-input" value={formData.correctAnswer} onChange={(e) => setFormData(p => ({ ...p, correctAnswer: e.target.value }))} required><option value="">Select Option</option><option value="A">Choice A</option><option value="B">Choice B</option><option value="C">Choice C</option><option value="D">Choice D</option></select>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-uppercase">Subject</label>
                  <div className="app-input-wrap">
                    <select className="form-select app-input" value={formData.subject} onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))} required><option value="">Assign Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.subjectname}</option>)}</select>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-3">
                <button type="submit" className="app-btn-primary flex-grow-1" disabled={saving}>{saving ? "Saving..." : isEditing ? "Save Changes" : "Create Question"}</button>
                <button type="button" onClick={closeModal} className="app-btn-soft">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
