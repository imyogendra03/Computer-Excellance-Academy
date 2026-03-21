import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const initialForm = {
  subjectname: "",
  description: "",
};

const Subject = () => {
  const [form, setForm] = useState(initialForm);
  const [subjects, setSubjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
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

  const fetchSubjects = async () => {
    try {
      setFetching(true);
      const res = await axios.get("http://localhost:5000/api/subject");
      setSubjects(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load subjects", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setForm({
      subjectname: item.subjectname || "",
      description: item.description || "",
    });
    setEditingId(item._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subjectname || !form.description) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await axios.put(`http://localhost:5000/api/subject/${editingId}`, form);
        showToast("Subject updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/subject", form);
        showToast("Subject added successfully");
      }

      closeModal();
      fetchSubjects();
    } catch (error) {
      showToast("Sorry, something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this subject?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/subject/${id}`);
      showToast("Subject deleted successfully");
      fetchSubjects();
    } catch (error) {
      showToast("Delete failed", "error");
    }
  };

  const filteredSubjects = useMemo(() => {
    const keyword = search.toLowerCase();
    return subjects.filter((item) => {
      return (
        item.subjectname?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
      );
    });
  }, [subjects, search]);

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
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
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
            <h2 className="fw-bold mb-2">Subject Dashboard</h2>
            <p className="mb-0" style={{ opacity: 0.88 }}>
              Create, update, and manage subjects in a clean professional interface.
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
              + Add Subject
            </button>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">Total Subjects</div>
            <h4 className="fw-bold mb-0">{subjects.length}</h4>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">Current Mode</div>
            <h4 className="fw-bold mb-0">
              {isEditing ? "Editing Subject" : "Creating Subject"}
            </h4>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">Visible Records</div>
            <h4 className="fw-bold mb-0">{filteredSubjects.length}</h4>
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
              <h4 className="fw-bold mb-1">Subject Records</h4>
              <p className="text-muted mb-0">
                Search, edit, and manage all subjects.
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
                placeholder="Search subjects..."
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
                  <th>Subject Name</th>
                  <th>Description</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      Loading subjects...
                    </td>
                  </tr>
                ) : filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      No subjects found.
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            background: "#ede9fe",
                            color: "#5b21b6",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.subjectname}
                        </span>
                      </td>
                      <td>{item.description}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm text-white me-2"
                          onClick={() => handleEdit(item)}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 14px",
                            background:
                              "linear-gradient(135deg, #0284c7, #2563eb)",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => handleDelete(item._id)}
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
              <div className="text-center py-4">Loading subjects...</div>
            ) : filteredSubjects.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No subjects found.
              </div>
            ) : (
              <div className="row g-3">
                {filteredSubjects.map((item, index) => (
                  <div className="col-12" key={item._id}>
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
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            background: "#ede9fe",
                            color: "#5b21b6",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {item.subjectname}
                        </span>
                      </div>

                      <div className="text-muted small mb-3">{item.description}</div>

                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm text-white w-50"
                          onClick={() => handleEdit(item)}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            background:
                              "linear-gradient(135deg, #0284c7, #2563eb)",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm w-50"
                          onClick={() => handleDelete(item._id)}
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
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
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
                  {isEditing ? "Edit Subject" : "Add New Subject"}
                </h4>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Enter subject details before saving.
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
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Subject Name</label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#64748b",
                      }}
                    >
                      📘
                    </span>
                    <input
                      type="text"
                      name="subjectname"
                      value={form.subjectname}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter subject name"
                      style={{
                        borderRadius: "14px",
                        padding: "12px 14px 12px 40px",
                        border: "1px solid #dbe3f0",
                      }}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Description</label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "16px",
                        color: "#64748b",
                      }}
                    >
                      ✎
                    </span>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows="4"
                      className="form-control"
                      placeholder="Enter subject description"
                      style={{
                        borderRadius: "14px",
                        padding: "12px 14px 12px 40px",
                        border: "1px solid #dbe3f0",
                        resize: "none",
                      }}
                    />
                  </div>
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
                      ? "Update Subject"
                      : "Add Subject"}
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

export default Subject;
