import React from "react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import "./app-ui.css";

const AppToast = ({ toast, onClose }) => {
  if (!toast?.show) return null;

  const isError = toast.type === "error";

  return (
    <div className={`app-toast ${isError ? "error" : "success"}`}>
      <div className="app-toast__content">
        <span className="app-toast__icon">
          {isError ? <FiAlertCircle /> : <FiCheckCircle />}
        </span>
        <span>{toast.message}</span>
      </div>

      <button type="button" className="app-toast__close" onClick={onClose}>
        <FiX />
      </button>
    </div>
  );
};

export default AppToast;
