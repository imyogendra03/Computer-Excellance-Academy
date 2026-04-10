import React, { useState, useRef, useEffect } from "react";
import { FiPlayCircle, FiCheckCircle, FiMove, FiX } from "react-icons/fi";
import VideoPlayer from "../VideoPlayer";
import ContentThumbnail from "../ContentThumbnail";

const VideosTab = ({
  subjects = [],
  currentLecture,
  onSelectLecture,
  onProgressSave,
  onComplete,
  onPlayNext,
}) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [playerPos, setPlayerPos] = useState({
    x: Math.max(10, (window.innerWidth - 600) / 2),
    y: 100
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const groups = subjects.flatMap((subject) =>
    (subject.chapters || []).map((chapter) => ({
      subjectTitle: subject.title || subject.subjectname,
      chapterTitle: chapter.title,
      items: (chapter.items || []).filter((item) => item.type === "video"),
    }))
  );

  const allItems = groups.flatMap(g => g.items);

  const handleVideoClick = (video) => {
    setActiveVideo(video);
    onSelectLecture(video);
  };

  const closePlayer = () => {
    setActiveVideo(null);
  };

  // Dragging Logic
  const startDrag = (e) => {
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPlayerPos({
        x: Math.max(0, e.clientX - offsetRef.current.x),
        y: Math.max(0, e.clientY - offsetRef.current.y),
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="row g-4 position-relative" style={{ minHeight: '600px' }}>
      {/* Video Grid Section */}
      {groups.filter(g => g.items.length > 0).map((group) => (
        <div className="col-12" key={`${group.subjectTitle}-${group.chapterTitle}`}>
          {/* Web Theme Elevated Card */}
          <div className="lms-glass-card shadow-2xl border-0 mb-5 overflow-hidden"
            style={{
              background: 'rgba(30, 41, 59, 0.4)',
              borderRadius: '24px',
              borderTop: '2px solid rgba(56, 189, 248, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
            <div className="mb-4 d-flex align-items-center justify-content-between border-bottom py-4 px-4 border-white border-opacity-5"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <span className="text-info text-uppercase fw-bold small d-block mb-1 opacity-75 tracking-wider">
                  {group.subjectTitle}
                </span>
                <h3 className="fw-900 mb-0 h4 text-white">{group.chapterTitle}</h3>
              </div>
              <div className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-2 rounded-pill small">
                {group.items.length} Lectures
              </div>
            </div>

            <div className="row g-4 p-4 pt-0">
              {group.items.map((item) => {
                const isCompleted = item.progress?.completed;
                return (
                  <div className="col-xl-4 col-md-6" key={item._id}>
                    <div className={`lms-resource-card p-0 rounded-4 h-100 overflow-hidden transition-all br-ultra-card ${activeVideo?._id === item._id ? 'br-active-glow' : ''}`}
                      style={{ 
                        background: isCompleted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.95)',
                        transform: activeVideo?._id === item._id ? 'scale(1.02)' : 'scale(1)',
                        border: '2px solid transparent',
                        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.95)), linear-gradient(to bottom right, #2563eb, #ef4444)',
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box'
                      }}>

                      {/* Thumbnail with Intense Colored Border */}
                      <div className="position-relative cursor-pointer aspect-video m-1 rounded-3 overflow-hidden" 
                           style={{ border: '2px solid rgba(239, 68, 68, 0.5)', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                           onClick={() => handleVideoClick(item)}>
                        <ContentThumbnail
                          item={item}
                          className={`w-100 h-100 object-fit-cover ${isCompleted ? 'opacity-30' : ''}`}
                        />
                        
                        {/* Completion Overlay */}
                        {isCompleted === true && (
                          <div className="position-absolute top-0 start-0 m-1 badge text-white d-flex align-items-center gap-1 shadow-sm px-2 py-1 rounded-pill" 
                               style={{ zIndex: 2, background: 'linear-gradient(to right, #2563eb, #ef4444)', fontSize: '0.62rem' }}>
                             <FiCheckCircle size={10} /> Completed
                          </div>
                        )}

                        {item.duration > 0 && (
                          <div className="position-absolute bottom-0 end-0 m-1 px-2 py-1 bg-dark text-white smaller rounded-1 fw-bold" style={{ fontSize: '0.62rem', border: '1px solid #ef4444' }}>
                             {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                          </div>
                        )}
                      </div>

                      {/* Ultra-Dark Saturated Content Area */}
                      <div className="px-3 pb-2 pt-1" style={{ 
                        background: 'linear-gradient(to bottom, rgba(37, 99, 235, 0.5), rgba(220, 38, 38, 0.6))',
                        marginTop: '-4px'
                      }}>
                        <div className="d-flex justify-content-between align-items-start mb-0">
                           <h4 className="fw-900 mb-0 text-white text-truncate-2 cursor-pointer flex-grow-1 mr-2" 
                               style={{ lineHeight: '1.2', fontSize: '0.88rem', letterSpacing: '-0.3px', color: '#fff' }}
                               onClick={() => handleVideoClick(item)}>
                             {item.title}
                           </h4>
                           {isCompleted === true && <FiCheckCircle className="text-white mt-1" size={14} />}
                        </div>
                        <p className="text-white opacity-90 text-truncate-2 mb-2" style={{ fontSize: '0.7rem', lineHeight: '1.1', marginTop: '2px', fontWeight: '500' }}>
                          {item.description || "Premium lecture for Computer Excellence Academy."}
                        </p>

                        <button
                          onClick={() => handleVideoClick(item)}
                          className="btn btn-sm rounded-pill px-3 fw-bold w-100 d-flex align-items-center justify-content-center gap-2 btn-br-primary shadow-lg border-0"
                          style={{ height: '30px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                          {isCompleted ? "Watch Again" : "Play Lecture"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {allItems.length === 0 && (
        <div className="col-12 text-center py-5">
          <h4 className="text-secondary opacity-50">No videos available in this section</h4>
        </div>
      )}

      {/* Floating Moveable Player */}
      {activeVideo && (
        <div 
          ref={dragRef}
          onDoubleClick={() => setPlayerPos({ x: (window.innerWidth - 600) / 2, y: 100 })}
          className="position-fixed shadow-2xl overflow-hidden floating-player-container br-player-frame" 
          style={{ 
            width: '600px', 
            left: `${playerPos.x}px`, 
            top: `${playerPos.y}px`, 
            zIndex: 9999,
            borderRadius: '16px',
            background: '#010409',
            border: '2px solid transparent',
            backgroundImage: 'linear-gradient(#010409, #010409), linear-gradient(to right, #2563eb, #ef4444)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.9), 0 0 20px rgba(37, 99, 235, 0.2)',
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Drag Handle Top Bar */}
          <div 
            onMouseDown={startDrag}
            className="d-flex align-items-center justify-content-between px-3 py-2 drag-handle"
            style={{ 
              background: 'linear-gradient(to right, #1e3a8a, #991b1b)', 
              cursor: 'move', 
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              userSelect: 'none'
            }}
          >
            <div className="d-flex align-items-center gap-2 overflow-hidden">
               <span className="text-white small fw-bold text-truncate" style={{ maxWidth: '400px', fontSize: '0.8rem' }}>
                  NOW PLAYING: {activeVideo.title}
               </span>
            </div>
            <div className="d-flex align-items-center gap-2">
               <span className="text-white opacity-50 smaller d-none d-md-inline" style={{ fontSize: '0.65rem' }}>Double-click to center</span>
               <button onClick={closePlayer} className="btn btn-link text-white p-0 border-0 hover-scale-110 transition-transform">
                  <FiX size={22} />
               </button>
            </div>
          </div>

          <div style={{ background: '#000' }}>
            <VideoPlayer
              lecture={activeVideo}
              onClose={closePlayer}
              onProgressSave={onProgressSave}
              onComplete={(data) => {
                onComplete(data);
                activeVideo.progress = { ...activeVideo.progress, completed: true };
              }}
              onPlayNext={() => {
                const currentIndex = allItems.findIndex(v => v._id === activeVideo?._id);
                if (currentIndex !== -1 && allItems[currentIndex + 1]) {
                  handleVideoClick(allItems[currentIndex + 1]);
                } else {
                  onPlayNext();
                }
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        .drag-handle:active { cursor: grabbing !important; }
        .floating-player-container {
          will-change: left, top;
        }
        .btn-br-primary {
          background: linear-gradient(to right, #2563eb, #ef4444);
          border: none;
          color: white;
          transition: all 0.3s ease;
        }
        .btn-br-primary:hover {
          background: linear-gradient(to right, #1d4ed8, #dc2626);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
        }
        .br-ultra-card {
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }
        .br-active-glow {
          box-shadow: 0 0 30px rgba(37, 99, 235, 0.4), 0 0 60px rgba(239, 68, 68, 0.2) !important;
          animation: br-active-pulse 2s infinite alternate;
        }
        @keyframes br-active-pulse {
          from { transform: scale(1.02); filter: brightness(1.1); }
          to { transform: scale(1.025); filter: brightness(1.2); }
        }
        .br-player-frame {
          animation: br-glow-pulse 3s infinite alternate;
        }
        @keyframes br-glow-pulse {
          from { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.9), 0 0 10px rgba(37, 99, 235, 0.2); }
          to { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.9), 0 0 20px rgba(220, 38, 38, 0.3); }
        }
        .hover-scale-110:hover { transform: scale(1.1); }
        .aspect-video { aspect-ratio: 16 / 9; }
        .hover-bg-opacity-40:hover { background-color: rgba(0,0,0,0.4) !important; }
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .floating-player-container {
            width: 95% !important;
            left: 2.5% !important;
            top: 20% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VideosTab;
