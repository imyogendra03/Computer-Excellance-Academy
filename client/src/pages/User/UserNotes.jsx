import React, { useEffect, useState } from "react";
import axios from "axios";

const UserNotes = () => {
  const userId = localStorage.getItem("userId");
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [previewNote, setPreviewNote] = useState(null);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchPurchasedBatches = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/examinee/${userId}/my-batches`);
      const batches = res?.data?.data || [];
      const courseIds = batches.map((b) => String(b.course?._id || b.course));
      setPurchasedCourseIds(courseIds);
    } catch {}
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/course");
      setCourses(res.data?.data || []);
    } catch {}
  };

  const fetchNotes = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:5000/api/notes/user?";
      if (filterCourse) url += `courseId=${filterCourse}&`;
      if (filterType) url += `type=${filterType}&`;
      if (filterSubject) url += `subject=${filterSubject}`;
      const res = await axios.get(url);
      setNotes(res.data?.data || []);
    } catch {
      showToast("Notes load nahi ho paaye", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchPurchasedBatches();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [filterCourse, filterType, filterSubject]);

  const hasAccess = (note) => {
    if (note.type === "free") return true;
    return purchasedCourseIds.includes(String(note.course?._id || note.course));
  };

  const subjects = [...new Set(notes.map((n) => n.subject).filter(Boolean))];

  const grouped = notes.reduce((acc, note) => {
    const key = note.chapter || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  const getYoutubeEmbed = (url) => {
    if (!url) return "";
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <>
      <style>{`
        .un-page { min-height: 100vh; background: linear-gradient(180deg,#f8fbff,#eef4ff); }
        .un-hero { padding: 32px; border-radius: 28px; color: #fff; background: linear-gradient(135deg,#0f172a,#1d4ed8,#4f46e5); box-shadow: 0 20px 45px rgba(37,99,235,0.22); }
        .un-panel { background: #fff; border-radius: 24px; box-shadow: 0 16px 40px rgba(15,23,42,0.08); padding: 24px; }
        .un-select { width: 100%; padding: 11px 14px; border: 2px solid #e2e8f0; border-radius: 12px; outline: none; font-size: 0.9rem; background: #fff; }
        .un-select:focus { border-color: #2563eb; }
        .un-chapter-title { font-weight: 800; font-size: 1rem; color: #0f172a; padding: 10px 0 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 14px; }
        .un-note-card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px; margin-bottom: 12px; transition: 0.2s ease; }
        .un-note-card:hover { border-color: #93c5fd; box-shadow: 0 8px 24px rgba(37,99,235,0.08); }
        .un-note-card.locked { opacity: 0.65; }
        .un-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .un-badge-free { background: #dcfce7; color: #16a34a; }
        .un-badge-paid { background: #fef3c7; color: #d97706; }
        .un-btn { border: none; color: #fff; font-weight: 600; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-size: 0.82rem; }
        .un-btn-primary { background: linear-gradient(135deg,#2563eb,#4f46e5); }
        .un-btn-danger { background: linear-gradient(135deg,#dc2626,#ef4444); }
        .un-btn-green { background: linear-gradient(135deg,#16a34a,#15803d); }
        .un-locked-msg { display: inline-flex; align-items: center; gap: 6px; background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; }

        /* Fullscreen Modal */
        .un-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 9999;
          display: flex;
          flex-direction: column;
        }
        .un-modal-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: #0f172a;
          color: #fff;
          gap: 12px;
          flex-shrink: 0;
        }
        .un-modal-topbar h5 {
          margin: 0;
          font-weight: 700;
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .un-modal-tabs {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .un-modal-tab {
          border: none;
          font-weight: 600;
          border-radius: 10px;
          padding: 7px 14px;
          cursor: pointer;
          font-size: 0.82rem;
          background: rgba(255,255,255,0.12);
          color: #fff;
        }
        .un-modal-tab.active-pdf { background: #2563eb; }
        .un-modal-tab.active-video { background: #dc2626; }
        .un-modal-tab.active-external { background: #16a34a; }
        .un-modal-close {
          border: none;
          background: rgba(255,255,255,0.12);
          color: #fff;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 18px;
          flex-shrink: 0;
        }
        .un-modal-body {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .un-pdf-frame {
          width: 100%;
          height: 100%;
          border: none;
          flex: 1;
        }
        .un-video-frame {
          width: 100%;
          height: 100%;
          border: none;
          flex: 1;
        }
        .un-ext-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 16px;
          color: #fff;
        }
        .un-ext-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 14px;
          background: linear-gradient(135deg,#2563eb,#4f46e5);
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
        }

        .un-toast { position: fixed; top: 20px; right: 20px; z-index: 99999; min-width: 280px; color: #fff; padding: 14px 16px; border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.18); }
        .un-toast.success { background: linear-gradient(135deg,#2563eb,#4f46e5); }
        .un-toast.error { background: linear-gradient(135deg,#dc2626,#ef4444); }

        @media(max-width:767px){ .un-hero { padding: 24px; } }
      `}</style>

      {toast.show && <div className={`un-toast ${toast.type}`}>{toast.message}</div>}

      <div className="un-page">
        <div className="container py-4">

          {/* Hero */}
          <div className="un-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Study Notes</h2>
                <p className="mb-0" style={{ opacity: 0.88 }}>
                  Course aur subject wise notes, PDFs aur videos yahan available hain.
                  Free notes sabke liye, Paid notes purchased batch walo ke liye.
                </p>
              </div>
              <div className="col-lg-4">
                <div style={{ background: "rgba(255,255,255,0.14)", borderRadius: 18, padding: "16px 20px" }}>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>Total Notes</div>
                  <div className="fw-bold" style={{ fontSize: 28 }}>{notes.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="un-panel mb-4">
            <div className="row g-3">
              <div className="col-md-4">
                <select className="un-select" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <select className="un-select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <select className="un-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">All Types</option>
                  <option value="free">🆓 Free Notes</option>
                  <option value="paid">💰 Paid Notes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="un-panel">
            {loading ? (
              <div className="text-center py-5 text-muted">Notes load ho rahe hain...</div>
            ) : notes.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
                Abhi koi note available nahi hai.
              </div>
            ) : (
              Object.entries(grouped).map(([chapter, chapterNotes]) => (
                <div key={chapter} className="mb-4">
                  <div className="un-chapter-title">
                    📖 {chapter}
                    <span className="text-muted fw-normal" style={{ fontSize: "0.85rem", marginLeft: 8 }}>
                      ({chapterNotes.length} notes)
                    </span>
                  </div>

                  {chapterNotes.map((note) => {
                    const access = hasAccess(note);
                    return (
                      <div key={note._id} className={`un-note-card ${!access ? "locked" : ""}`}>
                        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                          <div style={{ flex: 1 }}>
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                              <strong>{note.title}</strong>
                              <span className={`un-badge un-badge-${note.type}`}>
                                {note.type === "free" ? "🆓 Free" : "💰 Paid"}
                              </span>
                            </div>
                            {note.description && (
                              <div className="text-muted small mb-2">{note.description}</div>
                            )}
                            <div className="text-muted small">
                              📚 {note.course?.title || "-"} &nbsp;|&nbsp;
                              📂 {note.subject || "-"}
                            </div>
                          </div>

                          <div className="d-flex gap-2 flex-wrap">
                            {!access ? (
                              <span className="un-locked-msg">🔒 Batch purchase karo</span>
                            ) : (
                              <>
                                {note.fileUrl && (
                                  <button className="un-btn un-btn-primary" onClick={() => setPreviewNote({ ...note, activeTab: "pdf" })}>
                                    📄 PDF Preview
                                  </button>
                                )}
                                {note.videoLink && (
                                  <button className="un-btn un-btn-danger" onClick={() => setPreviewNote({ ...note, activeTab: "video" })}>
                                    🎬 Watch Video
                                  </button>
                                )}
                                {note.externalLink && (
                                  <button className="un-btn un-btn-green" onClick={() => setPreviewNote({ ...note, activeTab: "external" })}>
                                    🔗 Open Link
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {previewNote && (
        <div className="un-modal-overlay">
          <div className="un-modal-topbar">
            <h5>{previewNote.title}</h5>
            <div className="un-modal-tabs">
              {previewNote.fileUrl && (
                <button
                  className={`un-modal-tab ${previewNote.activeTab === "pdf" ? "active-pdf" : ""}`}
                  onClick={() => setPreviewNote({ ...previewNote, activeTab: "pdf" })}
                >
                  📄 PDF
                </button>
              )}
              {previewNote.videoLink && (
                <button
                  className={`un-modal-tab ${previewNote.activeTab === "video" ? "active-video" : ""}`}
                  onClick={() => setPreviewNote({ ...previewNote, activeTab: "video" })}
                >
                  🎬 Video
                </button>
              )}
              {previewNote.externalLink && (
                <button
                  className={`un-modal-tab ${previewNote.activeTab === "external" ? "active-external" : ""}`}
                  onClick={() => setPreviewNote({ ...previewNote, activeTab: "external" })}
                >
                  🔗 Link
                </button>
              )}
            </div>
            <button className="un-modal-close" onClick={() => setPreviewNote(null)}>✕</button>
          </div>

          <div className="un-modal-body">
            {previewNote.activeTab === "pdf" && previewNote.fileUrl && (
              <iframe src={previewNote.fileUrl} className="un-pdf-frame" title="PDF Preview" />
            )}
            {previewNote.activeTab === "video" && previewNote.videoLink && (
              <iframe src={getYoutubeEmbed(previewNote.videoLink)} className="un-video-frame" title="Video" allowFullScreen />
            )}
            {previewNote.activeTab === "external" && previewNote.externalLink && (
              <div className="un-ext-body">
                <p>Ye content external platform pe available hai:</p>
                <a href={previewNote.externalLink} target="_blank" rel="noreferrer" className="un-ext-link">
                  🔗 Open in New Tab
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserNotes;