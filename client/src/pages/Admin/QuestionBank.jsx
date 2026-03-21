import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiCheckCircle,
  FiEdit3,
  FiHelpCircle,
  FiLayers,
  FiPlus,
  FiSearch,
  FiType,
  FiX,
} from "react-icons/fi";

const initialForm = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
  subject: "",
};

const QuestionBank = () => {
  const [formData, setFormData] = useState(initialForm);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isEditing = Boolean(editingId);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchData = async () => {
    try {
      setFetching(true);
      const [questionRes, subjectRes] = await Promise.all([
        axios.get("https://computer-excellance-academy.onrender.com/api/question"),
        axios.get("https://computer-excellance-academy.onrender.com/api/subject"),
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, perPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (q) => {
    setFormData({
      question: q.question || "",
      optionA: q.optionA || "",
      optionB: q.optionB || "",
      optionC: q.optionC || "",
      optionD: q.optionD || "",
      correctAnswer: q.correctAnswer || "",
      subject: q.subject?._id || "",
    });
    setEditingId(q._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.question ||
      !formData.optionA ||
      !formData.optionB ||
      !formData.optionC ||
      !formData.optionD ||
      !formData.correctAnswer ||
      !formData.subject
    ) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await axios.put(
          `https://computer-excellance-academy.onrender.com/api/question/${editingId}`,
          formData
        );
        showToast("Question updated successfully");
      } else {
        await axios.post("https://computer-excellance-academy.onrender.com/api/question", formData);
        showToast("Question added successfully");
      }

      closeModal();
      fetchData();
    } catch (error) {
      showToast("Sorry, try again later", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`https://computer-excellance-academy.onrender.com/api/question/${id}`);
      showToast("Question deleted successfully");
      fetchData();
    } catch (error) {
      showToast("Delete failed", "error");
    }
  };

  const filteredQuestions = useMemo(() => {
    const keyword = search.toLowerCase();

    return questions.filter((q) => {
      return (
        q.question?.toLowerCase().includes(keyword) ||
        q.optionA?.toLowerCase().includes(keyword) ||
        q.optionB?.toLowerCase().includes(keyword) ||
        q.optionC?.toLowerCase().includes(keyword) ||
        q.optionD?.toLowerCase().includes(keyword) ||
        q.correctAnswer?.toLowerCase().includes(keyword) ||
        q.subject?.subjectname?.toLowerCase().includes(keyword)
      );
    });
  }, [questions, search]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / perPage));
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filteredQuestions.slice(indexOfFirst, indexOfLast);

  return (
    <>
      <style>{`
        .qb-page {
          min-height: 100vh;
          padding: 24px 0;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .qb-hero {
          padding: 32px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
        }

        .qb-panel,
        .qb-stat-card,
        .qb-modal {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          border: 0;
        }

        .qb-stat-card {
          padding: 24px;
          border-radius: 22px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
          height: 100%;
        }

        .qb-input-wrap,
        .qb-search {
          position: relative;
        }

        .qb-input-icon,
        .qb-search-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
        }

        .qb-input-icon {
          top: 50%;
          transform: translateY(-50%);
        }

        .qb-input-icon.top {
          top: 16px;
          transform: none;
        }

        .qb-search-icon {
          top: 50%;
          transform: translateY(-50%);
        }

        .qb-input,
        .qb-textarea,
        .qb-select {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 14px;
          outline: none;
          transition: 0.2s ease;
        }

        .qb-input,
        .qb-select {
          padding: 12px 14px 12px 40px;
        }

        .qb-textarea {
          padding: 12px 14px 12px 40px;
          resize: none;
        }

        .qb-input:focus,
        .qb-textarea:focus,
        .qb-select:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }

        .qb-btn-primary {
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 14px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .qb-btn-soft {
          border-radius: 14px;
          padding: 12px 20px;
          font-weight: 600;
          background: #eef2ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
        }

        .qb-btn-edit {
          border: none;
          color: #fff;
          border-radius: 10px;
          padding: 8px 14px;
          background: linear-gradient(135deg, #0284c7, #2563eb);
        }

        .qb-btn-delete {
          border-radius: 10px;
          padding: 8px 14px;
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
        }

        .qb-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .qb-badge-subject {
          background: #ede9fe;
          color: #5b21b6;
        }

        .qb-badge-answer {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .qb-mobile-card {
          padding: 16px;
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .qb-toast {
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

        .qb-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .qb-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .qb-toast-close {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
        }

        .qb-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.45);
        }

        .qb-modal {
          width: 100%;
          max-width: 760px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .qb-modal-header {
          padding: 20px 24px;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #0f172a, #2563eb);
        }

        .qb-modal-header.edit {
          background: linear-gradient(135deg, #7c3aed, #4338ca);
        }

        .qb-modal-close {
          border: none;
          background: rgba(255, 255, 255, 0.16);
          color: #fff;
          width: 38px;
          height: 38px;
          border-radius: 10px;
        }

        @media (max-width: 767px) {
          .qb-hero {
            padding: 24px;
          }
        }
      `}</style>

      <div className="qb-page">
        <div className="container">
          {toast.show && (
            <div className={`qb-toast ${toast.type === "error" ? "error" : "success"}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="qb-toast-close"
                onClick={() => setToast({ show: false, message: "", type: "success" })}
              >
                <FiX />
              </button>
            </div>
          )}

          <div className="qb-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Question Bank Dashboard</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Create, search, edit, and manage exam questions in one professional view.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end">
                <button type="button" onClick={openAddModal} className="qb-btn-primary">
                  <FiPlus className="me-2" />
                  Add Question
                </button>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="qb-stat-card">
                <div className="text-muted mb-2">Total Questions</div>
                <h4 className="fw-bold mb-0">{questions.length}</h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="qb-stat-card">
                <div className="text-muted mb-2">Available Subjects</div>
                <h4 className="fw-bold mb-0">{subjects.length}</h4>
              </div>
            </div>

            <div className="col-md-4">
              <div className="qb-stat-card">
                <div className="text-muted mb-2">Visible Records</div>
                <h4 className="fw-bold mb-0">{filteredQuestions.length}</h4>
              </div>
            </div>
          </div>

          <div className="qb-panel">
            <div className="card-body p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <h4 className="fw-bold mb-1">Question Records</h4>
                  <p className="text-muted mb-0">
                    Search, paginate, edit and manage all questions.
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <div className="qb-search">
                    <FiSearch className="qb-search-icon" />
                    <input
                      type="text"
                      className="qb-input"
                      placeholder="Search questions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ minWidth: 230 }}
                    />
                  </div>

                  <select
                    className="qb-select"
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    style={{ minWidth: 130, paddingLeft: 14 }}
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                  </select>
                </div>
              </div>

              <div className="d-none d-md-block table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr style={{ color: "#475569" }}>
                      <th>#</th>
                      <th>Question</th>
                      <th>Subject</th>
                      <th>A</th>
                      <th>B</th>
                      <th>C</th>
                      <th>D</th>
                      <th>Correct</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetching ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5">
                          Loading questions...
                        </td>
                      </tr>
                    ) : currentData.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-5 text-muted">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      currentData.map((q, index) => (
                        <tr key={q._id}>
                          <td>{indexOfFirst + index + 1}</td>
                          <td style={{ minWidth: 220 }}>{q.question}</td>
                          <td>
                            <span className="qb-badge qb-badge-subject">
                              {q.subject?.subjectname || "No Subject"}
                            </span>
                          </td>
                          <td>{q.optionA}</td>
                          <td>{q.optionB}</td>
                          <td>{q.optionC}</td>
                          <td>{q.optionD}</td>
                          <td>
                            <span className="qb-badge qb-badge-answer">
                              {q.correctAnswer}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="qb-btn-edit me-2"
                              onClick={() => handleEdit(q)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="qb-btn-delete"
                              onClick={() => handleDelete(q._id)}
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
                  <div className="text-center py-4">Loading questions...</div>
                ) : currentData.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No matching records found.
                  </div>
                ) : (
                  <div className="row g-3">
                    {currentData.map((q, index) => (
                      <div className="col-12" key={q._id}>
                        <div className="qb-mobile-card">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <strong>#{indexOfFirst + index + 1}</strong>
                            <span className="qb-badge qb-badge-subject">
                              {q.subject?.subjectname || "No Subject"}
                            </span>
                          </div>

                          <div className="fw-semibold mb-2">{q.question}</div>
                          <div className="text-muted small mb-1">A: {q.optionA}</div>
                          <div className="text-muted small mb-1">B: {q.optionB}</div>
                          <div className="text-muted small mb-1">C: {q.optionC}</div>
                          <div className="text-muted small mb-2">D: {q.optionD}</div>

                          <div className="mb-3">
                            <span className="qb-badge qb-badge-answer">
                              Correct: {q.correctAnswer}
                            </span>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="qb-btn-edit w-50"
                              onClick={() => handleEdit(q)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="qb-btn-delete w-50"
                              onClick={() => handleDelete(q._id)}
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

              <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 gap-3">
                <div className="text-muted">
                  Page {currentPage} of {totalPages}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="qb-btn-soft"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    className="qb-btn-primary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {modalOpen && (
            <div className="qb-modal-backdrop">
              <div className="qb-modal">
                <div className={`qb-modal-header ${isEditing ? "edit" : ""}`}>
                  <div>
                    <h4 className="fw-bold mb-1">
                      {isEditing ? "Edit Question" : "Add New Question"}
                    </h4>
                    <p className="mb-0" style={{ opacity: 0.8 }}>
                      Fill all question details before saving.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="qb-modal-close"
                    onClick={closeModal}
                  >
                    <FiX />
                  </button>
                </div>

                <div className="p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Question</label>
                      <div className="qb-input-wrap">
                        <FiHelpCircle className="qb-input-icon top" />
                        <textarea
                          name="question"
                          value={formData.question}
                          onChange={handleChange}
                          rows="4"
                          className="qb-textarea"
                          placeholder="Enter question here"
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Option A</label>
                        <div className="qb-input-wrap">
                          <FiType className="qb-input-icon" />
                          <input
                            type="text"
                            name="optionA"
                            value={formData.optionA}
                            onChange={handleChange}
                            className="qb-input"
                            placeholder="Option A"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Option B</label>
                        <div className="qb-input-wrap">
                          <FiType className="qb-input-icon" />
                          <input
                            type="text"
                            name="optionB"
                            value={formData.optionB}
                            onChange={handleChange}
                            className="qb-input"
                            placeholder="Option B"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Option C</label>
                        <div className="qb-input-wrap">
                          <FiType className="qb-input-icon" />
                          <input
                            type="text"
                            name="optionC"
                            value={formData.optionC}
                            onChange={handleChange}
                            className="qb-input"
                            placeholder="Option C"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Option D</label>
                        <div className="qb-input-wrap">
                          <FiType className="qb-input-icon" />
                          <input
                            type="text"
                            name="optionD"
                            value={formData.optionD}
                            onChange={handleChange}
                            className="qb-input"
                            placeholder="Option D"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Correct Answer
                        </label>
                        <div className="qb-input-wrap">
                          <FiCheckCircle className="qb-input-icon" />
                          <input
                            type="text"
                            name="correctAnswer"
                            value={formData.correctAnswer}
                            onChange={handleChange}
                            className="qb-input"
                            placeholder="Correct option"
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Subject</label>
                        <div className="qb-input-wrap">
                          <FiBookOpen className="qb-input-icon" />
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="qb-select"
                          >
                            <option value="">Select Subject</option>
                            {subjects.map((sub) => (
                              <option key={sub._id} value={sub._id}>
                                {sub.subjectname}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="qb-btn-primary"
                        disabled={saving}
                      >
                        {saving
                          ? "Saving..."
                          : isEditing
                          ? "Update Question"
                          : "Add Question"}
                      </button>

                      <button
                        type="button"
                        className="qb-btn-soft"
                        onClick={closeModal}
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
      </div>
    </>
  );
};

export default QuestionBank;
