/**
 * Global Authentication Context
 * Manages user auth state, tokens, and provides global error handling
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Show authentication error globally
   */
  const showAuthError = useCallback((message) => {
    setAuthError(message);
    setTimeout(() => setAuthError(null), 5000);
  }, []);

  /**
   * Check if user is logged in by verifying token
   */
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");
    setIsAuthenticated(!!(token || adminToken));
    return !!(token || adminToken);
  }, []);

  /**
   * Get current user info
   */
  const getCurrentUser = useCallback(() => {
    const userData = localStorage.getItem("userData");
    const adminData = localStorage.getItem("adminData");
    
    if (userData) {
      return { ...JSON.parse(userData), type: "user" };
    }
    if (adminData) {
      return { ...JSON.parse(adminData), type: "admin" };
    }
    return null;
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userToken");
    localStorage.removeItem("role");
    localStorage.removeItem("adminData");
    localStorage.removeItem("email");
    
    setIsAuthenticated(false);
    window.location.href = "/";
  }, []);

  window.showAuthError = showAuthError;

  const value = {
    authError,
    setAuthError,
    showAuthError,
    isAuthenticated,
    checkAuth,
    getCurrentUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use Auth Context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
