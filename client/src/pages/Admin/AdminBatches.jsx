import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBookOpen, FiCalendar, FiDollarSign, FiEdit3, FiGlobe, FiLayers, FiPlus, FiSearch, FiTag, FiType, FiClock, FiUsers, FiX, FiCheck, FiTrash2, FiActivity
} from "react-icons/fi";
import AppToast from "../../components/ui/AppToast";
import AppModal from "../../components/ui/AppModal";
import "../../components/ui/app-ui.css";

const initialForm = {
  course: "", batchName: "", batchCode: "", description: "", price: "", discountPrice: "",
  startDate: "", endDate: "", duration: "", mode: "online", thumbnail: "", maxStudents: "",
  isPublished: true, accessStatus: "open", status: "active", featuresText: "",
};

const AdminBatches = () => {
  const [form, setForm] = useState(initialForm);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const isEditing = Boolean(editingId);
  const apiUrl = import.meta.env.VITE_API_URL;

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${apiUrl}/api/course`, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(res?.data?.data || []);
    } catch (error) { showToast("Error loading course catalog", "error"); }
  };

  const fetchBatches = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${apiUrl}/api/batch`, { headers: { Authorization: `Bearer ${token}` } });
      setBatches(res?.data?.data || []);
    } catch (error) { showToast("Error retrieving batch records", "error"); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchCourses(); fetchBatches(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course || !form.batchName || !form.price) { showToast("Required: Course, Batch Name, Price", "error"); return; }
    try {
      setSaving(true);
      const payload = { ...form, price: Number(form.price), discountPrice: Number(form.discountPrice), maxStudents: Number(form.maxStudents), features: form.featuresText ? form.featuresText.split(",").map(t => t.trim()).filter(Boolean) : [] };
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditing) await axios.put(`${apiUrl}/api/batch/${editingId}`, payload, config);
      else await axios.post(`${apiUrl}/api/batch`, payload, config);
      showToast(isEditing ? "Batch updated successfully" : "New batch deployed");
      setModalOpen(false); fetchBatches();
    } catch (error) { showToast("Operation failed", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanent Action: Delete this batch?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${apiUrl}/api/batch/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Batch terminated"); fetchBatches();
    } catch (error) { showToast("Direct conflict detected during delete", "error"); }
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

  const filteredBatches = useMemo(() => {
    const keyword = search.toLowerCase();
    return batches.filter((item) => {
      return (
        item.batchName?.toLowerCase().includes(keyword) ||
        item.batchCode?.toLowerCase().includes(keyword) ||
        item.course?.title?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
      );
    });
  }, [batches, search]);

  const openAddModal = () => {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setForm({
      ...item,
      course: item.course?._id || item.course,
      featuresText: item.features?.join(", ") || "",
      startDate: item.startDate ? String(item.startDate).slice(0, 10) : "",
      endDate: item.endDate ? String(item.endDate).slice(0, 10) : "",
    });
    setEditingId(item._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="app-page">
      <AppToast
        toast={toast}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />
      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Batch Dashboard</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Create, update, and manage learning batches in a clean professional interface.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <button type="button" onClick={openAddModal} className="app-btn-primary">
                <FiPlus className="me-2" />
                Add Batch
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Total Batches</div>
              <h4 className="fw-bold mb-0">{batches.length}</h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Active Batches</div>
              <h4 className="fw-bold mb-0">{batches.filter(b => b.status === 'active').length}</h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Visible Records</div>
              <h4 className="fw-bold mb-0">{filteredBatches.length}</h4>
            </div>
          </div>
        </div>

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1">Batch Records</h4>
                <p className="text-muted mb-0">
                  Search, edit, and manage all batches.
                </p>
              </div>

              <div className="app-search">
                <FiSearch className="app-search__icon" />
                <input
                  type="text"
                  className="form-control app-input"
                  placeholder="Search batches..."
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
                    <th>Batch Name</th>
                    <th>Course</th>
                    <th>Price</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        Loading batches...
                      </td>
                    </tr>
                  ) : filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No batches found.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>
                          <div>
                            <span className="fw-bold text-dark">{item.batchName}</span>
                            <div className="small text-muted">{item.batchCode || "N/A"}</div>
                          </div>
                        </td>
                        <td>
                          <span className="app-badge">{item.course?.title || "N/A"}</span>
                        </td>
                        <td>
                          <span className="fw-bold">₹{item.price}</span>
                          {item.discountPrice && item.discountPrice !== item.price && (
                            <div className="small text-muted text-decoration-line-through">
                              ₹{item.discountPrice}
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <span className={`app-badge ${item.isPublished ? "bg-success" : "bg-warning"}`}>
                            {item.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
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
                <div className="text-center py-4">Loading batches...</div>
              ) : filteredBatches.length === 0 ? (
                <div className="text-center py-4 text-muted">No batches found.</div>
              ) : (
                <div className="row g-3">
                  {filteredBatches.map((item, index) => (
                    <div className="col-12" key={item._id}>
                      <div className="app-mobile-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong>#{index + 1}</strong>
                          <span className="app-badge">{item.batchName}</span>
                        </div>

                        <div className="text-muted small mb-2">{item.course?.title || "N/A"}</div>
                        <div className="text-muted small">Price: ₹{item.price}</div>
                        {item.discountPrice && item.discountPrice !== item.price && (
                          <div className="text-muted small text-decoration-line-through">
                            ₹{item.discountPrice}
                          </div>
                        )}
                        <div className="text-muted small mb-3">
                          Status: {item.isPublished ? "Published" : "Draft"}
                        </div>

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
          title={isEditing ? "Edit Batch" : "Add New Batch"}
          subtitle="Enter batch details before saving."
        >
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Course</label>
                <div className="app-input-wrap">
                  <FiBookOpen className="app-input__icon" />
                  <select
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    className="form-select app-input"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Batch Name</label>
                <div className="app-input-wrap">
                  <FiType className="app-input__icon" />
                  <input
                    type="text"
                    name="batchName"
                    value={form.batchName}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="e.g. Master Class 2024"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">List Price (₹)</label>
                <div className="app-input-wrap">
                  <FiDollarSign className="app-input__icon" />
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="form-control app-input"
                    required
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Discount Price (₹)</label>
                <div className="app-input-wrap">
                  <FiTag className="app-input__icon" />
                  <input
                    type="number"
                    name="discountPrice"
                    value={form.discountPrice}
                    onChange={handleChange}
                    className="form-control app-input"
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Batch Mode</label>
                <div className="app-input-wrap">
                  <FiGlobe className="app-input__icon" />
                  <select
                    name="mode"
                    value={form.mode}
                    onChange={handleChange}
                    className="form-select app-input"
                  >
                    <option value="online">Online Stream</option>
                    <option value="offline">In-Person Class</option>
                    <option value="recorded">Recorded Library</option>
                    <option value="live">Live Class</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Duration</label>
                <div className="app-input-wrap">
                  <FiClock className="app-input__icon" />
                  <input
                    type="text"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="e.g. 3 Months"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Batch Code</label>
                <div className="app-input-wrap">
                  <FiType className="app-input__icon" />
                  <input
                    type="text"
                    name="batchCode"
                    value={form.batchCode}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="CEA-WD-2026"
                  />
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Start Date</label>
                <div className="app-input-wrap">
                  <FiCalendar className="app-input__icon" />
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate ? String(form.startDate).slice(0, 10) : ""}
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
                    name="endDate"
                    value={form.endDate ? String(form.endDate).slice(0, 10) : ""}
                    onChange={handleChange}
                    className="form-control app-input"
                  />
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Thumbnail URL</label>
                <div className="app-input-wrap">
                  <FiType className="app-input__icon" />
                  <input
                    type="text"
                    name="thumbnail"
                    value={form.thumbnail}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="https://...banner.jpg"
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Max Students</label>
                <div className="app-input-wrap">
                  <FiUsers className="app-input__icon" />
                  <input
                    type="number"
                    name="maxStudents"
                    value={form.maxStudents}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Access Status</label>
                <div className="app-input-wrap">
                  <select
                    name="accessStatus"
                    value={form.accessStatus}
                    onChange={handleChange}
                    className="form-select app-input"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <div className="app-input-wrap">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  className="form-control app-textarea"
                  placeholder="Write what this batch includes, who it is for, and learning outcomes..."
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Features (comma separated)</label>
              <div className="app-input-wrap">
                <textarea
                  name="featuresText"
                  value={form.featuresText}
                  onChange={handleChange}
                  rows="3"
                  className="form-control app-textarea"
                  placeholder="Recorded lectures, PDF notes, chapter tests, mentor support, certificate..."
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Visibility</label>
                <div className="app-input-wrap">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-select app-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Publish Status</label>
                <div className="form-check form-switch pt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fw-semibold">
                    Visible to learners
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="app-btn-primary" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Batch" : "Add Batch"}
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

export default AdminBatches;
