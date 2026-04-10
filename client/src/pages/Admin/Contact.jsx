import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiSearch, FiSend, FiUser, FiMessageSquare, FiArrowLeft, FiClock, FiGlobe } from "react-icons/fi";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const Contact = () => {
  const [messages, setMessages] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const adminToken = localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
  const authHeaders = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const fetchAll = async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/message/all`, {
        headers: authHeaders,
      });
      setMessages(res?.data?.message || []);
    } catch (err) {
      showToast("Failed to load messages", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [adminToken]);

  // Group messages by User
  const userConversations = useMemo(() => {
    const map = new Map();
    
    messages.forEach(msg => {
      let key = "";
      let meta = {};

      if (msg.examineeId) {
        key = String(msg.examineeId._id || msg.examineeId);
        meta = {
          id: key,
          name: msg.examineeId.name || "Student",
          email: msg.examineeId.email || "",
          type: "registered"
        };
      } else {
        key = msg.senderEmail || "guest";
        meta = {
          id: key,
          name: msg.senderName || "Public User",
          email: msg.senderEmail || "",
          type: "guest"
        };
      }

      if (!map.has(key)) {
        map.set(key, { ...meta, messages: [] });
      }
      map.get(key).messages.push(msg);
    });

    return Array.from(map.values()).sort((a, b) => {
      const aDate = new Date(a.messages[0]?.createdAt);
      const bDate = new Date(b.messages[0]?.createdAt);
      return bDate - aDate;
    });
  }, [messages]);

  const filteredUsers = userConversations.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeChat = selectedUser ? userConversations.find(u => u.id === selectedUser.id) : null;

  const handleSendReply = async (msgId) => {
    if (!replyText.trim()) return;
    try {
      setSending(true);
      await axios.put(`${import.meta.env.VITE_API_URL}/api/message/reply/${msgId}`, {
        answer: replyText.trim(),
        role: "admin",
      }, { headers: authHeaders });
      
      setReplyText("");
      showToast("Reply sent!");
      fetchAll();
    } catch (err) {
      showToast("Failed to send reply", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Support Inbox ({messages.length})</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>Respond to student queries and public support requests in real-time.</p>
            </div>
          </div>
        </div>

        <div className="app-panel overflow-hidden" style={{ minHeight: "70vh", display: 'flex' }}>
          {/* Sidebar: User List */}
          <div className={`col-md-4 border-end ${selectedUser ? 'd-none d-md-block' : 'col-12'}`} style={{ background: '#f8fafc' }}>
            <div className="p-3 border-bottom bg-white">
              <div className="app-search w-100">
                <FiSearch className="app-search__icon" />
                <input 
                  type="text" 
                  className="form-control app-input" 
                  placeholder="Search chats..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="user-list" style={{ overflowY: 'auto', maxHeight: 'calc(70vh - 70px)' }}>
              {fetching && messages.length === 0 ? (
                <div className="p-4 text-center text-muted">Loading...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted">No conversations found.</div>
              ) : (
                filteredUsers.map(u => (
                  <div 
                    key={u.id} 
                    className={`p-3 border-bottom chat-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                    onClick={() => setSelectedUser(u)}
                    style={{ cursor: 'pointer', transition: '0.2s', background: selectedUser?.id === u.id ? '#eff6ff' : '' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: u.type === 'registered' ? '#dbeafe' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.type === 'registered' ? '#1d4ed8' : '#64748b' }}>
                        {u.type === 'registered' ? <FiUser size={20} /> : <FiGlobe size={20} />}
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="d-flex justify-content-between">
                          <h6 className="fw-bold mb-0 text-truncate">{u.name}</h6>
                          <span className="smaller text-muted">{new Date(u.messages[0]?.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="text-muted smaller text-truncate">{u.messages[0]?.question}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`col-md-8 col-12 d-flex flex-column ${!selectedUser ? 'd-none d-md-flex align-items-center justify-content-center' : ''}`} style={{ background: '#fff' }}>
            {!activeChat ? (
              <div className="text-center p-5 opacity-50">
                <FiMessageSquare size={60} className="mb-3" />
                <h4>Select a conversation</h4>
                <p>Choose a student from the left to start chatting.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-3 border-bottom d-flex align-items-center gap-3">
                  <button className="btn btn-link p-0 d-md-none" onClick={() => setSelectedUser(null)}><FiArrowLeft size={20} /></button>
                  <div className="fw-bold">
                    {activeChat.name}
                    <div className="small text-muted fw-normal">{activeChat.email} • {activeChat.type.toUpperCase()}</div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-grow-1 p-4" style={{ overflowY: 'auto', maxHeight: 'calc(70vh - 160px)', background: '#f1f5f9' }}>
                  {activeChat.messages.map(msg => (
                    <div key={msg._id} className="mb-4">
                      {/* User Message */}
                      <div className="d-flex justify-content-start mb-2">
                        <div className="p-3 shadow-sm" style={{ background: '#fff', borderRadius: '0 16px 16px 16px', maxWidth: '80%' }}>
                          <div className="fw-bold mb-1" style={{ fontSize: '0.9rem' }}>{msg.question}</div>
                          <div className="smaller text-muted d-flex align-items-center gap-1">
                            <FiClock size={10} /> {new Date(msg.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Admin Reply */}
                      {msg.answer ? (
                        <div className="d-flex justify-content-end">
                          <div className="p-3 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '16px 0 16px 16px', maxWidth: '80%' }}>
                            <div className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>{msg.answer}</div>
                            <div className="smaller opacity-75 text-end mt-1">Admin • Replied</div>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex justify-content-end mt-2">
                          <div className="w-100" style={{ maxWidth: '80%' }}>
                            <div className="input-group">
                              <input 
                                type="text" 
                                className="form-control app-input" 
                                placeholder="Type your reply..." 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={sending}
                              />
                              <button 
                                className="btn btn-primary app-btn-primary px-3" 
                                onClick={() => handleSendReply(msg._id)}
                                disabled={sending || !replyText.trim()}
                              >
                                <FiSend />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
