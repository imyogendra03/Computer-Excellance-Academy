import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  FiArrowLeft, 
  FiBook, 
  FiChevronRight, 
  FiClock, 
  FiLayers, 
  FiPlayCircle, 
  FiFolder, 
  FiFileText,
  FiVideo
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Tabs from "../components/Tabs";
import { getUserId, lmsApi } from "../services/lmsApi";
import { SkeletonCard, SkeletonStats } from "../components/ui/SkeletonLoader";
import "../components/ui/app-ui.css";

const VideosTab = lazy(() => import("../components/batch-learning/VideosTab"));
const NotesTab = lazy(() => import("../components/batch-learning/NotesTab"));
const DppTab = lazy(() => import("../components/batch-learning/DppTab"));
const SolutionsTab = lazy(() => import("../components/batch-learning/SolutionsTab"));

const tabs = [
  { id: "videos", label: "Videos" },
  { id: "notes", label: "Notes" },
  { id: "dpp", label: "DPP" },
  { id: "solutions", label: "DPP Solutions" },
];

const BatchLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = getUserId();
  const tabStorageKey = `cea-batch-tab:${id}`;
  const lectureStorageKey = `cea-batch-lecture:${id}`;

  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(localStorage.getItem(tabStorageKey) || "videos");
  const [currentLectureId, setCurrentLectureId] = useState("");
  const [viewMode, setViewMode] = useState("subjects"); 
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => { localStorage.setItem(tabStorageKey, activeTab); }, [activeTab, tabStorageKey]);

  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      try {
        setLoading(true); setError("");
        const data = await lmsApi.getBatchContent(id);
        if (!isMounted) return;
        setBatchData(data);
        const firstVideo = data.flatItems.find((item) => item.type === "video");
        const savedLectureId = localStorage.getItem(lectureStorageKey);
        const preferredLectureId = data.continueWatching?._id || savedLectureId || firstVideo?._id || "";
        setCurrentLectureId(preferredLectureId);
      } catch (err) {
        if (isMounted) {
          if (err?.response?.status === 403) {
            setError("This batch is locked. Complete payment to unlock videos, PDFs, DPPs, and solutions.");
          } else {
            setError("Unable to load learning content.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (id && userId) fetchContent();
    return () => { isMounted = false; };
  }, [id, userId, lectureStorageKey]);

  const playlist = useMemo(() => batchData?.flatItems.filter((item) => item.type === "video") || [], [batchData]);
  const currentLecture = useMemo(() => playlist.find((item) => String(item._id) === String(currentLectureId)) || playlist[0] || null, [playlist, currentLectureId]);

  const syncProgressInState = (payload) => {
    setBatchData((prev) => {
      if (!prev) return prev;
      const nextSubjects = prev.subjects.map((subject) => ({
        ...subject,
        chapters: subject.chapters.map((chapter) => ({
          ...chapter,
          items: chapter.items.map((item) => String(item._id) === String(payload.contentId) ? { ...item, progress: { ...(item.progress || {}), watchedTime: payload.watchedTime, completed: typeof payload.completed === "boolean" ? payload.completed : item.progress?.completed || false, lastAccessed: new Date().toISOString() } } : item),
        })),
      }));
      return { ...prev, subjects: nextSubjects, flatItems: nextSubjects.flatMap((s) => s.chapters.flatMap((c) => c.items)) };
    });
  };

  const handleSelectLecture = (lecture) => { setCurrentLectureId(lecture._id); localStorage.setItem(lectureStorageKey, lecture._id); setActiveTab("videos"); };
  const handleProgressSave = async (payload) => { syncProgressInState(payload); try { await lmsApi.updateProgress(payload); } catch {} };
  const handleComplete = async (payload) => { const nextPayload = { ...payload, completed: true }; syncProgressInState(nextPayload); try { await lmsApi.updateProgress(nextPayload); } catch {} };
  const handlePlayNext = () => { const currentIndex = playlist.findIndex((item) => String(item._id) === String(currentLecture?._id)); if (currentIndex >= 0 && playlist[currentIndex + 1]) handleSelectLecture(playlist[currentIndex + 1]); };

  const retryLoadBatch = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await lmsApi.getBatchContent(id);
      setBatchData(data);
      const firstVideo = data.flatItems.find((item) => item.type === "video");
      const savedLectureId = localStorage.getItem(lectureStorageKey);
      const preferredLectureId = data.continueWatching?._id || savedLectureId || firstVideo?._id || "";
      setCurrentLectureId(preferredLectureId);
    } catch (err) {
      if (err?.response?.status === 403) {
        setError("This batch is locked. Complete payment to unlock videos, PDFs, DPPs, and solutions.");
      } else {
        setError("Unable to load learning content.");
      }
    } finally {
      setLoading(false);
    }
  };

  const progressStats = useMemo(() => { const total = batchData?.flatItems.length || 0; const completed = batchData?.flatItems.filter((item) => item.progress?.completed).length || 0; const percentage = total ? Math.round((completed / total) * 100) : 0; return { total, completed, percentage }; }, [batchData]);

  const handleSubjectClick = (subject) => { setSelectedSubject(subject); setViewMode("chapters"); };
  const handleChapterClick = (chapter) => {
    const hasVideo = (chapter.items || []).some((item) => item.type === "video");
    const hasNotes = (chapter.items || []).some((item) => item.type === "note");
    const hasDpp = (chapter.items || []).some((item) => item.type === "dpp");
    const hasSolutions = (chapter.items || []).some((item) => item.type === "solution");

    if (!hasVideo) {
      if (hasNotes) setActiveTab("notes");
      else if (hasDpp) setActiveTab("dpp");
      else if (hasSolutions) setActiveTab("solutions");
    } else {
      setActiveTab("videos");
    }

    setSelectedChapter(chapter);
    setViewMode("content");
  };
  const resetToSubjects = () => { setViewMode("subjects"); setSelectedSubject(null); setSelectedChapter(null); };
  const resetToChapters = () => { setViewMode("chapters"); setSelectedChapter(null); };

  const renderContentView = () => {
    const currentItems = selectedChapter?.items || [];
    const videoItems = currentItems.filter(i => i.type === 'video');
    const noteItems = currentItems.filter(i => i.type === 'note');
    const dppItems = currentItems.filter(i => i.type === 'dpp');
    const solutionItems = currentItems.filter(i => i.type === 'solution');
    if (activeTab === "notes") return <NotesTab subjects={[{ ...selectedSubject, chapters: [{ ...selectedChapter, items: noteItems }] }]} />;
    if (activeTab === "dpp") return <DppTab subjects={[{ ...selectedSubject, chapters: [{ ...selectedChapter, items: dppItems }] }]} />;
    if (activeTab === "solutions") return <SolutionsTab subjects={[{ ...selectedSubject, chapters: [{ ...selectedChapter, items: solutionItems }] }]} />;
    return <VideosTab subjects={[{ ...selectedSubject, chapters: [{ ...selectedChapter, items: videoItems }] }]} currentLecture={currentLecture} onSelectLecture={handleSelectLecture} onProgressSave={handleProgressSave} onComplete={handleComplete} onPlayNext={handlePlayNext} />;
  };

  return (
    <div className="app-page">
      <div className="container ">
        {/* Breadcrumbs */}
        <div className="mb-4 d-flex align-items-center gap-2 flex-wrap">
          <span className="text-muted cursor-pointer" onClick={() => navigate("/userdash/my-batches")} style={{ cursor: "pointer" }}>My Batches</span>
          <FiChevronRight className="text-muted" size={16} />
          <span className={`${viewMode === 'subjects' ? 'text-white fw-bold' : 'text-muted cursor-pointer'}`} onClick={resetToSubjects} style={{ cursor: "pointer" }}>Subjects</span>
          {selectedSubject && <>
            <FiChevronRight className="text-muted" size={16} />
            <span className={`${viewMode === 'chapters' ? 'text-white fw-bold' : 'text-muted cursor-pointer'}`} onClick={resetToChapters} style={{ cursor: "pointer" }}>{selectedSubject.title || selectedSubject.subjectname}</span>
          </>}
          {selectedChapter && <>
            <FiChevronRight className="text-muted" size={16} />
            <span className="text-white fw-bold">{selectedChapter.title}</span>
          </>}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
              <div className="app-panel mb-4 p-4">
                <div className="w-100">
                  <div className="app-skeleton mb-3" style={{ width: '40%', height: 40, borderRadius: 12 }}></div>
                  <div className="app-skeleton" style={{ width: '60%', height: 20, borderRadius: 8 }}></div>
                </div>
                <div className="d-flex gap-3 mt-4">
                  <div className="app-skeleton" style={{ width: 120, height: 80, borderRadius: 18 }}></div>
                  <div className="app-skeleton" style={{ width: 120, height: 80, borderRadius: 18 }}></div>
                </div>
              </div>
              <div className="row g-4">
                {[...Array(6)].map((_, i) => (<div className="col-lg-4 col-md-6" key={i}><SkeletonCard count={1} /></div>))}
              </div>
            </motion.div>
          ) : error ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-5">
              <h3 className="mb-3">{error}</h3>
              <p className="text-muted mb-4">To access this batch content, you need to complete payment or wait for admin approval.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button className="btn app-btn-primary" onClick={() => navigate(`/batch-preview/${id}`)}>
                  💳 Buy Now / Unlock Access
                </button>
                <button className="btn btn-outline-primary" onClick={retryLoadBatch}>
                  🔄 Refresh Access
                </button>
                <button className="btn btn-outline-secondary" onClick={() => navigate("/userdash/my-batches")}>
                  Back to My Batches
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Hero Section */}
              <motion.div className="app-hero mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="row align-items-center g-4">
                  <div className="col-lg-8">
                    <span className="badge bg-primary mb-2">{batchData?.batch?.course?.title}</span>
                    <h1 className="h2 fw-bold mb-2">{batchData?.batch?.batchName}</h1>
                    <p className="mb-0">Let's continue your learning journey.</p>
                  </div>
                  <div className="col-lg-4">
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="app-stat-card text-center">
                          <div className="app-label-muted mb-2">Completed</div>
                          <strong className="h5 fw-bold mb-0">{progressStats.percentage}%</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="app-stat-card text-center">
                          <div className="app-label-muted mb-2">Access</div>
                          <strong className="h5 fw-bold mb-0">Active</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {viewMode === "subjects" && (
                  <motion.div key="subjects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-4 d-flex align-items-center gap-3">
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #38bdf8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiBook className="text-white" /></div>
                      <h2 className="mb-0 fw-bold">Select a Subject</h2>
                    </div>
                    <div className="row g-4">
                      {(batchData?.subjects || []).map((subject) => (
                        <div className="col-lg-4 col-md-6" key={subject._id}>
                          <motion.div className="app-mobile-card h-100 d-flex align-items-center gap-3 p-4 clickable" whileHover={{ scale: 1.02 }} onClick={() => handleSubjectClick(subject)} style={{ cursor: "pointer" }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #38bdf8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiFolder className="text-white" size={24} /></div>
                            <div className="w-100">
                              <h5 className="mb-1 fw-bold">{subject.title || subject.subjectname}</h5>
                              <p className="text-muted small mb-0">{subject.chapters?.length || 0} Modules</p>
                            </div>
                            <FiChevronRight className="text-muted" size={20} />
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {viewMode === "chapters" && (
                  <motion.div key="chapters" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-4 d-flex align-items-center gap-3">
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiFolder className="text-white" /></div>
                      <h2 className="mb-0 fw-bold">Chapters in {selectedSubject?.title || selectedSubject?.subjectname}</h2>
                    </div>
                    <div className="row g-4">
                      {(selectedSubject?.chapters || []).map((chapter) => (
                        <div className="col-lg-4 col-md-6" key={chapter._id}>
                          <motion.div className="app-mobile-card h-100 d-flex align-items-center gap-3 p-4 clickable" whileHover={{ scale: 1.02 }} onClick={() => handleChapterClick(chapter)} style={{ cursor: "pointer" }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiLayers className="text-white" size={24} /></div>
                            <div className="w-100">
                              <h5 className="mb-1 fw-bold">{chapter.title}</h5>
                              <p className="text-muted small mb-0">{chapter.items?.length || 0} Items</p>
                            </div>
                            <FiChevronRight className="text-muted" size={20} />
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {viewMode === "content" && (
                  <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="d-flex gap-2 mb-4 flex-wrap">
                      {tabs.map((tab) => (
                        <button key={tab.id} className={`btn btn-sm fw-bold ${activeTab === tab.id ? 'app-btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab(tab.id)}>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <Suspense fallback={<div className="app-skeleton" style={{ height: 400, borderRadius: 24 }} />}>
                      {renderContentView()}
                    </Suspense>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BatchLearning;
