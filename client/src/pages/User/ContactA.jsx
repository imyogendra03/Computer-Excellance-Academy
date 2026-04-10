import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import {
  FiEdit3,
  FiMessageCircle,
  FiSend,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

const ContactA = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const messagesEndRef = useRef(null);
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  })();
  const userId =
    localStorage.getItem("userId") || storedUser?._id || storedUser?.id || "";
  const token = localStorage.getItem("token") || localStorage.getItem("userToken") || "";
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchUserMessages = async () => {
    if (!userId || !token) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/message/user/${userId}`,
        { headers: authHeaders }
      );
      setMessages(res?.data?.message || []);
    } catch (err) {
      showToast("Failed to load messages", "error");
    }
  };

  useEffect(() => {
    fetchUserMessages();
    if (!userId || !token) return undefined;
    const intervalId = setInterval(fetchUserMessages, 12000);
    return () => clearInterval(intervalId);
  }, [userId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      showToast("Please type your feedback", "error");
      return;
    }
    if (!userId || !token) {
      showToast("Session invalid. Please login again.", "error");
      return;
    }

    try {
      setSending(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/message`,
        {
          question,
          examineeId: userId,
        },
        { headers: authHeaders }
      );
      setQuestion("");
      showToast("Message sent successfully");
      fetchUserMessages();
    } catch (err) {
      showToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const openEditModal = (msg) => {
    setEditingMessage(msg);
    setEditText(msg.question || "");
  };

  const closeEditModal = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const updateMessage = async () => {
    if (!editingMessage?._id || !editText.trim()) {
      showToast("Message cannot be empty", "error");
      return;
    }

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/message/edit/${editingMessage._id}`,
        {
          question: editText,
          role: "user",
          userId,
        },
        { headers: authHeaders }
      );
      closeEditModal();
      showToast("Message updated successfully");
      fetchUserMessages();
    } catch (err) {
      showToast("Failed to update message", "error");
    }
  };

  const deleteByUser = async (id) => {
    const confirmed = window.confirm("Delete this message?");
    if (!confirmed) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/message/delete/${id}`,
        {
          role: "user",
          userId,
        },
        { headers: authHeaders }
      );
      showToast("Message deleted successfully");
      fetchUserMessages();
    } catch (err) {
      showToast("Failed to delete message", "error");
    }
  };

  return (
    <>
      <div className="app-page">
        <div className="container">
          <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Hero Section */}
            <div className="app-hero mb-4">
              <div className="row align-items-center g-4">
                <div className="col-lg-8">
                  <h2 className="fw-bold mb-2">Feedback <em style={{ fontStyle: "normal", color: "#60a5fa" }}>Chat</em></h2>
                  <p className="mb-0">Send feedback, track replies, and stay connected with admin support.</p>
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div className="app-panel">
              {/* Chat Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px", fontWeight: "700", color: "#0f172a" }}>
                <FiMessageCircle />
                <span>Your Conversation</span>
              </div>

              {/* Chat Box */}
              <div style={{ height: "480px", overflowY: "auto", padding: "20px", background: "linear-gradient(180deg, #f8fbff 0%, #fdfdff 100%)" }}>
                {!userId ? (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    Please login again to load your support chat.
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    No feedback yet
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} style={{ marginBottom: "18px" }}>
                      {/* User Message */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                        <div style={{ maxWidth: "78%", padding: "14px 16px", borderRadius: "18px", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)", background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", borderBottomRightRadius: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", opacity: 0.9, display: "flex", alignItems: "center", gap: "6px" }}>
                              <FiUser /> You
                            </span>
                          </div>
                          <p style={{ margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>{msg.question}</p>
                          <div style={{ display: "flex", gap: "8px", marginTop: "10px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              style={{ border: "none", width: "34px", height: "34px", borderRadius: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.18)", color: "#fff", cursor: "pointer" }}
                              onClick={() => openEditModal(msg)}
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              type="button"
                              style={{ border: "none", width: "34px", height: "34px", borderRadius: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(127,29,29,0.18)", color: "#fff", cursor: "pointer" }}
                              onClick={() => deleteByUser(msg._id)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Admin Reply */}
                      {msg.answer && (
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                          <div style={{ maxWidth: "78%", padding: "14px 16px", borderRadius: "18px", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)", background: "#ffffff", color: "#0f172a", border: "1px solid #dbeafe", borderBottomLeftRadius: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "6px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "700", opacity: 0.9, display: "flex", alignItems: "center", gap: "6px" }}>
                                <FiMessageCircle /> Admin
                              </span>
                            </div>
                            <p style={{ margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>{msg.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef}></div>
              </div>

              {/* Input Bar */}
              <div style={{ padding: "16px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
                <form onSubmit={sendMessage} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <FiMessageCircle style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your feedback..."
                      className="app-input"
                      style={{ paddingLeft: "42px" }}
                    />
                  </div>
                  <button type="submit" className="app-btn-primary" disabled={sending} style={{ minWidth: "130px", padding: "12px 18px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <FiSend /> {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMessage && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(15, 23, 42, 0.45)" }}>
          <div style={{ width: "100%", maxWidth: "680px", background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #0f172a, #2563eb)" }}>
              <div>
                <h5 className="fw-bold mb-1">Edit Feedback</h5>
                <p className="mb-0" style={{ opacity: 0.8 }}>Update your message before saving.</p>
              </div>
              <button type="button" style={{ border: "none", background: "rgba(255, 255, 255, 0.16)", color: "#fff", width: "38px", height: "38px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={closeEditModal}>
                <FiX />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <div className="mb-4">
                <label className="form-label fw-semibold">Your Message</label>
                <textarea
                  rows="5"
                  className="app-textarea"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Edit your feedback..."
                />
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="app-btn-primary" onClick={updateMessage}>
                  Update Message
                </button>
                <button type="button" className="app-btn-soft" onClick={closeEditModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactA;
