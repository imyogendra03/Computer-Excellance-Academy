import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const Contact = () => {
  const [messages, setMessages] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchAll = async () => {
    try {
      setFetching(true);
      const res = await axios.get("https://computer-excellance-academy.onrender.com/api/message/all");
      setMessages(res?.data?.message || []);
    } catch (err) {
      showToast("Failed to load messages", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleReplyChange = (id, value) => {
    setReplyInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const sendReply = async (id) => {
    const answer = (replyInputs[id] || "").trim();

    if (!answer) {
      showToast("Please type a reply", "error");
      return;
    }

    try {
      setSendingId(id);
      await axios.put(`https://computer-excellance-academy.onrender.com/api/message/reply/${id}`, {
        answer,
        role: "admin",
      });
      setReplyInputs((prev) => ({ ...prev, [id]: "" }));
      showToast("Reply sent successfully");
      fetchAll();
    } catch (err) {
      showToast("Failed to send reply", "error");
    } finally {
      setSendingId(null);
    }
  };

  const openEditModal = (msg) => {
    setEditingMessage(msg);
    setEditReplyText(msg.answer || "");
  };

  const closeEditModal = () => {
    setEditingMessage(null);
    setEditReplyText("");
  };

  const updateReply = async () => {
    if (!editingMessage?._id) return;

    if (!editReplyText.trim()) {
      showToast("Reply cannot be empty", "error");
      return;
    }

    try {
      setSendingId(editingMessage._id);
      await axios.put(
        `https://computer-excellance-academy.onrender.com/api/message/reply/${editingMessage._id}`,
        {
          answer: editReplyText.trim(),
          role: "admin",
        }
      );
      closeEditModal();
      showToast("Reply updated successfully");
      fetchAll();
    } catch (err) {
      showToast("Failed to update reply", "error");
    } finally {
      setSendingId(null);
    }
  };

  const deleteByAdmin = async (id) => {
    const confirmed = window.confirm("Delete this reply?");
    if (!confirmed) return;

    try {
      await axios.put(`https://computer-excellance-academy.onrender.com/api/message/delete/${id}`, {
        role: "admin",
      });
      showToast("Reply deleted successfully");
      fetchAll();
    } catch (err) {
      showToast("Failed to delete reply", "error");
    }
  };

  const filteredMessages = useMemo(() => {
    const keyword = search.toLowerCase();

    return messages.filter((msg) => {
      return (
        msg.examineeId?.name?.toLowerCase().includes(keyword) ||
        msg.examineeId?.email?.toLowerCase().includes(keyword) ||
        msg.question?.toLowerCase().includes(keyword) ||
        msg.answer?.toLowerCase().includes(keyword)
      );
    });
  }, [messages, search]);

  return (
    <div
      className="container py-4"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
      }}
    >
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: "280px",
            padding: "14px 16px",
            borderRadius: "16px",
            color: "#fff",
            background:
              toast.type === "error"
                ? "linear-gradient(135deg,#dc2626,#ef4444)"
                : "linear-gradient(135deg,#2563eb,#4f46e5)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center gap-3">
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#fff",
                fontSize: "16px",
              }}
            >
              x
            </button>
          </div>
        </div>
      )}

      <div
        className="p-4 p-md-5 mb-4 text-white"
        style={{
          borderRadius: "28px",
          background: "linear-gradient(135deg, #0f172a, #1d4ed8, #4f46e5)",
          boxShadow: "0 20px 45px rgba(37, 99, 235, 0.22)",
        }}
      >
        <div className="row align-items-center g-4">
          <div className="col-lg-8">
            <h2 className="fw-bold mb-2">Contact Support Dashboard</h2>
            <p className="mb-0" style={{ opacity: 0.88 }}>
              Manage user feedback, send replies, and keep communication organized.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div
              className="d-inline-block px-4 py-3"
              style={{
                borderRadius: "18px",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{ fontSize: "13px", opacity: 0.8 }}>Total Messages</div>
              <div className="fw-bold" style={{ fontSize: "28px" }}>
                {messages.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">All Messages</div>
            <h4 className="fw-bold mb-0">{messages.length}</h4>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">Visible Messages</div>
            <h4 className="fw-bold mb-0">{filteredMessages.length}</h4>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="p-4 bg-white h-100"
            style={{
              borderRadius: "22px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div className="text-muted mb-2">Reply Status</div>
            <h4 className="fw-bold mb-0">{sendingId ? "Sending..." : "Ready"}</h4>
          </div>
        </div>
      </div>

      <div
        className="card border-0"
        style={{
          borderRadius: "24px",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1">User Messages</h4>
              <p className="text-muted mb-0">
                Search, reply, edit, and manage support messages easily.
              </p>
            </div>

            <div style={{ minWidth: "240px", position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#64748b",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  borderRadius: "14px",
                  padding: "12px 14px 12px 40px",
                  border: "1px solid #dbe3f0",
                }}
              />
            </div>
          </div>

          <div className="d-none d-md-block table-responsive">
            <table className="table align-middle">
              <thead>
                <tr style={{ color: "#475569" }}>
                  <th>#</th>
                  <th>Examinee</th>
                  <th>Feedback</th>
                  <th>Admin Reply</th>
                  <th style={{ minWidth: "280px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      Loading messages...
                    </td>
                  </tr>
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No messages found.
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((msg, index) => (
                    <tr key={msg._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="fw-semibold">{msg.examineeId?.name || "N/A"}</div>
                        <div style={{ fontSize: "0.85em", color: "#64748b" }}>
                          {msg.examineeId?.email || ""}
                        </div>
                      </td>
                      <td style={{ maxWidth: "280px" }}>{msg.question}</td>
                      <td>
                        {msg.answer ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "8px 12px",
                              borderRadius: "14px",
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              fontSize: "13px",
                            }}
                          >
                            {msg.answer}
                          </span>
                        ) : (
                          <span className="text-muted">No reply yet</span>
                        )}
                      </td>
                      <td>
                        <div style={{ position: "relative" }} className="mb-2">
                          <span
                            style={{
                              position: "absolute",
                              left: "14px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#64748b",
                            }}
                          >
                            ✉
                          </span>
                          <input
                            type="text"
                            placeholder="Type reply..."
                            value={replyInputs[msg._id] || ""}
                            onChange={(e) =>
                              handleReplyChange(msg._id, e.target.value)
                            }
                            className="form-control"
                            style={{
                              borderRadius: "14px",
                              padding: "12px 14px 12px 40px",
                              border: "1px solid #dbe3f0",
                            }}
                          />
                        </div>

                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm text-white"
                            onClick={() => sendReply(msg._id)}
                            disabled={sendingId === msg._id}
                            style={{
                              border: "none",
                              borderRadius: "10px",
                              padding: "8px 14px",
                              background:
                                sendingId === msg._id
                                  ? "#94a3b8"
                                  : "linear-gradient(135deg, #16a34a, #22c55e)",
                            }}
                          >
                            {sendingId === msg._id ? "Sending..." : "Send Reply"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm text-white"
                            onClick={() => openEditModal(msg)}
                            style={{
                              border: "none",
                              borderRadius: "10px",
                              padding: "8px 14px",
                              background:
                                "linear-gradient(135deg, #0284c7, #2563eb)",
                            }}
                          >
                            Edit Reply
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => deleteByAdmin(msg._id)}
                            style={{
                              borderRadius: "10px",
                              padding: "8px 14px",
                              background: "#fff1f2",
                              color: "#be123c",
                              border: "1px solid #fecdd3",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-block d-md-none">
            {fetching ? (
              <div className="text-center py-4">Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-4 text-muted">No messages found.</div>
            ) : (
              <div className="row g-3">
                {filteredMessages.map((msg, index) => (
                  <div className="col-12" key={msg._id}>
                    <div
                      className="p-3 bg-white"
                      style={{
                        borderRadius: "18px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>#{index + 1}</strong>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "999px",
                            background: msg.answer ? "#dcfce7" : "#fef3c7",
                            color: msg.answer ? "#166534" : "#92400e",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {msg.answer ? "Replied" : "Pending"}
                        </span>
                      </div>

                      <div className="fw-semibold">{msg.examineeId?.name || "N/A"}</div>
                      <div className="text-muted small mb-2">
                        {msg.examineeId?.email || ""}
                      </div>

                      <div className="mb-2">
                        <strong>Feedback:</strong>
                        <div className="text-muted small">{msg.question}</div>
                      </div>

                      <div className="mb-3">
                        <strong>Reply:</strong>
                        <div className="text-muted small">
                          {msg.answer || "No reply yet"}
                        </div>
                      </div>

                      <div style={{ position: "relative" }} className="mb-2">
                        <span
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#64748b",
                          }}
                        >
                          ✉
                        </span>
                        <input
                          type="text"
                          placeholder="Type reply..."
                          value={replyInputs[msg._id] || ""}
                          onChange={(e) =>
                            handleReplyChange(msg._id, e.target.value)
                          }
                          className="form-control"
                          style={{
                            borderRadius: "14px",
                            padding: "12px 14px 12px 40px",
                            border: "1px solid #dbe3f0",
                          }}
                        />
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn text-white w-100"
                          onClick={() => sendReply(msg._id)}
                          disabled={sendingId === msg._id}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            background:
                              sendingId === msg._id
                                ? "#94a3b8"
                                : "linear-gradient(135deg, #16a34a, #22c55e)",
                          }}
                        >
                          {sendingId === msg._id ? "Sending..." : "Send Reply"}
                        </button>

                        <button
                          type="button"
                          className="btn text-white w-100"
                          onClick={() => openEditModal(msg)}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            background: "linear-gradient(135deg, #0284c7, #2563eb)",
                          }}
                        >
                          Edit Reply
                        </button>

                        <button
                          type="button"
                          className="btn w-100"
                          onClick={() => deleteByAdmin(msg._id)}
                          style={{
                            borderRadius: "10px",
                            padding: "10px 14px",
                            background: "#fff1f2",
                            color: "#be123c",
                            border: "1px solid #fecdd3",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998,
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              background: "#fff",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              style={{
                padding: "20px 24px",
                color: "#fff",
                background: "linear-gradient(135deg, #0f172a, #2563eb)",
              }}
            >
              <div>
                <h4 className="fw-bold mb-1">Edit Reply</h4>
                <p className="mb-0" style={{ opacity: 0.8 }}>
                  Update your admin response before saving.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.16)",
                  color: "#fff",
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                }}
              >
                x
              </button>
            </div>

            <div className="p-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">User Message</label>
                <div
                  style={{
                    borderRadius: "14px",
                    padding: "12px 14px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#475569",
                  }}
                >
                  {editingMessage.question}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Admin Reply</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "16px",
                      color: "#64748b",
                    }}
                  >
                    ✎
                  </span>
                  <textarea
                    rows="5"
                    className="form-control"
                    value={editReplyText}
                    onChange={(e) => setEditReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    style={{
                      borderRadius: "14px",
                      padding: "12px 14px 12px 40px",
                      border: "1px solid #dbe3f0",
                      resize: "none",
                    }}
                  />
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn text-white"
                  onClick={updateReply}
                  disabled={sendingId === editingMessage._id}
                  style={{
                    border: "none",
                    borderRadius: "14px",
                    padding: "12px 20px",
                    fontWeight: "600",
                    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  }}
                >
                  {sendingId === editingMessage._id ? "Saving..." : "Update Reply"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn"
                  style={{
                    borderRadius: "14px",
                    padding: "12px 20px",
                    fontWeight: "600",
                    background: "#eef2ff",
                    color: "#3730a3",
                    border: "1px solid #c7d2fe",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
