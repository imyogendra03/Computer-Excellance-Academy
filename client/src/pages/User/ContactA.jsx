import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
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
  const userId = localStorage.getItem("userId");

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchUserMessages = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`https://computer-excellance-academy.onrender.com/api/message/user/${userId}`);
      setMessages(res?.data?.message || []);
    } catch (err) {
      showToast("Failed to load messages", "error");
    }
  };

  useEffect(() => {
    fetchUserMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      showToast("Please type your feedback", "error");
      return;
    }

    try {
      setSending(true);
      await axios.post("https://computer-excellance-academy.onrender.com/api/message", {
        question,
        examineeId: userId,
      });
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
      await axios.put(`https://computer-excellance-academy.onrender.com/api/message/edit/${editingMessage._id}`, {
        question: editText,
        role: "user",
        userId,
      });
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
      await axios.put(`https://computer-excellance-academy.onrender.com/api/message/delete/${id}`, {
        role: "user",
        userId,
      });
      showToast("Message deleted successfully");
      fetchUserMessages();
    } catch (err) {
      showToast("Failed to delete message", "error");
    }
  };

  return (
    <>
      <style>{`
        .ca-page {
          min-height: 100vh;
          padding: 24px 0;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
        }

        .ca-shell {
          max-width: 900px;
          margin: 0 auto;
        }

        .ca-hero {
          padding: 28px;
          border-radius: 28px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5);
          box-shadow: 0 20px 45px rgba(37, 99, 235, 0.22);
          margin-bottom: 20px;
        }

        .ca-chat {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .ca-chat-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #0f172a;
        }

        .ca-chat-box {
          height: 480px;
          overflow-y: auto;
          padding: 20px;
          background: linear-gradient(180deg, #f8fbff 0%, #fdfdff 100%);
        }

        .ca-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .ca-message-group {
          margin-bottom: 18px;
        }

        .ca-message {
          max-width: 78%;
          padding: 14px 16px;
          border-radius: 18px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .ca-user-wrap {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 10px;
        }

        .ca-admin-wrap {
          display: flex;
          justify-content: flex-start;
        }

        .ca-user {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #fff;
          border-bottom-right-radius: 6px;
        }

        .ca-admin {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #dbeafe;
          border-bottom-left-radius: 6px;
        }

        .ca-message-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 6px;
        }

        .ca-message-role {
          font-size: 12px;
          font-weight: 700;
          opacity: 0.9;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ca-message p {
          margin: 0;
          line-height: 1.5;
          word-break: break-word;
        }

        .ca-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          justify-content: flex-end;
        }

        .ca-icon-btn {
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ca-icon-btn.edit {
          background: rgba(255,255,255,0.18);
          color: #fff;
        }

        .ca-icon-btn.delete {
          background: rgba(127,29,29,0.18);
          color: #fff;
          border: 1px solid rgba(254,202,202,0.25);
        }

        .ca-icon-btn.admin-delete {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
        }

        .ca-input-bar {
          padding: 16px;
          border-top: 1px solid #e2e8f0;
          background: #fff;
        }

        .ca-form {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .ca-input-wrap {
          flex: 1;
          position: relative;
        }

        .ca-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .ca-input {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 16px;
          padding: 14px 14px 14px 42px;
          outline: none;
        }

        .ca-input:focus,
        .ca-textarea:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.08);
        }

        .ca-send-btn {
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 14px;
          padding: 14px 18px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          min-width: 130px;
        }

        .ca-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          min-width: 280px;
          color: #fff;
          padding: 14px 16px;
          border-radius: 16px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .ca-toast.success {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .ca-toast.error {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .ca-toast-close {
          border: none;
          background: transparent;
          color: #fff;
          font-size: 16px;
        }

        .ca-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15, 23, 42, 0.45);
        }

        .ca-modal {
          width: 100%;
          max-width: 680px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .ca-modal-header {
          padding: 20px 24px;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #0f172a, #2563eb);
        }

        .ca-modal-close {
          border: none;
          background: rgba(255, 255, 255, 0.16);
          color: #fff;
          width: 38px;
          height: 38px;
          border-radius: 10px;
        }

        .ca-textarea {
          width: 100%;
          border: 1px solid #dbe3f0;
          border-radius: 14px;
          padding: 12px 14px;
          outline: none;
          resize: none;
        }

        .ca-btn-primary {
          border: none;
          color: #fff;
          font-weight: 600;
          border-radius: 14px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }

        .ca-btn-soft {
          border-radius: 14px;
          padding: 12px 20px;
          font-weight: 600;
          background: #eef2ff;
          color: #3730a3;
          border: 1px solid #c7d2fe;
        }

        @media (max-width: 767px) {
          .ca-hero {
            padding: 22px;
          }

          .ca-chat-box {
            height: 420px;
          }

          .ca-message {
            max-width: 90%;
          }

          .ca-form {
            flex-direction: column;
            align-items: stretch;
          }

          .ca-send-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="ca-page">
        <div className="container">
          <div className="ca-shell">
            {toast.show && (
              <div className={`ca-toast ${toast.type === "error" ? "error" : "success"}`}>
                <span>{toast.message}</span>
                <button
                  type="button"
                  className="ca-toast-close"
                  onClick={() => setToast({ show: false, message: "", type: "success" })}
                >
                  <FiX />
                </button>
              </div>
            )}

            <div className="ca-hero">
              <h2 className="fw-bold mb-2">Feedback Chat</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Send feedback, track replies, and stay connected with admin support.
              </p>
            </div>

            <div className="ca-chat">
              <div className="ca-chat-header">
                <FiMessageCircle />
                <span>Your Conversation</span>
              </div>

              <div className="ca-chat-box">
                {messages.length === 0 ? (
                  <div className="ca-empty">No feedback yet</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className="ca-message-group">
                      <div className="ca-user-wrap">
                        <div className="ca-message ca-user">
                          <div className="ca-message-top">
                            <span className="ca-message-role">
                              <FiUser />
                              You
                            </span>
                          </div>
                          <p>{msg.question}</p>
                          <div className="ca-actions">
                            <button
                              type="button"
                              className="ca-icon-btn edit"
                              onClick={() => openEditModal(msg)}
                            >
                              <FiEdit3 />
                            </button>
                            <button
                              type="button"
                              className="ca-icon-btn delete"
                              onClick={() => deleteByUser(msg._id)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>

                      {msg.answer && (
                        <div className="ca-admin-wrap">
                          <div className="ca-message ca-admin">
                            <div className="ca-message-top">
                              <span className="ca-message-role">
                                <FiMessageCircle />
                                Admin
                              </span>
                            </div>
                            <p>{msg.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef}></div>
              </div>

              <div className="ca-input-bar">
                <form onSubmit={sendMessage} className="ca-form">
                  <div className="ca-input-wrap">
                    <FiMessageCircle className="ca-input-icon" />
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your feedback..."
                      className="ca-input"
                    />
                  </div>

                  <button type="submit" className="ca-send-btn" disabled={sending}>
                    <FiSend className="me-2" />
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editingMessage && (
        <div className="ca-modal-backdrop">
          <div className="ca-modal">
            <div className="ca-modal-header">
              <div>
                <h4 className="fw-bold mb-1">Edit Feedback</h4>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Update your message before saving.
                </p>
              </div>

              <button type="button" className="ca-modal-close" onClick={closeEditModal}>
                <FiX />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="form-label fw-semibold">Your Message</label>
                <textarea
                  rows="5"
                  className="ca-textarea"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Edit your feedback..."
                />
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="ca-btn-primary" onClick={updateMessage}>
                  Update Message
                </button>
                <button type="button" className="ca-btn-soft" onClick={closeEditModal}>
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
