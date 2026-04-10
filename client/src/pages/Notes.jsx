import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBookOpen,
  FiDownload,
  FiExternalLink,
  FiFileText,
  FiLock,
  FiPlayCircle,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { SkeletonCard } from "../components/ui/SkeletonLoader";
import { cachedJsonFetch } from "../services/publicDataCache";
import MainNavbar from "../components/navigation/MainNavbar";
import LegacyFooter from "../components/layout/LegacyFooter";
import { useSEO } from "../components/SEOHelmet";
import { seoConfig } from "../config/seoConfig";

/* ✅ PDF ICON FOR NOTES DISPLAY */
const PdfIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 90 90"
    aria-hidden="true"
    className={className}
  >
    <path d="M 78.806 62.716 V 20.496 c 0 -1.214 -0.473 -2.356 -1.332 -3.216 L 61.526 1.332 C 60.667 0.473 59.525 0 58.31 0 H 15.742 c -2.508 0 -4.548 2.04 -4.548 4.548 V 43.16 v 19.556 C 34.114 65.376 56.665 65.47 78.806 62.716 z" fill="rgb(220,223,225)" />
    <path d="M 11.194 62.716 v 11.23 v 11.506 c 0 2.508 2.04 4.548 4.548 4.548 h 58.517 c 2.508 0 4.548 -2.04 4.548 -4.548 V 62.716 H 11.194 z" fill="rgb(234,84,64)" />
    <polygon points="60.27,18.41 78.81,36.88 78.73,19.73" fill="rgb(196,203,210)" />
    <path d="M 77.474 17.28 L 61.526 1.332 c -0.675 -0.676 -1.529 -1.102 -2.453 -1.258 v 15.382 c 0 2.358 1.919 4.277 4.277 4.277 h 15.382 C 78.576 18.81 78.15 17.956 77.474 17.28 z" fill="rgb(171,178,184)" />
    <path d="M 33.092 68.321 h -4.374 c -0.69 0 -1.25 0.56 -1.25 1.25 v 8.091 v 5.541 c 0 0.69 0.56 1.25 1.25 1.25 s 1.25 -0.56 1.25 -1.25 v -4.291 h 3.124 c 2.254 0 4.088 -1.834 4.088 -4.088 v -2.415 C 37.18 70.155 35.346 68.321 33.092 68.321 z M 34.68 74.824 c 0 0.876 -0.712 1.588 -1.588 1.588 h -3.124 v -5.591 h 3.124 c 0.876 0 1.588 0.712 1.588 1.588 V 74.824 z" fill="rgb(255,255,255)" />
    <path d="M 45.351 84.453 H 41.27 c -0.69 0 -1.25 -0.56 -1.25 -1.25 V 69.571 c 0 -0.69 0.56 -1.25 1.25 -1.25 h 4.082 c 2.416 0 4.38 1.965 4.38 4.38 v 7.371 C 49.731 82.488 47.767 84.453 45.351 84.453 z M 42.52 81.953 h 2.832 c 1.037 0 1.88 -0.844 1.88 -1.881 v -7.371 c 0 -1.036 -0.844 -1.88 -1.88 -1.88 H 42.52 V 81.953 z" fill="rgb(255,255,255)" />
    <path d="M 61.282 68.321 H 54.07 c -0.69 0 -1.25 0.56 -1.25 1.25 v 13.632 c 0 0.69 0.56 1.25 1.25 1.25 s 1.25 -0.56 1.25 -1.25 v -5.566 h 3.473 c 0.69 0 1.25 -0.56 1.25 -1.25 s -0.56 -1.25 -1.25 -1.25 H 55.32 v -4.315 h 5.962 c 0.69 0 1.25 -0.56 1.25 -1.25 S 61.973 68.321 61.282 68.321 z" fill="rgb(255,255,255)" />
    <path d="M 60.137 40.012 c -0.154 -0.374 -0.52 -0.617 -0.924 -0.617 h -4.805 V 27.616 c 0 -0.552 -0.447 -1 -1 -1 H 40.592 c -0.552 0 -1 0.448 -1 1 v 11.778 h -4.805 c -0.404 0 -0.769 0.244 -0.924 0.617 c -0.155 0.374 -0.069 0.804 0.217 1.09 l 12.213 12.213 c 0.195 0.195 0.451 0.293 0.707 0.293 s 0.512 -0.098 0.707 -0.293 L 59.92 41.102 C 60.206 40.815 60.292 40.386 60.137 40.012 z" fill="rgb(196,203,210)" />
    <path d="M 58.137 38.012 c -0.154 -0.374 -0.52 -0.617 -0.924 -0.617 h -4.805 V 25.616 c 0 -0.552 -0.447 -1 -1 -1 H 38.592 c -0.552 0 -1 0.448 -1 1 v 11.778 h -4.805 c -0.404 0 -0.769 0.244 -0.924 0.617 c -0.155 0.374 -0.069 0.804 0.217 1.09 l 12.213 12.213 c 0.195 0.195 0.451 0.293 0.707 0.293 s 0.512 -0.098 0.707 -0.293 L 57.92 39.102 C 58.206 38.815 58.292 38.386 58.137 38.012 z" fill="rgb(234,84,64)" />
  </svg>
);

export const Notes = () => {
  useSEO(seoConfig.pages.notes);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewNote, setPreviewNote] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        let url = `${import.meta.env.VITE_API_URL}/api/subject`;
        if (filterCourse) {
          url += `?courseId=${filterCourse}`;
        }
        
        const data = await cachedJsonFetch(url, {
          cacheKey: `subjects:${filterCourse || "all"}`,
          ttlMs: 5 * 60 * 1000,
        });

        if (Array.isArray(data?.data)) {
          const names = [...new Set(data.data.map(s => s.subjectname || s.title).filter(Boolean))];
          setSubjects(names);
        }
      } catch {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [filterCourse]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await cachedJsonFetch(`${import.meta.env.VITE_API_URL}/api/course`, {
          cacheKey: "courses:public",
          ttlMs: 5 * 60 * 1000,
        });
        setCourses(Array.isArray(data?.data) ? data.data : []);
      } catch {
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterCourse) params.append("courseId", filterCourse);
        if (filterSubject) params.append("subject", filterSubject);
        
        // Use environment variable or fallback to localhost:5000
        let baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
        const apiUrl = `${baseUrl}/api/notes/public?${params.toString()}`;
        
        console.log("Notes API Request:", apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network error");
        
        const resData = await response.json();
        setNotes(Array.isArray(resData?.data) ? resData.data : []);
      } catch (err) {
        console.error("Notes fetch error:", err);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [filterCourse, filterSubject]);

  // Dynamic subjects are now fetched from API in useEffect on mount

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return notes.filter((note) => {
      const title = String(note.title || "").toLowerCase();
      const subject = String(note.subject || "").toLowerCase();
      return !query || title.includes(query) || subject.includes(query);
    });
  }, [notes, search]);

  const getYoutubeEmbed = (url) => {
    if (!url) return "";
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  };

  return (
    <div className="legacy-page">
      <MainNavbar />

      <section className="legacy-hero">
        <div className="container legacy-hero-inner">
          <span className="legacy-pill dark">Chapter-wise PDFs & Lecture Notes</span>
          <h1 className="legacy-hero-title">
            Access <span className="accent">PDF Notes</span> and Study Resources
          </h1>
          <p className="legacy-hero-subtitle">
            Open free notes instantly, preview chapter material, and download documents for offline study.
          </p>
        </div>
      </section>

     <section className="legacy-section" style={{ paddingTop: 34 }}>
  <div className="container">
    <div className="legacy-card mb-4">
      <div className="legacy-card-body">
        <div className="row g-3 align-items-center">
          <div className="col-lg-4">
            <div className="position-relative">
              <FiSearch className="position-absolute" style={{ left: 14, top: 14, color: "#8c7ba9" }} />
              <input
                className="legacy-input ps-5"
                placeholder="Search notes or subject..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="col-lg-3">
            <select
              className="legacy-select"
              value={filterCourse}
              onChange={(event) => setFilterCourse(event.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-3">
            <select
              className="legacy-select"
              value={filterSubject}
              onChange={(event) => setFilterSubject(event.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 text-lg-end">
            <span className="legacy-pill light">
              {
                filtered.filter(note => {
                  const t = (note.type || "").toLowerCase();
                  const title = (note.title || "").toLowerCase();
                  return !(t.includes("dpp") || title.includes("dpp"));
                }).length
              } Docs
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="row g-4">
      {loading ? (
        <div className="col-12">
          <SkeletonCard count={6} dark={false} />
        </div>
      ) : (
        (() => {
          const notesOnly = filtered.filter(note => {
            const t = (note.type || "").toLowerCase();
            const title = (note.title || "").toLowerCase();
            return !(t.includes("dpp") || title.includes("dpp"));
          });

          if (notesOnly.length === 0) {
            return (
              <div className="col-12">
                <div className="legacy-card">
                  <div className="legacy-card-body text-center py-5">
                    <h6 className="fw-bold mb-1">No notes found</h6>
                    <p className="legacy-mini mb-0">Try a different search or filter.</p>
                  </div>
                </div>
              </div>
            );
          }

          return notesOnly.map((note) => {
            const isFree =
              note.type === "free" || note.accessType === "free" || note.isFree === true;

            return (
              <div className="col-lg-4" key={note._id}>
                <div
                  className="lms-resource-card p-4 rounded-4 border border-white border-opacity-10"
                  style={{ background: 'rgba(15, 23, 42, 0.4)', transition: 'all 0.3s ease' }}
                >
                  <div className="mb-4 d-flex gap-3">
                    <PdfIcon size={40} />
                    <div style={{ flex: 1 }}>
                      <h4 className="h5 fw-bold mb-1 text-gray">{note.title}</h4>
                      <p className="small text-secondary mb-2 opacity-75">
                        {note.description || "Study material for this chapter."}
                      </p>

                      <div className="d-flex gap-2 flex-wrap">
                        {note.course?.title && (
                          <span className="badge bg-info bg-opacity-50 text-info">
                            {note.course.title}
                          </span>
                        )}
                        {note.subject && (
                          <span className="badge bg-secondary bg-opacity-50 text-secondary">
                            {note.subject}
                          </span>
                        )}
                        <span
                          className="badge"
                          style={{
                            background: isFree ? '#2abf8315' : '#f11f8515',
                            color: isFree ? '#1a9a69' : '#d41972'
                          }}
                        >
                          {isFree ? "Free" : "Premium"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isFree ? (
                    <div className="d-flex gap-2">
                      {note.fileUrl && (
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-info rounded-pill px-3 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 small"
                        >
                          <PdfIcon size={16} /> View
                        </a>
                      )}
                      {note.fileUrl && (
                        <a
                          href={note.fileUrl}
                          download
                          className="btn btn-primary rounded-pill px-3 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 small"
                        >
                          <FiDownload size={16} /> Download
                        </a>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: '#fbf8ff',
                        borderRadius: '12px',
                        padding: '12px',
                        textAlign: 'center'
                      }}
                    >
                      <FiLock className="mb-2 text-muted" style={{ display: 'block' }} />
                      <p className="small mb-2">Enroll in batch to unlock.</p>
                      <Link to="/course" className="btn btn-sm btn-primary" style={{ fontSize: '11px' }}>
                        Unlock
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()
      )}
    </div>
  </div>
</section>

      <AnimatePresence>
        {previewNote ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2800,
              background: "rgba(8,4,26,.82)",
              backdropFilter: "blur(8px)",
              display: "grid",
              placeItems: "center",
              padding: 16,
            }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              style={{
                width: "min(1080px, 100%)",
                height: "min(92vh, 900px)",
                borderRadius: 20,
                background: "#fff",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  background: "linear-gradient(135deg,#7b3ff2,#f21f85)",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div className="fw-semibold">{previewNote.title}</div>
                  <div className="small opacity-75">
                    {previewNote.tab === "pdf" ? "PDF Preview" : "Video Preview"}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {previewNote.fileUrl ? (
                    <button
                      className="legacy-btn"
                      style={{
                        background: previewNote.tab === "pdf" ? "#fff" : "rgba(255,255,255,.16)",
                        color: previewNote.tab === "pdf" ? "#5f2acc" : "#fff",
                      }}
                      onClick={() => setPreviewNote({ ...previewNote, tab: "pdf" })}
                    >
                      PDF
                    </button>
                  ) : null}
                  {previewNote.videoLink ? (
                    <button
                      className="legacy-btn"
                      style={{
                        background: previewNote.tab === "video" ? "#fff" : "rgba(255,255,255,.16)",
                        color: previewNote.tab === "video" ? "#5f2acc" : "#fff",
                      }}
                      onClick={() => setPreviewNote({ ...previewNote, tab: "video" })}
                    >
                      Video
                    </button>
                  ) : null}
                  <button
                    className="legacy-btn"
                    style={{ background: "rgba(255,255,255,.16)", color: "#fff" }}
                    onClick={() => setPreviewNote(null)}
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              <div style={{ height: "calc(100% - 62px)", background: "#f6f3ff" }}>
                {previewNote.tab === "pdf" && previewNote.fileUrl ? (
                  <iframe src={previewNote.fileUrl} className="w-100 h-100 border-0" title="PDF" />
                ) : (
                  <iframe
                    src={getYoutubeEmbed(previewNote.videoLink)}
                    className="w-100 h-100 border-0"
                    title="Video"
                    allowFullScreen
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <LegacyFooter />
    </div>
  );
};

export default Notes;
