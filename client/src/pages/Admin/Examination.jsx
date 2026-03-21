import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const initialForm = {
  examName: "",
  date: "",
  time: "",
  duration: "",
  totalMarks: "",
  passingMarks: "",
  sessionId: "",
  status: "Scheduled",
  questionDistribution: [{ subject: "", numberOfQuestions: "" }],
};

const Examination = () => {
  const [formData, setFormData] = useState(initialForm);
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isEditing = Boolean(editingExamId);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchData = async () => {
    try {
      setFetching(true);
      const [subjectRes, sessionRes, examRes] = await Promise.all([
        axios.get("https://computer-excellance-academy.onrender.com/api/subject"),
        axios.get("https://computer-excellance-academy.onrender.com/api/session"),
        axios.get("https://computer-excellance-academy.onrender.com/api/exams/exams"),
      ]);

      setSubjects(subjectRes?.data?.data || []);
      setSessions(sessionRes?.data?.data || []);
      setExams(examRes?.data || []);
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
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData(initialForm);
    setEditingExamId(null);
    setError("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleQuestionDistChange = (index, e) => {
    const updated = [...formData.questionDistribution];
    updated[index][e.target.name] = e.target.value;
    setFormData((prev) => ({
      ...prev,
      questionDistribution: updated,
    }));
    setError("");
  };

  const addDistributionField = () => {
    setFormData((prev) => ({
      ...prev,
      questionDistribution: [
        ...prev.questionDistribution,
        { subject: "", numberOfQuestions: "" },
      ],
    }));
  };

  const removeDistributionField = (index) => {
    if (formData.questionDistribution.length === 1) {
      setError("At least one subject is required");
      return;
    }

    const updated = [...formData.questionDistribution];
    updated.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      questionDistribution: updated,
    }));
  };

  const validateForm = () => {
    if (
      !formData.examName ||
      !formData.date ||
      !formData.time ||
      !formData.duration ||
      !formData.totalMarks ||
      !formData.passingMarks ||
      !formData.sessionId
    ) {
      return "All fields are required";
    }

    if (parseInt(formData.passingMarks, 10) > parseInt(formData.totalMarks, 10)) {
      return "Passing marks cannot exceed total marks";
    }

    if (
      formData.questionDistribution.some(
        (dist) =>
          !dist.subject ||
          !dist.numberOfQuestions ||
          parseInt(dist.numberOfQuestions, 10) <= 0
      )
    ) {
      return "All question distributions must have a valid subject and number of questions";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await axios.put(`https://computer-excellance-academy.onrender.com/api/exams/${editingExamId}`, formData);
        showToast("Exam updated successfully");
      } else {
        await axios.post("https://computer-excellance-academy.onrender.com/api/exams", formData);
        showToast("Exam created successfully");
      }

      closeModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Error submitting form");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this exam?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://computer-excellance-academy.onrender.com/api/exams/${id}`);
      showToast("Exam deleted successfully");
      fetchData();
    } catch (err) {
      showToast("Delete failed", "error");
    }
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
      questionDistribution:
        exam.questionDistribution?.length > 0
          ? exam.questionDistribution.map((item) => ({
              subject: item.subject || "",
              numberOfQuestions: item.numberOfQuestions || "",
            }))
          : [{ subject: "", numberOfQuestions: "" }],
    });

    setEditingExamId(exam._id);
    setError("");
    setModalOpen(true);
  };

  const filteredExams = useMemo(() => {
    const keyword = search.toLowerCase();

    return exams.filter((exam) => {
      return (
        exam.title?.toLowerCase().includes(keyword) ||
        exam.status?.toLowerCase().includes(keyword) ||
        exam.sessionId?.name?.toLowerCase().includes(keyword) ||
        String(exam.totalMarks || "").toLowerCase().includes(keyword) ||
        String(exam.passingMarks || "").toLowerCase().includes(keyword) ||
        String(exam.date || "").toLowerCase().includes(keyword)
      );
    });
  }, [exams, search]);

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (value === "scheduled") {
      return { background: "#dbeafe", color: "#1d4ed8" };
    }
    if (value === "draft") {
      return { background: "#fef3c7", color: "#92400e" };
    }
    if (value === "closed") {
      return { background: "#fee2e2", color: "#b91c1c" };
    }

    return { background: "#e2e8f0", color: "#334155" };
  };

  return (
    <div
      className="container py-4"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
      }}
    >
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: "280px",
            padding: "14px 16px",
            borderRadius: "16px",
            color: "#fff",
            background:
              toast.type === "error"
                ? "linear-gradient(135deg,#dc2626,#ef4444)"
                : "linear-gradient(135deg,#2563eb,#4f46e5)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center gap-3">
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast({ show: false, message: "", type: "success" })}
              style={{
                border: "none",
                background: "transparent",
                color: "#fff",
                fontSize: "16px",
              }}
            >
              x
            </button>
          </div>
        </div>
      )}

      <div
        className="p-4 p-md-5 mb-4 text-white"
        style={{
          borderRadius: "28px",
          background: "linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5)",
          boxShadow: "0 20px 45px rgba(37, 99, 235, 0.22)",
        }}
      >
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <h2 className="fw-bold mb-2">Examination Dashboard</h2>
            <p className="mb-0" style={{ opacity: 0.88 }}>
              Create, manage, and organize exams with a premium professional interface.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <button
              type="button"
              onClick={openAddModal}
              className="btn text-white"
              style={{
                border: "none",
                borderRadius: "14px",
                padding: "12px 20px",
                fontWeight: "600",
                background: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(8px)",
              }}
            >
              + Create Exam
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div
            className="p-4 bg-white h-100"
            style={{ borderRadius: "22px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}
          >
            <div className="text-muted mb-2">Total Exams</div>
            <h4 className="fw-bold mb-0">{exams.length}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="p-4 bg-white h-100"
            style={{ borderRadius: "22px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}
          >
            <div className="text-muted mb-2">Subjects</div>
            <h4 className="fw-bold mb-0">{subjects.length}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="p-4 bg-white h-100"
            style={{ borderRadius: "22px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}
          >
            <div className="text-muted mb-2">Sessions</div>
            <h4 className="fw-bold mb-0">{sessions.length}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="p-4 bg-white h-100"
            style={{ borderRadius: "22px", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)" }}
          >
            <div className="text-muted mb-2">Visible Records</div>
            <h4 className="fw-bold mb-0">{filteredExams.length}</h4>
          </div>
        </div>
      </div>

      <div
        className="card border-0"
        style={{
          borderRadius: "24px",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1">Examination Records</h4>
              <p className="text-muted mb-0">
                Search, edit and manage all examinations.
              </p>
            </div>

            <div style={{ minWidth: "240px", position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search examinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  borderRadius: "14px",
                  padding: "12px 14px 12px 40px",
                  border: "1px solid #dbe3f0",
                }}
              />
            </div>
          </div>

          <div className="d-none d-md-block table-responsive">
            <table className="table align-middle">
              <thead>
                <tr style={{ color: "#475569" }}>
                  <th>#</th>
                  <th>Exam Name</th>
                  <th>Total</th>
                  <th>Passing</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Session</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      Loading examinations...
                    </td>
                  </tr>
                ) : filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5 text-muted">
                      No examinations found.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam, index) => (
                    <tr key={exam._id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{exam.title}</td>
                      <td>{exam.totalMarks}</td>
                      <td>{exam.passingMarks}</td>
                      <td>{exam.date}</td>
                      <td>{exam.time}</td>
                      <td>{exam.duration} min</td>
                      <td>{exam.sessionId?.name || "N/A"}</td>
                      <td>
                        <span
                          style={{
                            ...getStatusStyle(exam.status),
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {exam.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm text-white me-2"
                          onClick={() => handleEdit(exam)}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 14px",
                            background: "linear-gradient(135deg, #0284c7, #2563eb)",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => handleDelete(exam._id)}
                          style={{
                            borderRadius: "10px",
                            padding: "8px 14px",
                            background: "#fff1f2",
                            color: "#be123c",
                            border: "1px solid #fecdd3",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-block d-md-none">
            {fetching ? (
              <div className="text-center py-4">Loading examinations...</div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-4 text-muted">No examinations found.</div>
            ) : (
              <div className="row g-3">
                {filteredExams.map((exam, index) => (
                  <div className="col-12" key={exam._id}>
                    <div
                      className="p-3 bg-white"
                      style={{
                        borderRadius: "18px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>#{index + 1}</strong>
                        <span
                          style={{
                            ...getStatusStyle(exam.status),
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {exam.status}
                        </span>
                      </div>

                      <div className="fw-semibold mb-2">{exam.title}</div>
                      <div className="text-muted small mb-1">Session: {exam.sessionId?.name || "N/A"}</div>
                      <div className="text-muted small mb-1">Date: {exam.date}</div>
                      <div className="text-muted small mb-1">Time: {exam.time}</div>
                      <div className="text-muted small mb-1">Duration: {exam.duration} min</div>
                      <div className="text-muted small mb-1">Total Marks: {exam.totalMarks}</div>
                      <div className="text-muted small mb-3">Passing Marks: {exam.passingMarks}</div>

                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm text-white w-50"
                          onClick={() => handleEdit(exam)}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            background: "linear-gradient(135deg, #0284c7, #2563eb)",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm w-50"
                          onClick={() => handleDelete(exam._id)}
                          style={{
                            borderRadius: "10px",
                            padding: "10px 14px",
                            background: "#fff1f2",
                            color: "#be123c",
                            border: "1px solid #fecdd3",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998,
            padding: "16px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              background: "#fff",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              style={{
                padding: "20px 24px",
                color: "#fff",
                background: isEditing
                  ? "linear-gradient(135deg, #7c3aed, #4338ca)"
                  : "linear-gradient(135deg, #0f172a, #2563eb)",
              }}
            >
              <div>
                <h4 className="fw-bold mb-1">
                  {isEditing ? "Edit Examination" : "Create Examination"}
                </h4>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Fill exam details and configure question distribution.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.16)",
                  color: "#fff",
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                }}
              >
                x
              </button>
            </div>

            <div className="p-4">
              {error && (
                <div className="alert alert-danger" style={{ borderRadius: "14px" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Exam Name</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>📝</span>
                      <input
                        type="text"
                        className="form-control"
                        name="examName"
                        value={formData.examName}
                        onChange={handleChange}
                        placeholder="Exam name"
                        style={{ borderRadius: "14px", padding: "12px 14px 12px 40px", border: "1px solid #dbe3f0" }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Total Marks</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>#</span>
                      <input
                        type="number"
                        className="form-control"
                        name="totalMarks"
                        value={formData.totalMarks}
                        onChange={handleChange}
                        min="1"
                        placeholder="Total marks"
                        style={{ borderRadius: "14px", padding: "12px 14px 12px 40px", border: "1px solid #dbe3f0" }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Passing Marks</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>✔</span>
                      <input
                        type="number"
                        className="form-control"
                        name="passingMarks"
                        value={formData.passingMarks}
                        onChange={handleChange}
                        min="1"
                        placeholder="Passing marks"
                        style={{ borderRadius: "14px", padding: "12px 14px 12px 40px", border: "1px solid #dbe3f0" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Date</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>📅</span>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        style={{ borderRadius: "14px", padding: "12px 14px 12px 40px", border: "1px solid #dbe3f0" }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Time</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>⏰</span>
                      <input
                        type="time"
                        className="form-control"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        style={{ borderRadius: "14px", padding: "12px 14px 12px 40px", border: "1px solid #dbe3f0" }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Duration</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>⏳</span>
                      <input
                        type="number"
                        className="form-control"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="1"
                        placeholder="Duration in minutes"
                        style={{ borderRadius: "14px", padding: "12px 14px 12px 40px", border: "1px solid #dbe3f0" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Session</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b", zIndex: 1 }}>📚</span>
                      <select
                        className="form-select"
                        name="sessionId"
                        value={formData.sessionId}
                        onChange={handleChange}
                        style={{ borderRadius: "14px", padding: "12px 14px 12px 40px", border: "1px solid #dbe3f0" }}
                      >
                        <option value="">Select Session</option>
                        {sessions.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Status</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b", zIndex: 1 }}>🏷</span>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{ borderRadius: "14px", padding: "12px 14px 12px 40px", border: "1px solid #dbe3f0" }}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Draft">Draft</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 mb-4"
                  style={{
                    borderRadius: "18px",
                    background: "#f8fbff",
                    border: "1px solid #dbeafe",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0" style={{ color: "#1d4ed8" }}>
                      Question Distribution
                    </h5>
                    <button
                      type="button"
                      className="btn btn-sm text-white"
                      onClick={addDistributionField}
                      style={{
                        border: "none",
                        borderRadius: "10px",
                        padding: "8px 14px",
                        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                      }}
                    >
                      + Add Subject
                    </button>
                  </div>

                  {formData.questionDistribution.map((item, index) => (
                    <div className="row g-3 mb-3" key={index}>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Subject</label>
                        <select
                          className="form-select"
                          name="subject"
                          value={item.subject}
                          onChange={(e) => handleQuestionDistChange(index, e)}
                          style={{ borderRadius: "14px", padding: "12px 14px", border: "1px solid #dbe3f0" }}
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.subjectname}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold">No. of Questions</label>
                        <input
                          type="number"
                          className="form-control"
                          name="numberOfQuestions"
                          value={item.numberOfQuestions}
                          onChange={(e) => handleQuestionDistChange(index, e)}
                          min="1"
                          placeholder="Number of questions"
                          style={{ borderRadius: "14px", padding: "12px 14px", border: "1px solid #dbe3f0" }}
                        />
                      </div>

                      <div className="col-md-2 d-flex align-items-end">
                        <button
                          type="button"
                          className="btn w-100"
                          onClick={() => removeDistributionField(index)}
                          style={{
                            borderRadius: "12px",
                            padding: "12px 14px",
                            background: "#fff1f2",
                            color: "#be123c",
                            border: "1px solid #fecdd3",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="btn text-white"
                    disabled={saving}
                    style={{
                      border: "none",
                      borderRadius: "14px",
                      padding: "12px 20px",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                    }}
                  >
                    {saving
                      ? "Saving..."
                      : isEditing
                      ? "Update Exam"
                      : "Create Exam"}
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn"
                    style={{
                      borderRadius: "14px",
                      padding: "12px 20px",
                      fontWeight: "600",
                      background: "#eef2ff",
                      color: "#3730a3",
                      border: "1px solid #c7d2fe",
                    }}
                  >
                    Cancel
                  </button>
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
