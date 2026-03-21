import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiFileText,
  FiImage,
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
      setFetching(true);
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/course");
      setCourses(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load courses", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCourses();
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
      title: item.title || "",
      slug: item.slug || "",
      shortDescription: item.shortDescription || "",
      fullDescription: item.fullDescription || "",
      category: item.category || "",
      level: item.level || "Beginner",
      duration: item.duration || "",
      lessons: item.lessons || "",
      students: item.students || "",
      thumbnail: item.thumbnail || "",
      icon: item.icon || "",
      highlightTag: item.highlightTag || "",
      isPublished: item.isPublished ?? true,
      status: item.status || "active",
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

    if (!form.title || !form.slug || !form.shortDescription) {
      showToast("Please fill title, slug and short description", "error");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        lessons: Number(form.lessons || 0),
        students: Number(form.students || 0),
      };

      if (isEditing) {
        await axios.put(`https://computer-excellance-academy.onrender.com/api/course/${editingId}`, payload);
        showToast("Course updated successfully");
      } else {
        await axios.post("https://computer-excellance-academy.onrender.com/api/course", payload);
        showToast("Course added successfully");
      }

      closeModal();
      fetchCourses();
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
    const confirmed = window.confirm("Are you sure you want to delete this course?");
    if (!confirmed) return;

    try {
      await axios.delete(`https://computer-excellance-academy.onrender.com/api/course/${id}`);
      showToast("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      showToast("Delete failed", "error");
    }
  };

  const filteredCourses = useMemo(() => {
    const keyword = search.toLowerCase();
    return courses.filter((item) => {
      return (
        item.title?.toLowerCase().includes(keyword) ||
        item.slug?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.level?.toLowerCase().includes(keyword)
      );
    });
  }, [courses, search]);

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
              <h2 className="fw-bold mb-2">Course Dashboard</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Create, update, publish, and manage public courses from one place.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <button type="button" onClick={openAddModal} className="app-btn-primary">
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
              <div className="app-label-muted">Current Mode</div>
              <h4 className="fw-bold mb-0">
                {isEditing ? "Editing Course" : "Creating Course"}
              </h4>
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
                  Search, edit, and manage all public courses.
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
                    <th>Course</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Published</th>
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
                          <div className="fw-semibold">{item.title}</div>
                          <div className="text-muted small">{item.slug}</div>
                        </td>
                        <td>{item.category || "-"}</td>
                        <td>
                          <span className="app-badge">{item.level}</span>
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
                          <span className="app-badge">{item.level}</span>
                        </div>

                        <div className="fw-semibold">{item.title}</div>
                        <div className="text-muted small mb-1">{item.slug}</div>
                        <div className="text-muted small mb-1">
                          Category: {item.category || "-"}
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
              <label className="form-label fw-semibold">Slug</label>
              <div className="app-input-wrap">
                <FiTag className="app-input__icon" />
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="example-course-slug"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Short Description</label>
              <div className="app-input-wrap">
                <FiType className="app-input__icon top" />
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
                  placeholder="Enter detailed description"
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Category</label>
                <div className="app-input-wrap">
                  <FiLayers className="app-input__icon" />
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="form-control app-input"
                    placeholder="Category"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Level</label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="form-control app-input"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
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
                <label className="form-label fw-semibold">Lessons</label>
                <input
                  type="number"
                  name="lessons"
                  value={form.lessons}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="20"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Students</label>
                <input
                  type="number"
                  name="students"
                  value={form.students}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Thumbnail URL</label>
                <div className="app-input-wrap">
                  <FiImage className="app-input__icon" />
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

              <div className="col-md-6">
                <label className="form-label fw-semibold">Icon</label>
                <input
                  type="text"
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  className="form-control app-input"
                  placeholder="e.g. 💻"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Highlight Tag</label>
              <input
                type="text"
                name="highlightTag"
                value={form.highlightTag}
                onChange={handleChange}
                className="form-control app-input"
                placeholder="Most Popular"
              />
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
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

              <div className="col-md-6 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                    className="form-check-input"
                    id="isPublished"
                  />
                  <label className="form-check-label fw-semibold" htmlFor="isPublished">
                    Published
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="app-btn-primary" disabled={saving}>
                {saving ? "Saving..." : isEditing ? "Update Course" : "Add Course"}
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

export default AdminCourses;
