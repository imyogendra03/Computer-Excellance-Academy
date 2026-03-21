import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState("list");
  const [editId, setEditId] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [filterCourse, setFilterCourse] = useState("");
  const [filterType, setFilterType] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
    subject: "",
    chapter: "",
    order: 0,
    type: "free",
    fileUrl: "",
    videoLink: "",
    externalLink: "",
    isPublished: true,
    status: "active",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let url = "https://computer-excellance-academy.onrender.com/api/notes?";
      if (filterCourse) url += `courseId=${filterCourse}&`;
      if (filterType) url += `type=${filterType}`;
      const res = await axios.get(url);
      setNotes(res.data?.data || []);
    } catch {
      showToast("Notes load nahi ho paaye", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/course");
      setCourses(res.data?.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [filterCourse, filterType]);

  const resetForm = () => {
    setForm({
      title: "", description: "", course: "", subject: "",
      chapter: "", order: 0, type: "free", fileUrl: "",
      videoLink: "", externalLink: "", isPublished: true, status: "active",
    });
    setPdfFile(null);
    setEditId(null);
  };

  const handleEdit = (note) => {
    setForm({
      title: note.title || "",
      description: note.description || "",
      course: note.course?._id || note.course || "",
      subject: note.subject || "",
      chapter: note.chapter || "",
      order: note.order || 0,
      type: note.type || "free",
      fileUrl: note.fileUrl || "",
      videoLink: note.videoLink || "",
      externalLink: note.externalLink || "",
      isPublished: note.isPublished ?? true,
      status: note.status || "active",
    });
    setEditId(note._id);
    setMode("form");
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return form.fileUrl;
    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      const res = await axios.post(
        "https://computer-excellance-academy.onrender.com/api/notes/upload-pdf",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data?.fileUrl || "";
    } catch (err) {
      console.error("PDF upload error:", err);
      showToast("PDF upload failed", "error");
      return "";
    }
  };

  const handleSubmit = async () => {
    if (!form.title) return showToast("Title required", "error");
    try {
      setUploading(true);
      let fileUrl = form.fileUrl;
      if (pdfFile) fileUrl = await handlePdfUpload();

      const payload = { ...form, fileUrl };

      if (editId) {
        await axios.put(`https://computer-excellance-academy.onrender.com/api/notes/${editId}`, payload);
        showToast("Note updated successfully");
      } else {
        await axios.post("https://computer-excellance-academy.onrender.com/api/notes", payload);
        showToast("Note created successfully");
      }

      resetForm();
      setMode("list");
      fetchNotes();
    } catch {
      showToast("Save failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await axios.delete(`https://computer-excellance-academy.onrender.com/api/notes/${id}`);
      showToast("Note deleted");
      fetchNotes();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  return (
    <>
      <style>{`
        .an-page { min-height: 100vh; background: linear-gradient(180deg,#f8fbff,#eef4ff); }
        .an-hero { padding: 32px; border-radius: 28px; color: #fff; background: linear-gradient(135deg,#0f172a,#1d4ed8,#4f46e5); box-shadow: 0 20px 45px rgba(37,99,235,0.22); margin-bottom: 24px; }
        .an-panel { background: #fff; border-radius: 24px; box-shadow: 0 16px 40px rgba(15,23,42,0.08); padding: 24px; }
        .an-btn { border: none; color: #fff; font-weight: 600; border-radius: 12px; padding: 10px 18px; cursor: pointer; }
        .an-btn-primary { background: linear-gradient(135deg,#2563eb,#4f46e5); }
        .an-btn-success { background: linear-gradient(135deg,#16a34a,#15803d); }
        .an-btn-danger { background: linear-gradient(135deg,#dc2626,#ef4444); }
        .an-btn-secondary { background: #64748b; }
        .an-input { width: 100%; padding: 11px 14px; border: 2px solid #e2e8f0; border-radius: 12px; outline: none; font-size: 0.9rem; }
        .an-input:focus { border-color: #2563eb; }
        .an-label { font-weight: 600; font-size: 0.85rem; color: #374151; margin-bottom: 6px; display: block; }
        .an-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .an-badge-free { background: #dcfce7; color: #16a34a; }
        .an-badge-paid { background: #fef3c7; color: #d97706; }
        .an-badge-pub { background: #dbeafe; color: #1d4ed8; }
        .an-badge-unpub { background: #fee2e2; color: #dc2626; }
        .an-toast { position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 280px; color: #fff; padding: 14px 16px; border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
        .an-toast.success { background: linear-gradient(135deg,#2563eb,#4f46e5); }
        .an-toast.error { background: linear-gradient(135deg,#dc2626,#ef4444); }
        .an-select { width: 100%; padding: 11px 14px; border: 2px solid #e2e8f0; border-radius: 12px; outline: none; font-size: 0.9rem; background: #fff; }
        .an-select:focus { border-color: #2563eb; }
        .an-type-toggle { display: flex; gap: 10px; }
        .an-type-btn { flex: 1; padding: 10px; border-radius: 12px; border: 2px solid #e2e8f0; background: #fff; font-weight: 600; cursor: pointer; }
        .an-type-btn.active-free { border-color: #16a34a; background: #dcfce7; color: #16a34a; }
        .an-type-btn.active-paid { border-color: #d97706; background: #fef3c7; color: #d97706; }
        .an-note-card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; margin-bottom: 14px; }
        .an-note-card:hover { border-color: #93c5fd; box-shadow: 0 8px 24px rgba(37,99,235,0.08); }
      `}</style>

      {toast.show && (
        <div className={`an-toast ${toast.type}`}>{toast.message}</div>
      )}

      <div className="an-page">
        <div className="container py-4">

          <div className="an-hero">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h2 className="fw-bold mb-2">Notes Management</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Course aur subject wise notes, PDFs, videos manage karo.
                </p>
              </div>
              {mode === "list" ? (
                <button className="an-btn an-btn-primary" onClick={() => { resetForm(); setMode("form"); }}>
                  + Add Note
                </button>
              ) : (
                <button className="an-btn an-btn-secondary" onClick={() => { resetForm(); setMode("list"); }}>
                  ← Back to List
                </button>
              )}
            </div>
          </div>

          {mode === "list" ? (
            <div className="an-panel">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <select className="an-select" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                    <option value="">All Courses</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select className="an-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-center">
                  <span className="text-muted">{notes.length} notes found</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5 text-muted">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="text-center py-5 text-muted">Koi note nahi mila. "+ Add Note" se banao.</div>
              ) : (
                notes.map((note) => (
                  <div className="an-note-card" key={note._id}>
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                      <div style={{ flex: 1 }}>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                          <strong>{note.title}</strong>
                          <span className={`an-badge an-badge-${note.type}`}>{note.type}</span>
                          <span className={`an-badge ${note.isPublished ? "an-badge-pub" : "an-badge-unpub"}`}>
                            {note.isPublished ? "Published" : "Unpublished"}
                          </span>
                        </div>
                        <div className="text-muted small mb-1">
                          📚 {note.course?.title || "No Course"} &nbsp;|&nbsp;
                          📂 {note.subject || "-"} &nbsp;|&nbsp;
                          📖 {note.chapter || "-"}
                        </div>
                        {note.description && (
                          <div className="text-muted small">{note.description}</div>
                        )}
                        <div className="d-flex gap-3 mt-2 flex-wrap">
                          {note.fileUrl && <span className="text-primary small">📄 PDF attached</span>}
                          {note.videoLink && <span className="text-danger small">🎬 Video linked</span>}
                          {note.externalLink && <span className="text-success small">🔗 External link</span>}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="an-btn an-btn-primary" style={{ padding: "8px 14px" }} onClick={() => handleEdit(note)}>Edit</button>
                        <button className="an-btn an-btn-danger" style={{ padding: "8px 14px" }} onClick={() => handleDelete(note._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="an-panel">
              <h4 className="fw-bold mb-4">{editId ? "Edit Note" : "Add New Note"}</h4>

              <div className="row g-3">
                <div className="col-12">
                  <label className="an-label">Title *</label>
                  <input className="an-input" placeholder="Note title..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>

                <div className="col-12">
                  <label className="an-label">Description</label>
                  <textarea className="an-input" rows={3} placeholder="Short description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="an-label">Course</label>
                  <select className="an-select" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="an-label">Subject</label>
                  <input className="an-input" placeholder="e.g. Mathematics, English..." value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="an-label">Chapter / Lecture</label>
                  <input className="an-input" placeholder="e.g. Chapter 1, Lecture 3..." value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="an-label">Order (sequence number)</label>
                  <input type="number" className="an-input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                </div>

                <div className="col-12">
                  <label className="an-label">Note Type</label>
                  <div className="an-type-toggle">
                    <button type="button" className={`an-type-btn ${form.type === "free" ? "active-free" : ""}`} onClick={() => setForm({ ...form, type: "free" })}>
                      🆓 Free
                    </button>
                    <button type="button" className={`an-type-btn ${form.type === "paid" ? "active-paid" : ""}`} onClick={() => setForm({ ...form, type: "paid" })}>
                      💰 Paid
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <label className="an-label">Upload PDF</label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="an-input"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                  />
                  {form.fileUrl && !pdfFile && (
                    <div className="mt-2 text-success small">✅ PDF already uploaded</div>
                  )}
                  {pdfFile && (
                    <div className="mt-2 text-primary small">📄 {pdfFile.name} selected</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="an-label">Video Link (YouTube)</label>
                  <input className="an-input" placeholder="https://youtube.com/watch?v=..." value={form.videoLink} onChange={(e) => setForm({ ...form, videoLink: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="an-label">External Link (Google Drive etc.)</label>
                  <input className="an-input" placeholder="https://drive.google.com/..." value={form.externalLink} onChange={(e) => setForm({ ...form, externalLink: e.target.value })} />
                </div>

                <div className="col-md-6">
                  <label className="an-label">Published</label>
                  <select className="an-select" value={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.value === "true" })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="an-label">Status</label>
                  <select className="an-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-12 d-flex gap-3 mt-2">
                  <button className="an-btn an-btn-success" onClick={handleSubmit} disabled={uploading}>
                    {uploading ? "Saving..." : editId ? "Update Note" : "Save Note"}
                  </button>
                  <button className="an-btn an-btn-secondary" onClick={() => { resetForm(); setMode("list"); }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminNotes;
