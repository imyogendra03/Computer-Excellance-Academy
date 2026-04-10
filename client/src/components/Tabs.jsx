import React from "react";
import { motion } from "framer-motion";

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="lms-tabs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={`lms-tab-btn ${isActive ? "active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            <span>{tab.label}</span>
            {isActive ? (
              <motion.div
                layoutId="lms-tab-pill"
                className="lms-tab-pill"
                transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
