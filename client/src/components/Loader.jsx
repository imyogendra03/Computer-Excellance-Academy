import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div style={{
      height: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, #ffffff 0%, #f1f5ff 100%)",
      gap: "24px"
    }}>
      <div style={{ position: "relative", width: "100px", height: "100px" }}>
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
           style={{
             width: "100%",
             height: "100%",
             border: "3px solid rgba(37, 99, 235, 0.08)",
             borderTopColor: "#3b82f6",
             borderRightColor: "#6366f1",
             borderRadius: "50%",
             boxShadow: "0 0 20px rgba(59, 130, 246, 0.15)"
           }}
        />
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            borderRadius: "12px",
            filter: "blur(1px)"
          }}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: "1.4rem", 
          fontWeight: "900", 
          color: "#0f172a", 
          letterSpacing: "4px",
          textShadow: "0 2px 8px rgba(148, 163, 184, 0.25)"
        }}>COMPUTER EXCELLENCE ACADEMY</h3>
        <div className="mt-2" style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
           {[0, 1, 2].map(i => (
             <motion.div 
               key={i}
               animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
               transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
               style={{ width: "6px", height: "6px", background: "#3b82f6", borderRadius: "50%" }}
             />
           ))}
        </div>
        <p style={{ margin: "12px 0 0", fontSize: "0.8rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
          Initializing Premium Workspace
        </p>
      </div>
    </div>
  );
};

export default Loader;
