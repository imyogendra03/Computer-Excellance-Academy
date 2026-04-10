import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { FiCheckCircle, FiSkipForward, FiMaximize, FiSettings, FiX } from "react-icons/fi";

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoPlayer = ({ lecture, onProgressSave, onComplete, onPlayNext, onClose }) => {
  const playerRef = useRef(null);
  const wrapperRef = useRef(null);
  const lastSavedRef = useRef(0);
  const didSeekRef = useRef(false);
  const [playing, setPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    lastSavedRef.current = lecture?.progress?.watchedTime || 0;
    didSeekRef.current = false;
    setPlaying(true);
  }, [lecture?._id]);

  if (!lecture) return null;

  // Robust URL Resolution
  const resolveLectureUrl = (url = "") => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("//")) return url;
    
    const externalDomains = ["youtube.com", "youtu.be", "vimeo.com", "wistia.com", "dailymotion.com"];
    if (externalDomains.some(domain => url.includes(domain))) {
      return `https://${url.replace(/^https?:\/\//, '')}`;
    }

    // Auto-detect YouTube IDs (11 chars)
    if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return `https://www.youtube.com/watch?v=${url}`;
    }

    // Auto-detect Vimeo IDs (numeric)
    if (/^\d+$/.test(url) && url.length > 5) {
      return `https://vimeo.com/${url}`;
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `${baseUrl}/${cleanPath}`;
  };

  const resolvedUrl = resolveLectureUrl(lecture.url);

  if (!resolvedUrl) {
    return (
      <div className="p-5 text-center text-white bg-dark rounded-4 shadow-lg border border-white border-opacity-10">
        <FiX size={48} className="text-danger mb-3" />
        <h4 className="fw-bold">Invalid Video Source</h4>
        <p className="opacity-75 small mb-4">This lecture doesn't have a valid video source yet.</p>
        <button onClick={onClose} className="btn btn-sm btn-outline-light rounded-pill px-4">Close Player</button>
      </div>
    );
  }

  const handleReady = () => {
    const resumeAt = lecture.progress?.watchedTime || 0;
    if (!didSeekRef.current && resumeAt > 0 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(resumeAt, "seconds");
      didSeekRef.current = true;
    }
  };

  const handleProgress = ({ playedSeconds }) => {
    if (playedSeconds - lastSavedRef.current >= 10) {
      lastSavedRef.current = playedSeconds;
      onProgressSave({
        contentId: lecture._id,
        watchedTime: playedSeconds,
        completed: false,
      });
    }
  };

  const [error, setHasError] = useState(false);

  const handleEnded = () => {
    onComplete({
      contentId: lecture._id,
      watchedTime: playerRef.current?.getCurrentTime() || 0,
      completed: true,
    });
    onPlayNext();
  };

  const toggleFullscreen = () => {
    if (wrapperRef.current?.requestFullscreen) {
      wrapperRef.current.requestFullscreen();
    }
  };

  if (error) {
    return (
      <div className="p-5 text-center text-white bg-dark rounded-4 shadow-lg border border-white border-opacity-10">
        <FiX size={48} className="text-danger mb-3" />
        <h4 className="fw-bold">Playback Error</h4>
        <p className="opacity-75 small mb-4">Could not load the video. Please check your internet or the source URL.</p>
        <button onClick={() => setHasError(false)} className="btn btn-sm btn-primary rounded-pill px-4 mx-2">Retry</button>
        <button onClick={onClose} className="btn btn-sm btn-outline-light rounded-pill px-4">Close</button>
      </div>
    );
  }

  return (
    <div className="lms-player-container v-youtube-style" ref={wrapperRef}>
      <div className="lms-player-wrapper" style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
        <ReactPlayer
          ref={playerRef}
          url={resolvedUrl}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={true}
          playing={playing}
          playbackRate={playbackRate}
          onReady={handleReady}
          onProgress={handleProgress}
          onEnded={handleEnded}
          onError={() => setHasError(true)}
          config={{
            youtube: {
              playerVars: { 
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                origin: window.location.origin
              }
            }
          }}
        />
        
        {/* Floating Settings Tooltip for Speed */}
        {showSettings && (
          <div className="position-absolute bottom-0 end-0 m-2 p-2 bg-dark rounded shadow-lg border border-white border-opacity-10" style={{ zIndex: 10, minWidth: '100px' }}>
            <p className="small text-secondary mb-1 px-2 border-bottom border-white border-opacity-10 pb-1">Playback Speed</p>
            {speeds.map(s => (
              <button 
                key={s} 
                onClick={() => { setPlaybackRate(s); setShowSettings(false); }}
                className={`btn btn-sm w-100 text-start text-white hover-bg-primary ${playbackRate === s ? 'bg-primary' : ''}`}
                style={{ fontSize: '0.8rem' }}
              >
                {s}x {s === 1 && '(Normal)'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lms-player-footer-actions d-flex align-items-center justify-content-between p-3 gap-2" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
        <div className="d-flex gap-2">
           <button 
             type="button" 
             className="btn btn-sm btn-outline-light rounded-pill px-3 d-flex align-items-center gap-1 border-white border-opacity-20"
             onClick={() => setShowSettings(!showSettings)}
           >
             <FiSettings size={14} /> {playbackRate}x
           </button>
           <button 
             type="button" 
             className="btn btn-sm btn-outline-light rounded-pill px-3 d-flex align-items-center gap-1 border-white border-opacity-20"
             onClick={toggleFullscreen}
           >
             <FiMaximize size={14} /> Fullscreen
           </button>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="button" 
            className="btn btn-sm btn-outline-success d-flex align-items-center gap-2 rounded-pill px-3" 
            onClick={() => onComplete({ contentId: lecture._id, watchedTime: playerRef.current?.getCurrentTime() || 0, completed: true })}
          >
            <FiCheckCircle /> Mark Done
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-primary d-flex align-items-center gap-2 rounded-pill px-3" 
            onClick={onPlayNext}
          >
            Next <FiSkipForward />
          </button>
          {onClose && (
            <button 
              type="button" 
              className="btn btn-sm btn-danger rounded-circle p-2" 
              onClick={onClose}
              title="Close Player"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        .v-youtube-style {
          box-shadow: 0 30px 60px rgba(0,0,0,0.6);
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .hover-bg-primary:hover { background-color: var(--bs-primary) !important; }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
