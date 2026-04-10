import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiBookOpen,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";
import ContentThumbnail from "./ContentThumbnail";

const formatDuration = (value = 0) => {
  const total = Math.max(0, Number(value) || 0);
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const ChapterAccordion = ({ subjects = [], currentLectureId, onSelectLecture }) => {
  const [openSubject, setOpenSubject] = useState("");
  const [openChapter, setOpenChapter] = useState("");

  useEffect(() => {
    if (!subjects.length) {
      return;
    }

    setOpenSubject((prev) => prev || subjects[0]?._id || "");
    setOpenChapter((prev) => prev || subjects[0]?.chapters?.[0]?._id || "");
  }, [subjects]);

  return (
    <div className="lms-accordion">
      {subjects.map((subject) => {
        const isSubjectOpen = openSubject === subject._id;

        return (
          <div className="lms-subject-card" key={subject._id}>
            <button
              type="button"
              className="lms-subject-toggle"
              onClick={() =>
                setOpenSubject((prev) => (prev === subject._id ? "" : subject._id))
              }
            >
              <div>
                <span className="lms-eyebrow">Subject</span>
                <h3>{subject.title}</h3>
              </div>
              {isSubjectOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            <AnimatePresence initial={false}>
              {isSubjectOpen ? (
                <motion.div
                  className="lms-subject-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {subject.chapters.map((chapter) => {
                    const isChapterOpen = openChapter === chapter._id;

                    return (
                      <div className="lms-chapter-card" key={chapter._id}>
                        <button
                          type="button"
                          className="lms-chapter-toggle"
                          onClick={() =>
                            setOpenChapter((prev) =>
                              prev === chapter._id ? "" : chapter._id
                            )
                          }
                        >
                          <div className="lms-chapter-meta">
                            <span className="lms-lecture-icon">
                              <FiBookOpen />
                            </span>
                            <div>
                              <strong>{chapter.title}</strong>
                              <span>{chapter.items.length} lectures</span>
                            </div>
                          </div>
                          {isChapterOpen ? <FiChevronDown /> : <FiChevronRight />}
                        </button>

                        <AnimatePresence initial={false}>
                          {isChapterOpen ? (
                            <motion.div
                              className="lms-lecture-list"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                            >
                              {chapter.items.map((lecture, index) => {
                                const isActive = String(currentLectureId) === String(lecture._id);

                                return (
                                  <button
                                    type="button"
                                    key={lecture._id}
                                    className={`lms-lecture-item ${isActive ? "active" : ""}`}
                                    onClick={() => onSelectLecture(lecture)}
                                  >
                                    <div className="lms-lecture-left">
                                      <span className="lms-lecture-index">
                                        {String(index + 1).padStart(2, "0")}
                                      </span>
                                      <ContentThumbnail
                                        item={lecture}
                                        className="rounded-3"
                                        style={{ width: 64, height: 40, flexShrink: 0 }}
                                        showLabel={false}
                                      />
                                      <div>
                                        <strong>{lecture.title}</strong>
                                        <div className="lms-lecture-tags">
                                          <span>
                                            <FiClock /> {formatDuration(lecture.duration)}
                                          </span>
                                          <span>{lecture.type.toUpperCase()}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {lecture.progress?.completed ? (
                                      <span className="lms-completed-badge">
                                        <FiCheckCircle />
                                      </span>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default ChapterAccordion;
