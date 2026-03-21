import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiBookOpen, FiEdit3, FiPlus, FiSearch, FiType } from "react-icons/fi";
import AppToast from "../../components/ui/AppToast";
import AppModal from "../../components/ui/AppModal";
import "../../components/ui/app-ui.css";

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
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/subject");
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
        await axios.put(`https://computer-excellance-academy.onrender.com/api/subject/${editingId}`, form);
        showToast("Subject updated successfully");
      } else {
        await axios.post("https://computer-excellance-academy.onrender.com/api/subject", form);
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
      await axios.delete(`https://computer-excellance-academy.onrender.com/api/subject/${id}`);
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
    <div className="app-page">
      <div className="container">
        <AppToast
          toast={toast}
          onClose={() => setToast({ show: false, message: "", type: "success" })}
        />

        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Subject Dashboard</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Create, update, and manage subjects in a clean professional interface.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <button type="button" onClick={openAddModal} className="app-btn-primary">
                <FiPlus className="me-2" />
                Add Subject
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Total Subjects</div>
              <h4 className="fw-bold mb-0">{subjects.length}</h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Current Mode</div>
              <h4 className="fw-bold mb-0">
                {isEditing ? "Editing Subject" : "Creating Subject"}
              </h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Visible Records</div>
              <h4 className="fw-bold mb-0">{filteredSubjects.length}</h4>
            </div>
          </div>
        </div>

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1">Subject Records</h4>
                <p className="text-muted mb-0">
                  Search, edit, and manage all subjects.
                </p>
              </div>

              <div className="app-search">
                <FiSearch className="app-search__icon" />
                <input
                  type="text"
                  className="form-control app-input"
                  placeholder="Search subjects..."
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
                          <span className="app-badge">{item.subjectname}</span>
                        </td>
                        <td>{item.description}</td>
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
                <div className="text-center py-4">Loading subjects...</div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-4 text-muted">No subjects found.</div>
              ) : (
                <div className="row g-3">
                  {filteredSubjects.map((item, index) => (
                    <div className="col-12" key={item._id}>
                      <div className="app-mobile-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong>#{index + 1}</strong>
                          <span className="app-badge">{item.subjectname}</span>
                        </div>

                        <div className="text-muted small mb-3">{item.description}</div>

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
          title={isEditing ? "Edit Subject" : "Add New Subject"}
          subtitle="Enter subject details before saving."
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Subject Name</label>
              <div className="app-input-wrap">
                <FiBookOpen className="app-input__icon" />
                <input
                  type="text"
                  name="subjectname"
                  value={form.subjectname}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="Enter subject name"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Description</label>
              <div className="app-input-wrap">
                <FiType className="app-input__icon top" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="form-control app-textarea"
                  placeholder="Enter subject description"
                />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="app-btn-primary" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Subject" : "Add Subject"}
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

export default Subject;
