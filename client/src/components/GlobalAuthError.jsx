/**
 * Global Auth Error Display
 * Shows authentication errors globally at the app level
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppToast from "./ui/AppToast";

const GlobalAuthError = () => {
  const { authError, setAuthError } = useAuth();
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  useEffect(() => {
    if (authError) {
      setToast({
        show: true,
        message: authError,
        type: "error",
      });
    }
  }, [authError]);

  const handleClose = () => {
    setToast({ show: false, message: "", type: "error" });
    setAuthError(null);
  };

  return <AppToast toast={toast} onClose={handleClose} />;
};

export default GlobalAuthError;
