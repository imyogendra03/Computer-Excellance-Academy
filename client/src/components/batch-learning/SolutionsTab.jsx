import React from "react";
import { FiDownload, FiExternalLink } from "react-icons/fi";

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

const SolutionsTab = ({ subjects = [] }) => {
  const groups = subjects.flatMap((subject) =>
    (subject.chapters || []).map((chapter) => ({
      subjectTitle: subject.title || subject.subjectname,
      chapterTitle: chapter.title,
      items: (chapter.items || []).filter((item) => item.type === "solution"),
    }))
  );

  return (
    <div className="row g-4">
      {groups.filter(g => g.items.length).map((group) => (
        <div className="col-12" key={`${group.subjectTitle}-${group.chapterTitle}`}>
          <div className="lms-glass-card shadow-lg border-0" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="mb-4 d-flex align-items-center justify-content-between border-bottom py-3 px-4 border-secondary border-opacity-25">
              <div>
                <span className="text-info text-uppercase fw-bold small d-block mb-1 opacity-75">
                  {group.subjectTitle}
                </span>
                <h3 className="fw-900 mb-0 h4">{group.chapterTitle}</h3>
              </div>
            </div>

            <div className="row g-4 p-4 pt-0">
              {group.items.map((item) => (
                <div className="col-xl-6" key={item._id}>
                  <div className="lms-resource-card p-4 rounded-4 border border-white border-opacity-10" 
                       style={{ background: 'rgba(15, 23, 42, 0.4)', transition: 'all 0.3s ease' }}>
                    <div className="mb-4 d-flex gap-3">
                      <div className="align-items-center gap-2 mb-2 text-danger">
                        <PdfIcon size={40} />
                      </div>
                      <div>
                        <h4 className="h5 fw-bold mb-1 text-white">{item.title}</h4>
                        <p className="small text-secondary mb-0 opacity-75">
                          {item.description || "Detailed solutions for this chapter."}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex gap-3">
                      <a href={item.url} target="_blank" rel="noreferrer" 
                         className="btn btn-outline-info rounded-pill px-4 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2">
                        <FiExternalLink size={18} /> View Fullscreen
                      </a>
                      <a href={item.url} download 
                         className="btn btn-primary rounded-pill px-4 flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm">
                        <FiDownload /> Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {groups.every(g => !g.items.length) && (
        <div className="col-12">
          <div className="lms-empty-state text-center py-5 rounded-5 border border-dashed border-secondary border-opacity-50">
            <PdfIcon size={48} className="mb-3 opacity-25" />
            <h3 className="h4 opacity-75">Solutions Coming Soon</h3>
            <p className="text-secondary opacity-50">Detailed solutions for this batch are currently being prepared.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionsTab;