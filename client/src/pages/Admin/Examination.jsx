import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiCalendar, FiClock, FiEdit3, FiLayers, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const initialForm = {
  examName: "",
  date: "",
  time: "",
  duration: "",
  totalMarks: "",
  passingMarks: "",
  sessionId: "",
  status: "Scheduled",
  questionMode: "distribution",
  questionDistribution: [{ subject: "", numberOfQuestions: "" }],
  manualQuestionIds: [],
};

const Examination = () => {
  const [formData, setFormData] = useState(initialForm);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const isEditing = Boolean(editingExamId);
  const token = localStorage.getItem("adminToken");
  const authConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchData = async () => {
    try {
      setFetching(true);
      const [subjectRes, sessionRes, examRes, questionRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/subject`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/session`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/exams/exams`, authConfig),
        axios.get(`${import.meta.env.VITE_API_URL}/api/question`, authConfig),
      ]);
      setSubjects(subjectRes?.data?.data || []);
      setSessions(sessionRes?.data?.data || []);
      setExams(examRes?.data || []);
      setQuestions(questionRes?.data?.data || []);
    } catch (err) {
      showToast("Failed to load examination data", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setFormData(initialForm);
    setEditingExamId(null);
    setError("");
    setQuestionSearch("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData(initialForm);
    setEditingExamId(null);
    setError("");
    setQuestionSearch("");
  };

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError("");
  };

  const handleQuestionDistChange = (index, event) => {
    const updated = [...formData.questionDistribution];
    updated[index][event.target.name] = event.target.value;
    setFormData((prev) => ({ ...prev, questionDistribution: updated }));
    setError("");
  };

  const addDistributionField = () => {
    setFormData((prev) => ({
      ...prev,
      questionDistribution: [...prev.questionDistribution, { subject: "", numberOfQuestions: "" }],
    }));
  };

  const removeDistributionField = (index) => {
    if (formData.questionDistribution.length === 1) {
      setError("At least one subject is required");
      return;
    }
    const updated = [...formData.questionDistribution];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, questionDistribution: updated }));
  };

  const toggleManualQuestion = (questionId) => {
    setFormData((prev) => {
      const exists = prev.manualQuestionIds.includes(questionId);
      return {
        ...prev,
        manualQuestionIds: exists
          ? prev.manualQuestionIds.filter((id) => id !== questionId)
          : [...prev.manualQuestionIds, questionId],
      };
    });
  };

  const validateForm = () => {
    if (!formData.examName || !formData.date || !formData.time || !formData.duration || !formData.totalMarks || !formData.passingMarks || !formData.sessionId) {
      return "All fields are required";
    }
    if (Number(formData.passingMarks) > Number(formData.totalMarks)) {
      return "Passing marks cannot exceed total marks";
    }
    if (formData.questionMode === "manual" && formData.manualQuestionIds.length === 0) {
      return "Select at least one manual question";
    }
    if (formData.questionMode === "distribution" && formData.questionDistribution.some((dist) => !dist.subject || !dist.numberOfQuestions || Number(dist.numberOfQuestions) <= 0)) {
      return "All question distributions must have valid subject and count";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    try {
      setSaving(true);
      const payload = { ...formData, questionDistribution: formData.questionMode === "distribution" ? formData.questionDistribution : [] };
      if (isEditing) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/exams/${editingExamId}`, payload, authConfig);
        showToast("Exam updated successfully");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/exams`, payload, authConfig);
        showToast("Exam created successfully");
      }
      closeModal();
      fetchData();
    } catch (err) { setError(err.response?.data?.error || "Error submitting form"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/exams/${id}`, authConfig);
      showToast("Exam deleted successfully");
      fetchData();
    } catch (err) { showToast("Delete failed", "error"); }
  };

  const handleEdit = (exam) => {
    setFormData({
      examName: exam.title || "",
      totalMarks: exam.totalMarks || "",
      passingMarks: exam.passingMarks || "",
      date: exam.date || "",
      time: exam.time || "",
      duration: exam.duration || "",
      sessionId: exam.sessionId?._id || "",
      status: exam.status || "Scheduled",
      questionMode: exam.questionMode || "distribution",
      questionDistribution: exam.questionMode === "distribution" && exam.questionDistribution?.length ? exam.questionDistribution.map((item) => ({ subject: item.subject?._id || item.subject || "", numberOfQuestions: item.questionCount || item.numberOfQuestions || "" })) : [{ subject: "", numberOfQuestions: "" }],
      manualQuestionIds: exam.questionMode === "manual" ? (exam.questions || []).map((item) => item._id || item) : [],
    });
    setEditingExamId(exam._id);
    setError("");
    setQuestionSearch("");
    setModalOpen(true);
  };

  const filteredExams = useMemo(() => {
    const keyword = search.toLowerCase();
    return exams.filter((exam) => {
      return (
        exam.title?.toLowerCase().includes(keyword) ||
        exam.status?.toLowerCase().includes(keyword) ||
        exam.sessionId?.name?.toLowerCase().includes(keyword) ||
        exam.questionMode?.toLowerCase().includes(keyword)
      );
    });
  }, [exams, search]);

  const filteredManualQuestions = useMemo(() => {
    const keyword = questionSearch.toLowerCase();
    return questions.filter((question) => {
      return (
        question.question?.toLowerCase().includes(keyword) ||
        question.subject?.subjectname?.toLowerCase().includes(keyword)
      );
    });
  }, [questions, questionSearch]);

  const getStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "scheduled") return { bg: "#dbeafe", text: "#1e40af" };
    if (s === "draft") return { bg: "#fef3c7", text: "#92400e" };
    if (s === "closed") return { bg: "#fee2e2", text: "#991b1b" };
    return { bg: "#f1f5f9", text: "#475569" };
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Examination Command Center</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Configure random distribution exams or manually curated assessments.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button type="button" onClick={openAddModal} className="app-btn-primary">
                <FiPlus className="me-2" /> Create New Exam
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          {fetching ? (
            <SkeletonStats count={4} />
          ) : (
            <>
              <div className="col-md-3"><div className="app-stat-card"><div className="app-label-muted">Total Exams</div><h4 className="fw-bold mb-0">{exams.length}</h4></div></div>
              <div className="col-md-3"><div className="app-stat-card"><div className="app-label-muted">Question Pool</div><h4 className="fw-bold mb-0">{questions.length}</h4></div></div>
              <div className="col-md-3"><div className="app-stat-card"><div className="app-label-muted">Curriculums</div><h4 className="fw-bold mb-0">{subjects.length}</h4></div></div>
              <div className="col-md-3"><div className="app-stat-card"><div className="app-label-muted">Active Sessions</div><h4 className="fw-bold mb-0">{sessions.length}</h4></div></div>
            </>
          )}
        </div>

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div><h4 className="fw-bold mb-1">Examination Records</h4><p className="text-muted small">Track and manage upcoming and past academic assessments.</p></div>
              <div className="app-search" style={{ minWidth: 320 }}>
                <FiSearch className="app-search__icon" />
                <input type="text" className="form-control app-input" placeholder="Filter exams..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="d-none d-md-block table-responsive">
              <table className="table align-middle">
                <thead><tr style={{ color: "#475569" }}><th>#</th><th>EXAM TITLE</th><th>STRATEGY</th><th>STATS</th><th>STATUS</th><th className="text-end">ACTION</th></tr></thead>
                <tbody>
                  {fetching ? (
                    <tr><td colSpan="6" className="p-0 border-0"><SkeletonTable rows={5} cols={6} /></td></tr>
                  ) : filteredExams.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-5 text-muted">No examinations scheduled yet.</td></tr>
                  ) : (
                    filteredExams.map((e, index) => {
                      const status = getStatusColor(e.status);
                      return (
                        <tr key={e._id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td className="fw-bold text-muted small">{index + 1}</td>
                          <td style={{ minWidth: 220 }}><div className="fw-bold text-dark">{e.title}</div><div className="small text-muted"><FiCalendar className="me-1" style={{ display: 'inline' }} />{e.date} • <FiClock className="me-1" style={{ display: 'inline' }} />{e.time}</div></td>
                          <td><span style={{ background: e.questionMode === 'manual' ? '#dcfce7' : '#dbeafe', color: e.questionMode === 'manual' ? '#166534' : '#1e40af', padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{e.questionMode}</span></td>
                          <td><div className="fw-bold">{e.totalMarks} <span className="small text-muted fw-normal">Marks</span></div><div className="small text-muted">{e.duration} Mins</div></td>
                          <td><span className="app-badge" style={{ background: status.bg, color: status.text }}>{e.status}</span></td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button className="app-btn-edit" onClick={() => handleEdit(e)}><FiEdit3 /></button>
                              <button className="app-btn-delete" onClick={() => handleDelete(e._id)}><FiTrash2 /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-block d-md-none">
              {fetching ? (
                <div className="text-center py-4">Loading...</div>
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-4 text-muted">No exams found.</div>
              ) : (
                <div className="row g-3">
                  {filteredExams.map((e, index) => {
                    const status = getStatusColor(e.status);
                    return (
                      <div className="col-12" key={e._id || index}>
                        <div className="app-mobile-card">
                          <strong>#{index + 1} - {e.title}</strong>
                          <div className="text-muted small mt-1">{e.date} • {e.time}</div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span style={{ background: status.bg, color: status.text, padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600 }}>{e.status}</span>
                            <div className="d-flex gap-2">
                              <button className="app-btn-edit" onClick={() => handleEdit(e)}><FiEdit3 /></button>
                              <button className="app-btn-delete" onClick={() => handleDelete(e._id)}><FiTrash2 /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: 'blur(8px)', display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998, padding: 20 }}>
          <div className="app-panel" style={{ width: "100%", maxWidth: 1000, padding: 0, overflow: "hidden", maxHeight: '90vh' }}>
            <div className="d-flex justify-content-between align-items-center p-4" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div><h4 className="fw-bold mb-0">{isEditing ? "Modify Examination" : "New Assessment Strategy"}</h4><p className="mb-0 small text-muted">Configure parameters for the upcoming exam session.</p></div>
              <button type="button" onClick={closeModal} className="btn-close"></button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              {error && <div className="alert alert-danger rounded-3 py-2 small fw-bold mb-4">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-uppercase">Exam Title</label>
                    <div className="app-input-wrap">
                      <input className="form-control app-input" name="examName" value={formData.examName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-uppercase">Total Marks</label>
                    <div className="app-input-wrap">
                      <input type="number" className="form-control app-input" name="totalMarks" value={formData.totalMarks} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-uppercase">Passing Marks</label>
                    <div className="app-input-wrap">
                      <input type="number" className="form-control app-input" name="passingMarks" value={formData.passingMarks} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-uppercase">Date</label>
                    <div className="app-input-wrap">
                      <input type="date" className="form-control app-input" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-uppercase">Time</label>
                    <div className="app-input-wrap">
                      <input type="time" className="form-control app-input" name="time" value={formData.time} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-uppercase">Duration (Mins)</label>
                    <div className="app-input-wrap">
                      <input type="number" className="form-control app-input" name="duration" value={formData.duration} onChange={handleChange} required />
                    </div>
                  </div>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-uppercase">Academic Session</label>
                    <div className="app-input-wrap">
                      <select className="form-select app-input" name="sessionId" value={formData.sessionId} onChange={handleChange} required><option value="">Select</option>{sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-uppercase">Lifecycle State</label>
                    <div className="app-input-wrap">
                      <select className="form-select app-input" name="status" value={formData.status} onChange={handleChange}><option value="Scheduled">Scheduled</option><option value="Draft">Draft</option><option value="Closed">Closed</option></select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small text-uppercase">Curating Strategy</label>
                    <div className="app-input-wrap">
                      <select className="form-select app-input" name="questionMode" value={formData.questionMode} onChange={handleChange}><option value="distribution">Distribution</option><option value="manual">Manual Selection</option></select>
                    </div>
                  </div>
                </div>

                {formData.questionMode === "distribution" ? (
                  <div className="p-4 mb-4" style={{ background: '#f8fbff', borderRadius: 12, border: '1px dashed #3b82f6' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold mb-0"><FiLayers className="me-2" style={{ display: 'inline' }} />Randomized Strategy</h6>
                      <button type="button" className="app-btn-primary" style={{ fontSize: '0.85rem', padding: '6px 12px' }} onClick={addDistributionField}>+ Add Subject</button>
                    </div>
                    {formData.questionDistribution.map((item, index) => (
                      <div className="row g-3 mb-2" key={index}>
                        <div className="col-md-7">
                          <div className="app-input-wrap">
                            <select className="form-select app-input" name="subject" value={item.subject} onChange={(e) => handleQuestionDistChange(index, e)}><option value="">Select Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.subjectname}</option>)}</select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="app-input-wrap">
                            <input type="number" className="form-control app-input" name="numberOfQuestions" placeholder="Count" value={item.numberOfQuestions} onChange={(e) => handleQuestionDistChange(index, e)} />
                          </div>
                        </div>
                        <div className="col-md-2"><button type="button" className="app-btn-delete w-100" onClick={() => removeDistributionField(index)}><FiTrash2 /></button></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 mb-4" style={{ background: '#f0fdf4', borderRadius: 12, border: '1px dashed #22c55e' }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                      <h6 className="fw-bold mb-0"><FiLayers className="me-2" style={{ display: 'inline' }} />Curated Manual Strategy ({formData.manualQuestionIds.length} Selected)</h6>
                      <div className="app-input-wrap" style={{ maxWidth: 260 }}>
                        <input type="text" className="form-control app-input" placeholder="Search pool..." value={questionSearch} onChange={(e) => setQuestionSearch(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {filteredManualQuestions.map(q => (
                        <div key={q._id} className="p-3 bg-white border rounded-2 mb-2 d-flex gap-3">
                          <input type="checkbox" checked={formData.manualQuestionIds.includes(q._id)} onChange={() => toggleManualQuestion(q._id)} />
                          <div><div className="fw-bold small">{q.question}</div><div className="small text-muted">{q.subject?.subjectname}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex gap-3 pt-3">
                  <button type="submit" className="app-btn-primary flex-grow-1" disabled={saving}>{saving ? "Processing..." : isEditing ? "Modify Assessment" : "Deploy Assessment"}</button>
                  <button type="button" onClick={closeModal} className="app-btn-soft">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Examination;
