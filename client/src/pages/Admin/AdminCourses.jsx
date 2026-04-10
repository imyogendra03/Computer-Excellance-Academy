import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBookOpen, FiFileText, FiImage, FiLayers, FiPlus, FiSearch, FiTag, FiType, FiClock, FiUsers, FiBook, FiCheck, FiX, FiActivity, FiEdit3, FiTrash2, FiTrendingUp
} from "react-icons/fi";
import AppToast from "../../components/ui/AppToast";
import AppModal from "../../components/ui/AppModal";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";
import "../../components/ui/app-ui.css";

const initialForm = {
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  category: "",
  level: "Beginner",
  duration: "",
  lessons: "",
  students: "",
  thumbnail: "",
  icon: "",
  highlightTag: "",
  isPublished: true,
  status: "active",
};

const AdminCourses = () => {
  const [form, setForm] = useState(initialForm);
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
      setFetching(true);
      const res = await axios.get(`${apiUrl}/api/course`);
      setCourses(res?.data?.data || []);
    } catch (error) { 
      showToast("Error retrieving course registry", "error"); 
    } finally { setFetching(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.slug) { showToast("Title and Slug are required protocols", "error"); return; }
    try {
      setSaving(true);
      const payload = { ...form, lessons: Number(form.lessons || 0), students: Number(form.students || 0) };
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditing) await axios.put(`${apiUrl}/api/course/${editingId}`, payload, config);
      else await axios.post(`${apiUrl}/api/course`, payload, config);
      showToast(isEditing ? "Course parameters updated" : "New course initialized");
      setModalOpen(false); fetchCourses();
    } catch (error) { 
      showToast("Sync failure: Resource conflict", "error"); 
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Terminate course record permanently?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${apiUrl}/api/course/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Course removed from registry"); fetchCourses();
    } catch (error) { showToast("Deletion protocol denied", "error"); }
  };

  const handleEdit = (course) => {
    setForm({
      ...initialForm,
      ...course,
      lessons: course.lessons || "",
      students: course.students || "",
    });
    setEditingId(course._id);
    setModalOpen(true);
  };

  const filteredCourses = useMemo(() => {
    const k = search.toLowerCase();
    return courses.filter(i => (i.title || "").toLowerCase().includes(k) || (i.category || "").toLowerCase().includes(k));
  }, [courses, search]);

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
              <h2 className="fw-bold mb-2">Course Dashboard</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Create, update, and manage courses in a clean professional interface.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <button type="button" onClick={() => { setForm(initialForm); setEditingId(null); setModalOpen(true); }} className="app-btn-primary">
                <FiPlus className="me-2" />
                Add Course
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Total Courses</div>
              <h4 className="fw-bold mb-0">{courses.length}</h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Published Courses</div>
              <h4 className="fw-bold mb-0">{courses.filter(c => c.isPublished).length}</h4>
            </div>
          </div>

          <div className="col-md-4">
            <div className="app-stat-card">
              <div className="app-label-muted">Visible Records</div>
              <h4 className="fw-bold mb-0">{filteredCourses.length}</h4>
            </div>
          </div>
        </div>

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1">Course Records</h4>
                <p className="text-muted mb-0">
                  Search, edit, and manage all courses.
                </p>
              </div>

              <div className="app-search">
                <FiSearch className="app-search__icon" />
                <input
                  type="text"
                  className="form-control app-input"
                  placeholder="Search courses..."
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
                    <th>Course Name</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        Loading courses...
                      </td>
                    </tr>
                  ) : filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        No courses found.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>
                          <div>
                            <span className="fw-bold text-dark">{item.title}</span>
                            <div className="small text-muted">{item.slug || "N/A"}</div>
                          </div>
                        </td>
                        <td>
                          <span className="app-badge">{item.category || "N/A"}</span>
                        </td>
                        <td>
                          <span className="app-badge">{item.level}</span>
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
                <div className="text-center py-4">Loading courses...</div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-4 text-muted">No courses found.</div>
              ) : (
                <div className="row g-3">
                  {filteredCourses.map((item, index) => (
                    <div className="col-12" key={item._id}>
                      <div className="app-mobile-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong>#{index + 1}</strong>
                          <span className="app-badge">{item.title}</span>
                        </div>

                        <div className="text-muted small mb-2">{item.category || "N/A"}</div>
                        <div className="text-muted small">Level: {item.level}</div>
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
          onClose={() => setModalOpen(false)}
          isEditing={isEditing}
          title={isEditing ? "Edit Course" : "Add New Course"}
          subtitle="Enter course details before saving."
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Course Title</label>
              <div className="app-input-wrap">
                <FiBookOpen className="app-input__icon" />
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="Enter course title"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Course Slug</label>
              <div className="app-input-wrap">
                <FiTag className="app-input__icon" />
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="Enter course slug"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Short Description</label>
              <div className="app-input-wrap">
                <FiFileText className="app-input__icon top" />
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  rows="3"
                  className="form-control app-textarea"
                  placeholder="Enter short description"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Full Description</label>
              <div className="app-input-wrap">
                <FiFileText className="app-input__icon top" />
                <textarea
                  name="fullDescription"
                  value={form.fullDescription}
                  onChange={handleChange}
                  rows="4"
                  className="form-control app-textarea"
                  placeholder="Enter full description"
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Category</label>
                <div className="app-input-wrap">
                  <FiTag className="app-input__icon" />
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="Enter category"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Difficulty Level</label>
                <div className="app-input-wrap">
                  <FiLayers className="app-input__icon" />
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="form-control app-input"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-3">
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
                    placeholder="e.g. 6 Months"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Lessons</label>
                <div className="app-input-wrap">
                  <FiBookOpen className="app-input__icon" />
                  <input
                    type="number"
                    name="lessons"
                    value={form.lessons}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="e.g. 24"
                  />
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Enrolled Students</label>
                <div className="app-input-wrap">
                  <FiUsers className="app-input__icon" />
                  <input
                    type="number"
                    name="students"
                    value={form.students}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="e.g. 1500"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Published</label>
                <div className="form-check form-switch pt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Publish this course</label>
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="app-btn-primary" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Course" : "Add Course"}
              </button>

              <button type="button" onClick={() => setModalOpen(false)} className="app-btn-soft">
                Cancel
              </button>
            </div>
          </form>
        </AppModal>
      </div>
    </div>
  );
};

export default AdminCourses;
