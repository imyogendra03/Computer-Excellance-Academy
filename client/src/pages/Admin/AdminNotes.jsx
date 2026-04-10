import React, { useEffect, useState, useMemo } from "react";
import {
  FiPlus, FiFolder, FiLayers,
  FiTrash2, FiEdit3, FiChevronRight,
  FiArrowLeft, FiMonitor, FiCheckCircle
} from "react-icons/fi";
import { lmsApi } from "../../services/lmsApi";
import AppModal from "../../components/ui/AppModal";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";
import { motion, AnimatePresence } from "framer-motion";
import ContentThumbnail from "../../components/ContentThumbnail";

const AdminNotes = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("batches"); // batches, subjects, chapters, manage
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const [batchMeta, setBatchMeta] = useState({ subjects: [] });
  const [batchContent, setBatchContent] = useState([]);
  const [saving, setSaving] = useState(false);

  // Modals state
  const [subjectModal, setSubjectModal] = useState(false);
  const [chapterModal, setChapterModal] = useState(false);

  const initialSubjectForm = { subjectname: "", description: "", order: 1 };
  const initialChapterForm = { title: "", order: 1 };
  const initialContentForm = {
    title: "",
    description: "",
    type: "video",
    resourceFormat: "video",
    url: "",
    thumbnail: "",
    duration: 0,
    isPublished: true,
    order: 1,
    metadataText: ""
  };

  const [subjectForm, setSubjectForm] = useState(initialSubjectForm);
  const [chapterForm, setChapterForm] = useState(initialChapterForm);
  const [contentForm, setContentForm] = useState(initialContentForm);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const parseMetadataInput = (rawText) => {
    const value = (rawText || "").trim();
    if (!value) return {};

    try {
      return JSON.parse(value);
    } catch {
      // Support plain text metadata so admin users are not blocked by JSON syntax.
      return { note: value };
    }
  };

  useEffect(() => {
    if (!thumbnailFile) {
      return undefined;
    }

    const previewUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [thumbnailFile]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await lmsApi.getBatches();
      setBatches(data);
    } catch (err) {
      showToast("Batches loading failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBatchDetails = async (batchId) => {
    try {
      setLoading(true);
      const [meta, content] = await Promise.all([
        lmsApi.getAdminBatchMeta(batchId),
        lmsApi.getBatchContent(batchId, "admin")
      ]);
      setBatchMeta(meta || { subjects: [] });
      setBatchContent(content?.flatItems || []);
    } catch (err) {
      showToast("Batch details failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = async (batch) => {
    setSelectedBatch(batch);
    await loadBatchDetails(batch._id);
    setViewMode("subjects");
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setViewMode("chapters");
  };

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setContentForm({ ...initialContentForm, batchId: selectedBatch._id, subjectId: selectedSubject._id, chapterId: chapter._id });
    setThumbnailFile(null);
    setThumbnailPreview("");
    setViewMode("manage");
  };

  const goBackToBatches = () => { setViewMode("batches"); setSelectedBatch(null); setSelectedSubject(null); setSelectedChapter(null); };
  const goBackToSubjects = () => { setViewMode("subjects"); setSelectedSubject(null); setSelectedChapter(null); };
  const goBackToChapters = () => { setViewMode("chapters"); setSelectedChapter(null); };

  // CREATE/UPDATE Handlers
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.subjectname) return showToast("Subject name required", "error");
    try {
      setSaving(true);
      if (subjectForm._id) {
        await lmsApi.updateSubject(subjectForm._id, subjectForm);
        showToast("Subject updated successfully");
      } else {
        await lmsApi.createSubject({ ...subjectForm, batchId: selectedBatch._id });
        showToast("Subject created successfully");
      }
      await loadBatchDetails(selectedBatch._id);
      setSubjectModal(false);
      setSubjectForm(initialSubjectForm);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title) return showToast("Chapter title required", "error");
    try {
      setSaving(true);
      if (chapterForm._id) {
        await lmsApi.updateChapter(chapterForm._id, chapterForm);
        showToast("Chapter updated successfully");
      } else {
        await lmsApi.createChapter({ ...chapterForm, batchId: selectedBatch._id, subjectId: selectedSubject._id });
        showToast("Chapter created successfully");
      }
      await loadBatchDetails(selectedBatch._id);
      setChapterModal(false);
      setChapterForm(initialChapterForm);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Deleting a subject will remove all its modules?")) return;
    try {
      await lmsApi.deleteSubject(id);
      showToast("Subject removed");
      await loadBatchDetails(selectedBatch._id);
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleDeleteChapter = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this chapter?")) return;
    try {
      await lmsApi.deleteChapter(id);
      showToast("Chapter removed");
      await loadBatchDetails(selectedBatch._id);
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const openEditSubject = (e, sub) => {
    e.stopPropagation();
    setSubjectForm({ _id: sub._id, subjectname: sub.title || sub.subjectname, description: sub.description || "", order: sub.order || 1 });
    setSubjectModal(true);
  };

  const openEditChapter = (e, chap) => {
    e.stopPropagation();
    setChapterForm({ _id: chap._id, title: chap.title, order: chap.order || 1 });
    setChapterModal(true);
  };

  const resetContentForm = () => {
    setContentForm({
      ...initialContentForm,
      batchId: selectedBatch?._id,
      subjectId: selectedSubject?._id,
      chapterId: selectedChapter?._id,
    });
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const buildContentPayload = () => {
    const metadata = parseMetadataInput(contentForm.metadataText);
    const basePayload = {
      ...contentForm,
      metadata,
      order: Number(contentForm.order) || 0,
      duration: Number(contentForm.duration) || 0,
      isPublished: contentForm.isPublished !== false,
    };

    if (!thumbnailFile) {
      return basePayload;
    }

    const formData = new FormData();
    Object.entries(basePayload).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (key === "metadata") {
        formData.append("metadata", JSON.stringify(value));
        return;
      }

      if (typeof value === "object" && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      formData.append(key, value);
    });

    formData.append("thumbnailFile", thumbnailFile);
    return formData;
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    if (!contentForm.title || !contentForm.url) return showToast("Title and URL required", "error");
    try {
      setSaving(true);
      const payload = buildContentPayload();
      if (contentForm._id) {
        await lmsApi.updateContent(contentForm._id, payload);
        showToast("Lecture updated successfully");
      } else {
        await lmsApi.createContent(payload);
        showToast("Lecture uploaded successfully");
      }
      await loadBatchDetails(selectedBatch._id);
      resetContentForm();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Delete this content?")) return;
    try {
      await lmsApi.deleteContent(id);
      showToast("Deleted successfully");
      await loadBatchDetails(selectedBatch._id);
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleEditContent = (item) => {
    setContentForm({
      ...item,
      metadataText: item.metadata ? JSON.stringify(item.metadata) : "",
      batchId: selectedBatch._id,
      subjectId: selectedSubject._id,
      chapterId: selectedChapter._id
    });
    setThumbnailFile(null);
    setThumbnailPreview(item.thumbnail || "");
  };

  const currentChapterItems = useMemo(
    () =>
      batchContent
        .filter((entry) => {
  const id = entry.chapterId?._id || entry.chapterId;
  return String(id) === String(selectedChapter?._id);
})
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [batchContent, selectedChapter?._id]
  );

  // UI Renderers
  const renderBatches = () => (
    loading ? <SkeletonCard count={6} /> : (
      <div className="row g-4">
        {batches.map((batch) => (
          <div className="col-lg-4 col-md-6" key={batch._id}>
            <div className="app-mobile-card clickable h-100 d-flex flex-column" onClick={() => handleBatchSelect(batch)} style={{ cursor: "pointer", transition: "0.2s" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="app-badge">Batch</div>
                <FiChevronRight className="text-primary" />
              </div>
              <h5 className="fw-bold mb-1">{batch.batchName}</h5>
              <p className="text-muted small mb-0">{batch.course?.title || "Regular Cohort"}</p>
            </div>
          </div>
        ))}
      </div>
    )
  );

  const renderSubjects = () => (
    loading ? <SkeletonCard count={3} /> : (
      <div className="row g-4">
        <div className="col-lg-4 col-md-6">
          <div className="app-mobile-card h-100 d-flex flex-column justify-content-center align-items-center text-center p-5 dashed"
            onClick={() => { setSubjectForm(initialSubjectForm); setSubjectModal(true); }}
            style={{ border: "2px dashed #cbd5e1", background: "transparent", color: "#64748b", cursor: "pointer" }}>
            <div className="mb-3" style={{ background: "#f1f5f9", width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiPlus size={24} />
            </div>
            <h6 className="fw-bold mb-1">Add New Subject</h6>
            <p className="small mb-0 opacity-75">Create a new module for this batch</p>
          </div>
        </div>
        {batchMeta.subjects.map((sub) => (
          <div className="col-lg-4 col-md-6" key={sub._id}>
            <div className="app-mobile-card clickable h-100 d-flex flex-column" onClick={() => handleSubjectSelect(sub)} style={{ cursor: "pointer", transition: "0.2s", borderLeft: "4px solid #6366f1" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <FiFolder size={20} className="text-indigo" />
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-light p-1" onClick={(e) => openEditSubject(e, sub)}><FiEdit3 size={14}/></button>
                  <button className="btn btn-sm btn-light p-1 text-danger" onClick={(e) => handleDeleteSubject(e, sub._id)}><FiTrash2 size={14}/></button>
                </div>
              </div>
              <h5 className="fw-bold mb-1">{sub.title||sub.subjectname }</h5>
              <p className="text-muted small mb-0">{sub.chapterCount || 0} Chapters available</p>
            </div>
          </div>
        ))}
      </div>
    )
  );

  const renderChapters = () => (
    loading ? <SkeletonCard count={3} /> : (
      <div className="row g-4">
        <div className="col-lg-4 col-md-6">
          <div className="app-mobile-card h-100 d-flex flex-column justify-content-center align-items-center text-center p-5 dashed"
            onClick={() => { setChapterForm(initialChapterForm); setChapterModal(true); }}
            style={{ border: "2px dashed #cbd5e1", background: "transparent", color: "#64748b", cursor: "pointer" }}>
            <FiPlus size={24} className="mb-3" />
            <h6 className="fw-bold mb-1">Add New Chapter</h6>
            <p className="small mb-0 opacity-75">Categorize your lectures</p>
          </div>
        </div>
        {(batchMeta.subjects.find(s => s._id === selectedSubject._id)?.chapters || []).map((chap) => (
          <div className="col-lg-4 col-md-6" key={chap._id}>
            <div className="app-mobile-card clickable h-100 d-flex flex-column" onClick={() => handleChapterSelect(chap)} style={{ cursor: "pointer", transition: "0.2s" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <FiLayers size={20} className="text-primary" />
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-light p-1" onClick={(e) => openEditChapter(e, chap)}><FiEdit3 size={14}/></button>
                  <button className="btn btn-sm btn-light p-1 text-danger" onClick={(e) => handleDeleteChapter(e, chap._id)}><FiTrash2 size={14} /></button>
                </div>
              </div>
              <h5 className="fw-bold mb-1">{chap.title}</h5>
              <p className="text-muted small mb-0">{chap.contentCount || 0} Lectures inside</p>
            </div>
          </div>
        ))}
      </div>
    )
  );

  return (
    <div className="app-page pb-5">
      <style>{`
        .an-upload-panel {
          border-radius: 26px;
          background: linear-gradient(180deg, #ffffff 0%, #fcf9ff 100%);
          border: 1px solid #e7dbff;
          box-shadow: 0 18px 38px rgba(31, 12, 81, 0.08);
        }
        .an-upload-header {
          padding: 18px 20px;
          border-radius: 22px;
          background: linear-gradient(135deg, #eef7ff, #f7f0ff);
          border: 1px solid #e5dbff;
        }
        .an-section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border-radius: 999px;
          background: #efe6ff;
          color: #7b4cdd;
          border: 1px solid #e4d6ff;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .an-helper {
          padding: 14px 16px;
          border-radius: 18px;
          background: #f8f5ff;
          border: 1px solid #eaddff;
          color: #5f4f87;
          font-size: 0.88rem;
          font-weight: 600;
          line-height: 1.6;
        }
        .an-select-card {
          border-radius: 24px;
          border: 1px solid rgba(111,60,242,0.12) !important;
          background: linear-gradient(180deg, #ffffff 0%, #fcf9ff 100%) !important;
          box-shadow: 0 18px 38px rgba(33,17,73,0.08);
        }
      `}</style>
      <div className="container py-4">

        {/* Navigation Breadcrumb / Hero */}
        <div className="app-hero mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              {viewMode === "batches" && (
                <>
                  <h2 className="fw-bold mb-2" style={{ color: "#22154c" }}>Curriculum & Notes Manager</h2>
                  <p className="mb-0" style={{ color: "#5f618d" }}>Select a batch to manage its subjects, chapters, and study materials.</p>
                </>
              )}
              {viewMode === "subjects" && (
                <>
                  <button onClick={goBackToBatches} className="btn btn-link p-0 mb-3 text-decoration-none d-flex align-items-center gap-2" style={{ color: "#6f3cf2" }}>
                    <FiArrowLeft /> Back to Batches
                  </button>
                  <h2 className="fw-bold mb-1" style={{ color: "#22154c" }}>{selectedBatch.batchName}</h2>
                  <p className="mb-0" style={{ color: "#5f618d" }}>Manage Subjects and Core Modules</p>
                </>
              )}
              {viewMode === "chapters" && (
                <>
                  <button onClick={goBackToSubjects} className="btn btn-link p-0 mb-3 text-decoration-none d-flex align-items-center gap-2" style={{ color: "#6f3cf2" }}>
                    <FiArrowLeft /> Back to {selectedBatch.batchName}
                  </button>
                  <h2 className="fw-bold mb-1" style={{ color: "#22154c" }}>{selectedSubject.title}</h2>
                  <p className="mb-0" style={{ color: "#5f618d" }}>Manage Chapters for this subject</p>
                </>
              )}
              {viewMode === "manage" && (
                <>
                  <button onClick={goBackToChapters} className="btn btn-link p-0 mb-3 text-decoration-none d-flex align-items-center gap-2" style={{ color: "#6f3cf2" }}>
                    <FiArrowLeft /> Back to {selectedSubject.title}
                  </button>
                  <h2 className="fw-bold mb-1" style={{ color: "#22154c" }}>{selectedChapter.title}</h2>
                  <p className="mb-0" style={{ color: "#5f618d" }}>Manage Lectures, Notes and DPPs</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Area with Framer Motion */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + (selectedBatch?._id || "")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === "batches" && renderBatches()}
            {viewMode === "subjects" && renderSubjects()}
            {viewMode === "chapters" && renderChapters()}
            {viewMode === "manage" && (
              <div>
                {/* Content Form - Full Width at Top */}
                <div className="app-panel an-upload-panel mb-4">
                  <div className="an-upload-header mb-4">
                    <div className="an-section-tag mb-2">Content Upload Studio</div>
                    <h5 className="fw-bold mb-2">{contentForm._id ? "Edit Lecture / PDF" : "Add New Lecture / PDF"}</h5>
                    <p className="text-muted small mb-0">Fill title, type, URL, duration, and thumbnail. Videos, notes, DPPs, and solutions can all be added from here.</p>
                  </div>
                  <div className="p-4">
                    <div className="an-helper mb-4">
                      Tip: use clear lecture titles, chapter-wise order numbers, and a thumbnail for better student engagement.
                    </div>
                    <form onSubmit={handleCreateContent}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="small fw-bold mb-1">Lecture Title</label>
                          <input className="app-input" value={contentForm.title} onChange={e => setContentForm({ ...contentForm, title: e.target.value })} placeholder="e.g. Introduction to HTML" />
                        </div>
                        <div className="col-md-6">
                          <label className="small fw-bold mb-1">Content Type</label>
                          <select className="app-input" value={contentForm.type} onChange={e => setContentForm({ ...contentForm, type: e.target.value, resourceFormat: e.target.value === "video" ? "video" : "pdf" })}>
                            <option value="video">Video Lecture</option>
                            <option value="note">PDF Notes</option>
                            <option value="dpp">DPP (Daily Practice)</option>
                            <option value="solution">DPP Solution</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="small fw-bold mb-1">Description</label>
                          <textarea className="app-input" rows={3} value={contentForm.description || ""} onChange={e => setContentForm({ ...contentForm, description: e.target.value })} placeholder="Short lecture summary (optional)" />
                        </div>
                        <div className="col-md-3">
                          <label className="small fw-bold mb-1">Order</label>
                          <input type="number" className="app-input" value={contentForm.order} onChange={e => setContentForm({ ...contentForm, order: e.target.value })} placeholder="1" />
                        </div>
                        <div className="col-md-3">
                          <label className="small fw-bold mb-1">Duration (sec)</label>
                          <input type="number" className="app-input" value={contentForm.duration || 0} onChange={e => setContentForm({ ...contentForm, duration: e.target.value })} placeholder="600" />
                        </div>
                        <div className="col-md-6">
                          <label className="small fw-bold mb-1">Resource URL / ID</label>
                          <input className="app-input" value={contentForm.url} onChange={e => setContentForm({ ...contentForm, url: e.target.value })} placeholder="Vimeo URL or PDF Link" />
                        </div>
                        <div className="col-md-6">
                          <label className="small fw-bold mb-1">Thumbnail URL (Optional)</label>
                          <input className="app-input" value={contentForm.thumbnail || ""} onChange={e => setContentForm({ ...contentForm, thumbnail: e.target.value })} placeholder="https://.../thumbnail.jpg" />
                        </div>
                        <div className="col-md-6">
                          <label className="small fw-bold mb-1">Upload Thumbnail (Optional)</label>
                          <input
                            type="file"
                            className="app-input"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setThumbnailFile(file);
                            }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="small fw-bold mb-2 d-block">Thumbnail Preview</label>
                          {thumbnailPreview || contentForm.thumbnail ? (
                            <img
                              src={thumbnailPreview || contentForm.thumbnail}
                              alt="Thumbnail preview"
                              style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
                            />
                          ) : (
                            <ContentThumbnail
                              item={contentForm}
                              className="w-100"
                              style={{ height: 120 }}
                              showLabel
                            />
                          )}
                        </div>
                        <div className="col-12">
                          <label className="small fw-bold mb-1">Metadata / JSON (Optional)</label>
                          <textarea className="app-input" rows={2} value={contentForm.metadataText || ""} onChange={e => setContentForm({ ...contentForm, metadataText: e.target.value })} placeholder='{"timer": 900, "questions": []} or plain note text' />
                        </div>
                        <div className="col-12">
                          <button className="app-btn-primary" type="submit" disabled={saving}>
                            {saving ? "Saving..." : contentForm._id ? "Update Lecture" : "Add to Chapter"}
                          </button>
                          {contentForm._id && <button type="button" className="btn btn-link ms-2 text-decoration-none small" onClick={resetContentForm}>Cancel Edit</button>}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Content List - Full Width Below */}
                <div className="app-panel p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Lectures & Study Material</h5>
                    <div className="app-badge">{currentChapterItems.length} Items</div>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {currentChapterItems.map((item, idx) => (
                      <div key={item._id} className="p-3 border-bottom d-flex align-items-center justify-content-between bg-hover">
                        <div className="d-flex align-items-center gap-3">
                          <ContentThumbnail
                            item={item}
                            className="rounded-3"
                            style={{ width: 72, height: 48, flexShrink: 0 }}
                            showLabel={false}
                          />
                          <div>
                            <h6 className="fw-bold mb-0">{idx + 1}. {item.title}</h6>
                            <span className="text-muted small text-uppercase">{item.type} • {item.resourceFormat}</span>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-light p-2" onClick={() => handleEditContent(item)}><FiEdit3 /></button>
                          <button className="btn btn-sm btn-soft-danger p-2" onClick={() => handleDeleteContent(item._id)}><FiTrash2 /></button>
                        </div>
                      </div>
                    ))}
                    {currentChapterItems.length === 0 && (
                      <div className="text-center py-5">
                        <FiMonitor className="text-muted mb-3" size={40} style={{ opacity: 0.3 }} />
                        <p className="text-muted">No lectures added to this chapter yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* MODALS */}
        <AppModal open={subjectModal} onClose={() => setSubjectModal(false)} title={subjectForm._id ? "Edit Subject" : "Create New Subject"} subtitle="Categorize your curriculum with subjects">
          <form onSubmit={handleCreateSubject}>
            <div className="mb-3">
              <label className="fw-bold small mb-1">Subject Name</label>
              <input className="app-input" value={subjectForm.subjectname} onChange={e => setSubjectForm({ ...subjectForm, subjectname: e.target.value })} placeholder="e.g. Advanced Javascript" />
            </div>
            <div className="mb-4">
              <label className="fw-bold small mb-1">Description</label>
              <textarea className="app-input" rows={3} value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} placeholder="Brief about this subject..." />
            </div>
            <button className="app-btn-primary w-100" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Subject"}</button>
          </form>
        </AppModal>

        <AppModal open={chapterModal} onClose={() => setChapterModal(false)} title="Manage Chapter" subtitle="Chapters help organize your lectures">
          <form onSubmit={handleCreateChapter}>
            <div className="mb-4">
              <label className="fw-bold small mb-1">Chapter Title</label>
              <input className="app-input" value={chapterForm.title} onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })} placeholder="e.g. Chapter 1: Introduction" />
            </div>
            <button className="app-btn-primary w-100" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Chapter"}</button>
          </form>
        </AppModal>

        {/* Toast */}
        {toast.show && (
          <div className={`app-toast-container ${toast.type}`}>
            <FiCheckCircle className="me-2" /> {toast.message}
          </div>
        )}
      </div>

      <style>{`
        .bg-hover:hover { background: #f8fafc; }
        .dashed:hover { border-color: #6366f1 !important; color: #6366f1 !important; }
        .app-toast-container {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          padding: 12px 20px; border-radius: 12px; color: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; align-items: center;
        }
        .app-toast-container.success { background: #2563eb; }
        .app-toast-container.error { background: #ef4444; }
      `}</style>
    </div>
  );
};

export default AdminNotes;
