import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import { FiDownload, FiSearch } from "react-icons/fi";

const UserNotes = () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasedBatches, setPurchasedBatches] = useState([]);
  const [previewNote, setPreviewNote] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  // Fetch user's purchased batches (batch access verification)
  useEffect(() => {
    const fetchPurchasedBatches = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/examinee/${userId}/my-batches`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Filter only active/purchased batches
        const activeBatches = (res.data?.data || []).filter(
          (b) => b.accessStatus === "active" || b.paymentStatus === "completed"
        );
        setPurchasedBatches(activeBatches);
        
        // Extract courseIds from purchased batches
        const courseIds = activeBatches.map((b) => b.courseId || b.course?._id).filter(Boolean);
        setFilterCourse(courseIds[0] || "");
      } catch (err) {
        showToast("Unable to fetch your batch access", "error");
        setPurchasedBatches([]);
      }
    };

    if (userId && token) {
      fetchPurchasedBatches();
    }
  }, [userId, token]);

  // Fetch subjects based on course
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        let url = `${import.meta.env.VITE_API_URL}/api/subject`;
        if (filterCourse) {
          url += `?courseId=${filterCourse}`;
        }
        
        const res = await axios.get(url);
        if (Array.isArray(res.data?.data)) {
          const names = [...new Set(res.data.data.map(s => s.subjectname || s.title).filter(Boolean))];
          setSubjects(names);
        }
      } catch {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [filterCourse]);

  // Fetch courses (only purchased courses)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/course`);
        const allCourses = Array.isArray(res.data?.data) ? res.data.data : [];
        
        // Filter to show only purchased courses
        const courseIds = purchasedBatches.map((b) => b.courseId || b.course?._id).filter(Boolean);
        const filtered = allCourses.filter((c) => courseIds.includes(c._id));
        setCourses(filtered);
      } catch {
        setCourses([]);
      }
    };
    
    if (purchasedBatches.length > 0) {
      fetchCourses();
    }
  }, [purchasedBatches]);

  // Fetch notes from public endpoint - only for purchased batches
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        
        // Only fetch if user has purchased batches
        if (purchasedBatches.length === 0) {
          setNotes([]);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();
        if (filterCourse) {
          params.append("courseId", filterCourse);
        }
        if (filterSubject) {
          params.append("subject", filterSubject);
        }
        
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/notes/public?${params.toString()}`;
        const res = await axios.get(apiUrl);
        setNotes(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        if (err.response?.status !== 404) {
          showToast("Notes load nahi ho paaye", "error");
        }
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [filterCourse, filterSubject, purchasedBatches]);

  // Filter notes based on search
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return notes.filter((note) => {
      const title = String(note.title || "").toLowerCase();
      const subject = String(note.subject || "").toLowerCase();
      return !query || title.includes(query) || subject.includes(query);
    });
  }, [notes, search]);

  // PDF icon for UI
  const PdfIcon = ({ size = 20, className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 90 90" aria-hidden="true" className={className}>
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

  // Show message if no batches purchased
  if (!loading && purchasedBatches.length === 0) {
    return (
      <div className="app-page">
        <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />
        <div className="container">
          <div className="app-hero mb-4">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Study Portal</h2>
                <p className="mb-0">Access notes for your purchased batches.</p>
              </div>
            </div>
          </div>
          
          <div className="col-12">
            <div className="lms-empty-state text-center py-5 rounded-5 border border-dashed border-secondary border-opacity-50">
              <PdfIcon size={48} className="mb-3 opacity-25" />
              <h3 className="h4 opacity-75">No Batch Access</h3>
              <p className="text-secondary opacity-50">Purchase a batch to access study materials and notes.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />
      <div className="container">
        
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Study Portal</h2>
              <p className="mb-0">Access PDF notes for your purchased batches.</p>
            </div>
            <div className="col-lg-4 text-lg-end">
              {loading ? (
                <div className="app-skeleton-dark ms-auto" style={{ width: 140, height: 80, borderRadius: 18 }}></div>
              ) : (
                <div className="app-stat-card">
                  <div className="app-label-muted">Available Notes</div>
                  <h4 className="fw-bold mb-0">{filtered.length}</h4>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="row g-3 mb-4">
          <div className="col-lg-5">
            <div className="position-relative">
              <FiSearch className="position-absolute" style={{ left: 14, top: 14, color: "#8c7ba9" }} />
              <input
                className="form-control ps-5"
                placeholder="Search notes or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          </div>
          <div className="col-lg-3">
            <select
              className="form-select"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
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
              className="form-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-1 text-lg-end d-flex align-items-center justify-content-lg-end">
            <span className="badge bg-info">{filtered.length} PDFs</span>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="row g-4">
          {loading ? (
            <div className="col-12">
              <SkeletonCard count={6} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-12">
              <div className="lms-empty-state text-center py-5 rounded-5 border border-dashed border-secondary border-opacity-50">
                <PdfIcon size={48} className="mb-3 opacity-25" />
                <h3 className="h4 opacity-75">No Notes Found</h3>
                <p className="text-secondary opacity-50">Notes will appear here for your purchased batches.</p>
              </div>
            </div>
          ) : (
            filtered.map((note) => (
              <div className="col-lg-6" key={note._id}>
                <div className="lms-resource-card p-4 rounded-4 border border-white border-opacity-10" 
                     style={{ background: 'rgba(15, 23, 42, 0.4)', transition: 'all 0.3s ease', height: '100%' }}>
                  
                  <div className="mb-4 d-flex gap-3">
                    <PdfIcon size={40} className="flex-shrink-0" />
                    <div style={{ flex: 1 }}>
                      <h4 className="h5 fw-bold mb-1 text-white">{note.title}</h4>
                      <p className="small text-secondary mb-2 opacity-75">
                        {note.description || "Study material for this chapter."}
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        {note.course?.title && (
                          <span className="badge bg-info bg-opacity-50 text-info">{note.course.title}</span>
                        )}
                        {note.subject && (
                          <span className="badge bg-secondary bg-opacity-50 text-secondary">{note.subject}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    {(note.fileUrl || note.url) && (
                      <>
                        <a href={note.fileUrl || note.url} target="_blank" rel="noreferrer"
                           className="btn btn-outline-info rounded-pill px-3 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 small">
                          <PdfIcon size={16} /> View
                        </a>
                        <a href={note.fileUrl || note.url} download
                           className="btn btn-primary rounded-pill px-3 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 small">
                          <FiDownload size={16} /> Download
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {previewNote && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 10000, display: "flex", flexDirection: "column" }}>
          <div className="p-3 d-flex justify-content-between align-items-center text-white" style={{ background: "#0f172a" }}>
            <h5 className="mb-0">{previewNote.title}</h5>
            <button className="btn btn-sm btn-light" onClick={() => setPreviewNote(null)}>Close</button>
          </div>
          <div style={{ flex: 1 }}>
            {previewNote.fileUrl && <iframe src={previewNote.fileUrl} style={{ width: "100%", height: "100%", border: "none" }} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNotes;
