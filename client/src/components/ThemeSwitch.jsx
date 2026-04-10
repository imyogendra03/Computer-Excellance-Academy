import React from "react";
import { motion } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const ThemeSwitch = () => {
  const { themeMode, toggleTheme } = useAuth();
  const isDark = themeMode === "dark";

  return (
    <motion.button
      type="button"
      className="theme-switch"
      onClick={toggleTheme}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="theme-switch__icon">{isDark ? <FiSun /> : <FiMoon />}</span>
      <span className="theme-switch__text">{isDark ? "Light" : "Dark"} Mode</span>
    </motion.button>
  );
};

export default ThemeSwitch;
