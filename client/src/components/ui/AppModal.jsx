import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import "./app-ui.css";

const AppModal = ({ open, title, subtitle, children, onClose, isEditing }) => {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="app-modal__backdrop" onClick={onClose}>
      <div
        className="app-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={`app-modal__header ${isEditing ? "edit" : ""}`}>
          <div className="app-modal__title-wrap">
            <h4>{title}</h4>
            <p>{subtitle}</p>
          </div>

          <button type="button" className="app-modal__close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="app-modal__body">{children}</div>
      </div>
    </div>
  );
};

export default AppModal;
