import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiCalendar,
  FiDollarSign,
  FiEdit3,
  FiGlobe,
  FiLayers,
  FiPlus,
  FiSearch,
  FiTag,
  FiType,
} from "react-icons/fi";
import AppToast from "../../components/ui/AppToast";
import AppModal from "../../components/ui/AppModal";
import "../../components/ui/app-ui.css";

const initialForm = {
  course: "",
  batchName: "",
  batchCode: "",
  description: "",
  price: "",
  discountPrice: "",
  startDate: "",
  endDate: "",
  duration: "",
  mode: "online",
  thumbnail: "",
  maxStudents: "",
  isPublished: true,
  accessStatus: "open",
  status: "active",
  featuresText: "",
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

  const fetchCourses = async () => {
    try {
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/course");
      setCourses(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load courses", "error");
    }
  };

  const fetchBatches = async () => {
    try {
      setFetching(true);
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/batch");
      setBatches(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load batches", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchBatches();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setForm({
      course: item.course?._id || item.course || "",
      batchName: item.batchName || "",
      batchCode: item.batchCode || "",
      description: item.description || "",
      price: item.price || "",
      discountPrice: item.discountPrice || "",
      startDate: item.startDate ? item.startDate.slice(0, 10) : "",
      endDate: item.endDate ? item.endDate.slice(0, 10) : "",
      duration: item.duration || "",
      mode: item.mode || "online",
      thumbnail: item.thumbnail || "",
      maxStudents: item.maxStudents || "",
      isPublished: item.isPublished ?? true,
      accessStatus: item.accessStatus || "open",
      status: item.status || "active",
      featuresText: Array.isArray(item.features) ? item.features.join(", ") : "",
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

    if (!form.course || !form.batchName || !form.price) {
      showToast("Please fill course, batch name and price", "error");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        price: Number(form.price || 0),
        discountPrice: Number(form.discountPrice || 0),
        maxStudents: Number(form.maxStudents || 0),
        features: form.featuresText
          ? form.featuresText.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
      };

      delete payload.featuresText;

      if (isEditing) {
        await axios.put(`https://computer-excellance-academy.onrender.com/api/batch/${editingId}`, payload);
        showToast("Batch updated successfully");
      } else {
        await axios.post("https://computer-excellance-academy.onrender.com/api/batch", payload);
        showToast("Batch added successfully");
      }

      closeModal();
      fetchBatches();
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Sorry, something went wrong",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this batch?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://computer-excellance-academy.onrender.com/api/batch/${id}`);
      showToast("Batch deleted successfully");
      fetchBatches();
    } catch (error) {
      showToast("Delete failed", "error");
    }
  };

  const filteredBatches = useMemo(() => {
    const keyword = search.toLowerCase();
    return batches.filter((item) => {
      return (
        item.batchName?.toLowerCase().includes(keyword) ||
        item.batchCode?.toLowerCase().includes(keyword) ||
        item.course?.title?.toLowerCase().includes(keyword) ||
        item.mode?.toLowerCase().includes(keyword)
      );
    });
  }, [batches, search]);

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
              <h2 className="fw-bold mb-2">Batch Dashboard</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Create, price, publish, and manage batches course-wise from one place.
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
              <div className="app-label-muted">Current Mode</div>
              <h4 className="fw-bold mb-0">
                {isEditing ? "Editing Batch" : "Creating Batch"}
              </h4>
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
                  Search, edit, and manage all course batches.
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
                    <th>Batch</th>
                    <th>Course</th>
                    <th>Price</th>
                    <th>Mode</th>
                    <th>Published</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        Loading batches...
                      </td>
                    </tr>
                  ) : filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No batches found.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="fw-semibold">{item.batchName}</div>
                          <div className="text-muted small">{item.batchCode || "-"}</div>
                        </td>
                        <td>{item.course?.title || "-"}</td>
                        <td>
                          ₹{item.price}
                          {item.discountPrice > 0 && (
                            <div className="text-muted small">
                              Offer: ₹{item.discountPrice}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="app-badge">{item.mode}</span>
                        </td>
                        <td>{item.isPublished ? "Yes" : "No"}</td>
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
                          <span className="app-badge">{item.mode}</span>
                        </div>

                        <div className="fw-semibold">{item.batchName}</div>
                        <div className="text-muted small mb-1">
                          Course: {item.course?.title || "-"}
                        </div>
                        <div className="text-muted small mb-1">
                          Price: ₹{item.price}
                        </div>
                        <div className="text-muted small mb-3">
                          Published: {item.isPublished ? "Yes" : "No"}
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
            <div className="mb-3">
              <label className="form-label fw-semibold">Select Course</label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className="form-control app-input"
              >
                <option value="">Select course</option>
                {courses.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Batch Name</label>
                <div className="app-input-wrap">
                  <FiLayers className="app-input__icon" />
                  <input
                    type="text"
                    name="batchName"
                    value={form.batchName}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="Enter batch name"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Batch Code</label>
                <div className="app-input-wrap">
                  <FiTag className="app-input__icon" />
                  <input
                    type="text"
                    name="batchCode"
                    value={form.batchCode}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="EXM-APR-2026"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <div className="app-input-wrap">
                <FiType className="app-input__icon top" />
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="form-control app-textarea"
                  placeholder="Enter batch description"
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Price</label>
                <div className="app-input-wrap">
                  <FiDollarSign className="app-input__icon" />
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Discount Price</label>
                <div className="app-input-wrap">
                  <FiDollarSign className="app-input__icon" />
                  <input
                    type="number"
                    name="discountPrice"
                    value={form.discountPrice}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="4500"
                  />
                </div>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Start Date</label>
                <div className="app-input-wrap">
                  <FiCalendar className="app-input__icon" />
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
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
                    value={form.endDate}
                    onChange={handleChange}
                    className="form-control app-input"
                  />
                </div>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="2 Months"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Mode</label>
                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className="form-control app-input"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="recorded">Recorded</option>
                  <option value="live">Live</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Max Students</label>
                <input
                  type="number"
                  name="maxStudents"
                  value={form.maxStudents}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Features</label>
              <textarea
                name="featuresText"
                value={form.featuresText}
                onChange={handleChange}
                rows="3"
                className="form-control app-textarea"
                placeholder="Live classes, Study material, Doubt support"
              />
              <small className="text-muted">
                Comma se separate karein.
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Thumbnail URL</label>
              <div className="app-input-wrap">
                <FiBookOpen className="app-input__icon" />
                <input
                  type="text"
                  name="thumbnail"
                  value={form.thumbnail}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="Image URL"
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Access Status</label>
                <select
                  name="accessStatus"
                  value={form.accessStatus}
                  onChange={handleChange}
                  className="form-control app-input"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="form-control app-input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                    className="form-check-input"
                    id="batchPublished"
                  />
                  <label className="form-check-label fw-semibold" htmlFor="batchPublished">
                    Published
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
