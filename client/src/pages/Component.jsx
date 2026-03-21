import React from "react";
import { useNavigate } from "react-router-dom";

const Component = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
        fontFamily: "'Outfit','Segoe UI',sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#ffffff",
          borderRadius: "28px",
          padding: "40px 28px",
          textAlign: "center",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.10)",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            marginBottom: "16px",
          }}
        >
          404
        </div>

        <h2
          style={{
            margin: "0 0 12px",
            color: "#0f172a",
            fontWeight: "800",
          }}
        >
          Page not found
        </h2>

        <p
          style={{
            margin: "0 0 28px",
            color: "#64748b",
            lineHeight: "1.7",
            fontSize: "15px",
          }}
        >
          Jo page aap open karna chah rahe hain wo available nahi hai. Aap home page ya courses page par wapas ja sakte hain.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              border: "none",
              borderRadius: "14px",
              padding: "12px 22px",
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              color: "#fff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Go to Home
          </button>

          <button
            onClick={() => navigate("/courses")}
            style={{
              border: "1px solid #c7d2fe",
              borderRadius: "14px",
              padding: "12px 22px",
              background: "#eef2ff",
              color: "#3730a3",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Explore Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Component;
