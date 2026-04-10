import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  FiCpu, FiGlobe, FiImage, FiMic, FiSend, FiVolume2, FiX, FiZap, FiMessageSquare, FiTrendingUp, FiActivity, FiSmile
} from "react-icons/fi";

const AIAssistantWidget = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("bilingual");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste! I am your CEA AI Tutor. How can I assist your learning journey today? (Bilingual support enabled)",
    },
  ]);
  const [imageData, setImageData] = useState("");
  const [imageName, setImageName] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef(null);
  const messagesRef = useRef(null);
  const recognitionRef = useRef(null);

  const SpeechRecognitionAPI = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition,
    []
  );

  const hiddenOnRoutes = useMemo(
    () => ["/userdash/myexam", "/userdash/getexam/", "/admin/examination"],
    []
  );

  const shouldHideAssistant = hiddenOnRoutes.some((route) =>
    location.pathname.toLowerCase().startsWith(route.toLowerCase())
  );

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => { if (shouldHideAssistant) setOpen(false); }, [shouldHideAssistant]);

  const speakText = (text) => {
    if (!window.speechSynthesis || !text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "english" ? "en-US" : "hi-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const showToast = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  };

  const startListening = () => {
    if (!SpeechRecognitionAPI) { showToast("Voice input requires modern browser (Chrome/Edge)."); return; }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language === "english" ? "en-US" : "hi-IN";
    recognition.onstart = () => setListening(true);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setMessage((prev) => `${prev} ${transcript}`.trim());
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result || ""));
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const submitMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed && !imageData) return;

    const userEntry = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed || "Analyzing visual input...",
      image: imageData,
      imageName,
    };

    setMessages((prev) => [...prev, userEntry]);
    setMessage(""); setImageData(""); setImageName(""); setSending(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/assistant/chat`, {
        message: trimmed,
        language,
        imageData: userEntry.image || "",
        history: messages.slice(-5).map(m => ({ role: m.role, text: m.text }))
      });

      const answer = response?.data?.data?.answer || "I apologize, but I am unable to process that at the moment.";
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: "assistant", text: answer }]);
      if (autoSpeak) speakText(answer);
    } catch (e) {
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: "assistant", text: "System sync failure. Please verify connection." }]);
    } finally { setSending(false); }
  };

  if (shouldHideAssistant) return null;

  return (
    <>
      <style>{`
        .ai-orb { position: fixed; right: 24px; bottom: 24px; z-index: 9999; display: flex; align-items: center; gap: 12px; padding: 12px 24px; border-radius: 999px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); color: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.3); cursor: pointer; transition: 0.3s cubic-bezier(0.23, 1, 0.32, 1); }
        .ai-orb:hover { transform: translateY(-5px); background: #1e293b; border-color: #6366f1; }
        .ai-orb-inner { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); display: flex; align-items: center; justify-content: center; position: relative; }
        .ai-orb-inner::after { content: ""; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #6366f1; animation: ai-pulse 2s infinite; opacity: 0; }
        @keyframes ai-pulse { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.4); opacity: 0; } }
        
        .ai-hud { position: fixed; right: 24px; bottom: 94px; z-index: 9998; width: 420px; max-width: calc(100vw - 48px); height: 720px; max-height: calc(100vh - 120px); background: rgba(255,255,255,0.95); backdrop-filter: blur(30px); border-radius: 36px; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 40px 80px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; }
        .ai-hud-header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #fff; padding: 28px; position: relative; }
        .ai-hud-header::after { content: ""; position: absolute; top:0; right:0; width:150px; height:150px; background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%); }
        
        .ai-scroll { flex: 1; overflow-y: auto; padding: 24px; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
        .bubble { max-width: 85%; padding: 16px 20px; border-radius: 24px; margin-bottom: 20px; font-size: 0.95rem; line-height: 1.6; position: relative; box-shadow: 0 8px 20px rgba(0,0,0,0.03); }
        .bubble-user { margin-left: auto; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border-bottom-right-radius: 6px; }
        .bubble-ai { background: #fff; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 6px; }
        
        .ai-footer { padding: 20px; background: #fff; border-top: 1px solid #f1f5f9; }
        .ai-input-box { display: flex; align-items: end; gap: 12px; background: #f8fafc; border: 2px solid #f1f5f9; border-radius: 24px; padding: 10px 10px 10px 20px; transition: 0.3s; }
        .ai-input-box:focus-within { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
        .ai-textarea { flex: 1; border: none; background: transparent; outline: none; padding: 8px 0; font-size: 0.95rem; min-height: 24px; max-height: 120px; }
        .ai-btn-send { width: 44px; height: 44px; border-radius: 16px; background: #6366f1; color: #fff; border: none; display: flex; align-items: center; justify-content: center; transition: 0.3s; box-shadow: 0 8px 16px rgba(99,102,241,0.3); }
        .ai-btn-send:hover { transform: scale(1.05); background: #4f46e5; }
        
        .tool-pill { background: #eef2ff; color: #6366f1; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
        .tool-pill:hover { border-color: #6366f1; background: #fff; }
        .tool-pill.active { background: #6366f1; color: #fff; }
        
        @media (max-width: 500px) { .ai-hud { right: 12px; bottom: 84px; width: calc(100vw - 24px); height: calc(100vh - 100px); border-radius: 28px; } }
      `}</style>

      <motion.div className="ai-orb shadow-2xl" onClick={() => setOpen(!open)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
         <div className="ai-orb-inner"><FiCpu className="fs-4" /></div>
         <div className="d-none d-sm-block">
            <div className="fw-black" style={{ fontSize: '14px', lineHeight: 1.2 }}>AI ASSISTANT</div>
            <div className="small opacity-50 fw-bold" style={{ fontSize: '10px' }}>NEURAL SYNC READY</div>
         </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} className="ai-hud shadow-2xl">
            <div className="ai-hud-header">
               <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h4 className="fw-black mb-1 d-flex align-items-center gap-2">CEA Neural <FiZap className="text-warning" /></h4>
                    <p className="small opacity-60 mb-0 fw-bold">Professional Learning Engine</p>
                  </div>
                  <div className="d-flex gap-2">
                     <button className={`btn btn-link p-2 text-white opacity-40 hover-opacity-100 ${autoSpeak ? 'opacity-100' : ''}`} onClick={() => setAutoSpeak(!autoSpeak)}><FiVolume2 /></button>
                     <button className="btn btn-link p-2 text-white opacity-40 hover-opacity-100" onClick={() => setOpen(false)}><FiX /></button>
                  </div>
               </div>
               <div className="d-flex gap-3 mt-4">
                  <div className="d-flex align-items-center gap-2 small fw-bold text-emerald-400 bg-white bg-opacity-10 px-3 py-1 rounded-pill"><div className="bg-emerald-400 rounded-circle" style={{ width: 6, height: 6 }} /> ONLINE</div>
                  <div className="d-flex align-items-center gap-2 small fw-bold text-indigo-200 bg-white bg-opacity-10 px-3 py-1 rounded-pill"><FiGlobe /> BILINGUAL</div>
               </div>
            </div>

            <div className="ai-scroll" ref={messagesRef}>
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={`bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                    <div className="fw-black mb-1 opacity-50" style={{ fontSize: '0.65rem', letterSpacing: 1 }}>{m.role.toUpperCase()}</div>
                    <div className="fw-medium">{m.text}</div>
                    {m.image && <img src={m.image} alt="Ref" className="img-fluid rounded-3 mt-3 border" style={{ maxHeight: 200 }} />}
                  </motion.div>
                ))}
              </AnimatePresence>
              {sending && (
                <div className="bubble bubble-ai d-flex gap-2 align-items-center">
                   <div className="spinner-grow spinner-grow-sm text-primary" />
                   <div className="spinner-grow spinner-grow-sm text-primary" style={{ animationDelay: '0.2s' }} />
                   <div className="spinner-grow spinner-grow-sm text-primary" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>

            {toast && <div className="position-absolute bottom-0 w-100 p-3"><div className="bg-dark text-white p-2 rounded-3 text-center small shadow-lg">{toast}</div></div>}

            <div className="ai-footer">
               <div className="d-flex gap-2 mb-3">
                  <div className={`tool-pill ${language === 'bilingual' ? 'active' : ''}`} onClick={() => setLanguage('bilingual')}><FiGlobe /> MIXED</div>
                  <div className={`tool-pill ${language === 'english' ? 'active' : ''}`} onClick={() => setLanguage('english')}>ENGLISH</div>
                  <div className={`tool-pill ms-auto ${listening ? 'active' : ''}`} onClick={startListening}><FiMic /></div>
                  <div className={`tool-pill ${imageData ? 'active' : ''}`} onClick={() => fileRef.current.click()}><FiImage /></div>
               </div>
               <input type="file" ref={fileRef} hidden onChange={handleImageChange} accept="image/*" />
               <div className="ai-input-box">
                  <textarea className="ai-textarea" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitMessage())} placeholder="Ask me anything..." rows={1} />
                  <button className="ai-btn-send" onClick={submitMessage} disabled={sending}><FiSend /></button>
               </div>
               <div className="mt-3 text-center"><span className="small text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: 1 }}>POWERED BY CEA CORE NEURAL ENGINE</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistantWidget;
