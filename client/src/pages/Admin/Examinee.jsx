import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";

const initialForm = {
  name: "",
  email: "",
  number: "",
  address: "",
  college: "",
  qualification: "",
};

const Examinee = () => {
  const [examinees, setExaminees] = useState([]);
  const [form, setForm] = useState(initialForm);
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

  const fetchExaminees = async () => {
    try {
      setFetching(true);
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/examinee");
      setExaminees(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load examinees", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchExaminees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      email: item.email || "",
      number: item.number || "",
      address: item.address || "",
      college: item.college || "",
      qualification: item.qualification || "",
    });
    setEditingId(item._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId) return;

    if (!form.name || !form.email || !form.number) {
      showToast("Name, email and number are required", "error");
      return;
    }

    try {
      setSaving(true);
      await axios.put(`https://computer-excellance-academy.onrender.com/api/examinee/${editingId}`, form);
      showToast("Examinee updated successfully");
      closeModal();
      fetchExaminees();
    } catch (error) {
      showToast("Error updating examinee", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this examinee?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://computer-excellance-academy.onrender.com/api/examinee/${id}`);
      showToast("Examinee deleted successfully");
      fetchExaminees();
    } catch (error) {
      showToast("Delete failed", "error");
    }
  };

  const filteredExaminees = useMemo(() => {
    const keyword = search.toLowerCase();

    return examinees.filter((item) => {
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.number?.toLowerCase().includes(keyword) ||
        item.address?.toLowerCase().includes(keyword) ||
        item.college?.toLowerCase().includes(keyword) ||
        item.qualification?.toLowerCase().includes(keyword)
      );
    });
  }, [examinees, search]);

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
            <h2 className="fw-bold mb-2">Examinee Dashboard</h2>
            <p className="mb-0" style={{ opacity: 0.88 }}>
              View, search, edit, and manage examinee records in a clean professional interface.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div
              className="d-inline-block px-4 py-3"
              style={{
                borderRadius: "18px",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: "13px", opacity: 0.8 }}>Total Examinees</div>
              <div className="fw-bold" style={{ fontSize: "28px" }}>
                {examinees.length}
              </div>
            </div>
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
            <div className="text-muted mb-2">Total Records</div>
            <h4 className="fw-bold mb-0">{examinees.length}</h4>
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
            <h4 className="fw-bold mb-0">{filteredExaminees.length}</h4>
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
            <h4 className="fw-bold mb-0">{isEditing ? "Editing" : "View Only"}</h4>
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
              <h4 className="fw-bold mb-1">Examinee Records</h4>
              <p className="text-muted mb-0">
                Search, edit and remove examinee entries easily.
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
                placeholder="Search examinee..."
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Number</th>
                  <th>Address</th>
                  <th>College</th>
                  <th>Qualification</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      Loading examinees...
                    </td>
                  </tr>
                ) : filteredExaminees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredExaminees.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.number}</td>
                      <td>{item.address || "-"}</td>
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
                          {item.college || "N/A"}
                        </span>
                      </td>
                      <td>{item.qualification || "-"}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm text-white me-2"
                          onClick={() => handleEdit(item)}
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
              <div className="text-center py-4">Loading examinees...</div>
            ) : filteredExaminees.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No matching records found.
              </div>
            ) : (
              <div className="row g-3">
                {filteredExaminees.map((item, index) => (
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
                          {item.college || "N/A"}
                        </span>
                      </div>

                      <div className="fw-semibold mb-1">{item.name}</div>
                      <div className="text-muted small mb-1">{item.email}</div>
                      <div className="text-muted small mb-1">{item.number}</div>
                      <div className="text-muted small mb-1">{item.address || "-"}</div>
                      <div className="text-muted small mb-3">
                        Qualification: {item.qualification || "-"}
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm text-white w-50"
                          onClick={() => handleEdit(item)}
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
              maxWidth: "760px",
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
                background: "linear-gradient(135deg, #0f172a, #2563eb)",
              }}
            >
              <div>
                <h4 className="fw-bold mb-1">Edit Examinee</h4>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Update examinee details carefully before saving.
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
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Name</label>
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
                        👤
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter name"
                        style={{
                          borderRadius: "14px",
                          padding: "12px 14px 12px 40px",
                          border: "1px solid #dbe3f0",
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
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
                        ✉
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter email"
                        style={{
                          borderRadius: "14px",
                          padding: "12px 14px 12px 40px",
                          border: "1px solid #dbe3f0",
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Number</label>
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
                        ☎
                      </span>
                      <input
                        type="text"
                        name="number"
                        value={form.number}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter number"
                        style={{
                          borderRadius: "14px",
                          padding: "12px 14px 12px 40px",
                          border: "1px solid #dbe3f0",
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Address</label>
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
                        📍
                      </span>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter address"
                        style={{
                          borderRadius: "14px",
                          padding: "12px 14px 12px 40px",
                          border: "1px solid #dbe3f0",
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">College</label>
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
                        🎓
                      </span>
                      <input
                        type="text"
                        name="college"
                        value={form.college}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter college"
                        style={{
                          borderRadius: "14px",
                          padding: "12px 14px 12px 40px",
                          border: "1px solid #dbe3f0",
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Qualification</label>
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
                        ✔
                      </span>
                      <input
                        type="text"
                        name="qualification"
                        value={form.qualification}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter qualification"
                        style={{
                          borderRadius: "14px",
                          padding: "12px 14px 12px 40px",
                          border: "1px solid #dbe3f0",
                        }}
                      />
                    </div>
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
                    {saving ? "Saving..." : "Update Examinee"}
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

export default Examinee;
