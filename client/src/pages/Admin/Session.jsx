import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiEdit3,
  FiFileText,
  FiPlus,
  FiSearch,
  FiType,
} from "react-icons/fi";
import AppToast from "../../components/ui/AppToast";
import AppModal from "../../components/ui/AppModal";
import "../../components/ui/app-ui.css";

const initialForm = {
  name: "",
  description: "",
  startdate: "",
  enddate: "",
};

const Session = () => {
  const [form, setForm] = useState(initialForm);
  const [sessions, setSessions] = useState([]);
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

  const fetchSessions = async () => {
    try {
      setFetching(true);
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/session");
      setSessions(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load sessions", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSessions();
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
      name: item.name || "",
      description: item.description || "",
      startdate: item.startdate || "",
      enddate: item.enddate || "",
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

    if (!form.name || !form.description || !form.startdate || !form.enddate) {
      showToast("Please fill in all fields", "error");
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await axios.put(`https://computer-excellance-academy.onrender.com/api/session/${editingId}`, form);
        showToast("Session updated successfully");
      } else {
        await axios.post("https://computer-excellance-academy.onrender.com/api/session", form);
        showToast("Session added successfully");
      }

      closeModal();
      fetchSessions();
    } catch (error) {
      showToast("Sorry, something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this session?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://computer-excellance-academy.onrender.com/api/session/${id}`);
      showToast("Session deleted successfully");
      fetchSessions();
    } catch (error) {
      showToast("Delete failed", "error");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const filteredSessions = useMemo(() => {
    const keyword = search.toLowerCase();
    return sessions.filter((item) => {
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        item.startdate?.toLowerCase().includes(keyword) ||
        item.enddate?.toLowerCase().includes(keyword)
      );
    });
  }, [sessions, search]);

  return (
    <div className="app-page">
      <div className="container">
        <AppToast
          toast={toast}
          onClose={() => setToast({ show: false, message: "", type: "success" })}
        />

        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Session Dashboard</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Create, update, and manage academic sessions in a clean professional interface.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <button type="button" onClick={openAddModal} className="app-btn-primary">
                <FiPlus className="me-2" />
                Add Session
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Total Sessions</div>
              <h4 className="fw-bold mb-0">{sessions.length}</h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Current Mode</div>
              <h4 className="fw-bold mb-0">
                {isEditing ? "Editing Session" : "Creating Session"}
              </h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Visible Records</div>
              <h4 className="fw-bold mb-0">{filteredSessions.length}</h4>
            </div>
          </div>
        </div>

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1">Session Records</h4>
                <p className="text-muted mb-0">
                  Search, edit, and manage all sessions.
                </p>
              </div>

              <div className="app-search">
                <FiSearch className="app-search__icon" />
                <input
                  type="text"
                  className="form-control app-input"
                  placeholder="Search sessions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="d-none d-md-block table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr style={{ color: "#475569" }}>
                    <th>#</th>
                    <th>Session Name</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        Loading sessions...
                      </td>
                    </tr>
                  ) : filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No sessions found.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>
                          <span className="app-badge">{item.name}</span>
                        </td>
                        <td>{item.description}</td>
                        <td>{formatDate(item.startdate)}</td>
                        <td>{formatDate(item.enddate)}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="app-btn-edit me-2"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="app-btn-delete"
                            onClick={() => handleDelete(item._id)}
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
                <div className="text-center py-4">Loading sessions...</div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-4 text-muted">No sessions found.</div>
              ) : (
                <div className="row g-3">
                  {filteredSessions.map((item, index) => (
                    <div className="col-12" key={item._id}>
                      <div className="app-mobile-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong>#{index + 1}</strong>
                          <span className="app-badge">{item.name}</span>
                        </div>

                        <div className="text-muted small mb-2">{item.description}</div>
                        <div className="text-muted small">Start: {formatDate(item.startdate)}</div>
                        <div className="text-muted small mb-3">End: {formatDate(item.enddate)}</div>

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="app-btn-edit w-50"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="app-btn-delete w-50"
                            onClick={() => handleDelete(item._id)}
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

        <AppModal
          open={modalOpen}
          onClose={closeModal}
          isEditing={isEditing}
          title={isEditing ? "Edit Session" : "Add New Session"}
          subtitle="Enter session details before saving."
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Session Name</label>
              <div className="app-input-wrap">
                <FiType className="app-input__icon" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="Enter session name"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <div className="app-input-wrap">
                <FiFileText className="app-input__icon top" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="form-control app-textarea"
                  placeholder="Enter session description"
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Start Date</label>
                <div className="app-input-wrap">
                  <FiCalendar className="app-input__icon" />
                  <input
                    type="date"
                    name="startdate"
                    value={form.startdate}
                    onChange={handleChange}
                    className="form-control app-input"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">End Date</label>
                <div className="app-input-wrap">
                  <FiCalendar className="app-input__icon" />
                  <input
                    type="date"
                    name="enddate"
                    value={form.enddate}
                    onChange={handleChange}
                    className="form-control app-input"
                  />
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="app-btn-primary" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Session" : "Add Session"}
              </button>

              <button type="button" onClick={closeModal} className="app-btn-soft">
                Cancel
              </button>
            </div>
          </form>
        </AppModal>
      </div>
    </div>
  );
};

export default Session;
