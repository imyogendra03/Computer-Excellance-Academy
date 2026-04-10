import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiX,
  FiClock,
  FiSearch,
  FiFilter,
  FiSave,
  FiChevronRight,
  FiAlertCircle
} from "react-icons/fi";

const AttendanceDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { studentId: { status, remarks } }
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0 });

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch && date) {
      fetchStudentsAndAttendance();
    }
  }, [selectedBatch, date]);

  const fetchBatches = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await axios.get(`${apiUrl}/api/batch`);
      setBatches(res.data.data || []);
    } catch (err) {
      console.error("Failed to load batches:", err.message);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const stdRes = await axios.get(`${apiUrl}/api/attendance/students/${selectedBatch}`, config);
      const studentList = stdRes.data.data || [];
      setStudents(studentList);

      const attRes = await axios.get(`${apiUrl}/api/attendance`, {
        ...config,
        params: { batch: selectedBatch, startDate: date, endDate: date }
      });

      const existingAtt = attRes.data.data || [];
      const attMap = {};
      studentList.forEach(s => {
        const found = existingAtt.find(a => a.examinee?._id === s._id);
        attMap[s._id] = {
          status: found ? found.status : "Present",
          remarks: found ? found.remarks : "",
          isExisting: !!found
        };
      });
      setAttendance(attMap);
      updateStats(attMap);
    } catch (err) {
      console.error("Error fetching data", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (currentAtt) => {
    const s = { present: 0, absent: 0, late: 0 };
    Object.values(currentAtt).forEach(item => {
      if (item.status === "Present") s.present++;
      else if (item.status === "Absent") s.absent++;
      else if (item.status === "Late") s.late++;
    });
    setStats(s);
  };

  const handleStatusChange = (studentId, status) => {
    const newAtt = { ...attendance, [studentId]: { ...attendance[studentId], status } };
    setAttendance(newAtt);
    updateStats(newAtt);
  };

  const handleBulkMark = (status) => {
    const newAtt = { ...attendance };
    students.forEach(s => {
      newAtt[s._id] = { ...newAtt[s._id], status };
    });
    setAttendance(newAtt);
    updateStats(newAtt);
  };

  const saveAttendance = async () => {
    setMarking(true);
    try {
      const attendanceData = Object.entries(attendance).map(([studentId, data]) => ({
        examinee: studentId,
        status: data.status,
        remarks: data.remarks || ""
      }));

      const token = localStorage.getItem("adminToken");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/attendance/bulk`, {
        batch: selectedBatch,
        date,
        attendanceData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ Attendance saved successfully!");
      fetchStudentsAndAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setMarking(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="attendance-page" 
      style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>Attendance Dashboard</h1>
            <p style={{ color: "#64748b", marginTop: "4px" }}>Mark and track student daily attendance records</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(37, 117, 252, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={saveAttendance}
            disabled={marking || !selectedBatch}
            style={{ 
              background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)", 
              color: "white", 
              padding: "12px 28px", 
              borderRadius: "14px", 
              border: "none", 
              fontWeight: "700", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px", 
              boxShadow: "0 6px 12px rgba(37, 117, 252, 0.2)",
              cursor: (marking || !selectedBatch) ? "not-allowed" : "pointer"
            }}
          >
            {marking ? <div className="spinner-small" /> : <FiSave size={18} />}
            {marking ? "Saving..." : "Save Now"}
          </motion.button>
        </motion.div>

        {/* Filters Card */}
        <div style={{ background: "white", padding: "24px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div className="form-group-att">
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#64748b", marginBottom: "8px" }}>Select Batch</label>
              <div style={{ position: "relative" }}>
                <FiUsers size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <select 
                  value={selectedBatch} 
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "10px", border: "1px solid #e2e8f0", appearance: "none" }}
                >
                  <option value="">Choose Batch...</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group-att">
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#64748b", marginBottom: "8px" }}>Select Date</label>
              <div style={{ position: "relative" }}>
                <FiCalendar size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                />
              </div>
            </div>

            <div className="form-group-att">
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#64748b", marginBottom: "8px" }}>Quick Search</label>
              <div style={{ position: "relative" }}>
                <FiSearch size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input 
                  type="text" 
                  placeholder="Name or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                />
              </div>
            </div>
          </div>
        </div>

        {selectedBatch ? (
          <>
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "24px" }}
            >
              {[
                { label: "PRESENT", val: stats.present, color: "#10b981" },
                { label: "ABSENT", val: stats.absent, color: "#ef4444" },
                { label: "LATE", val: stats.late, color: "#f59e0b" },
                { label: "TOTAL", val: students.length, color: "#6366f1" }
              ].map((s, i) => (
                <motion.div 
                  key={i}
                  variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                  style={{ background: "white", padding: "20px", borderRadius: "16px", borderLeft: `4px solid ${s.color}`, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
                >
                  <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: "800", letterSpacing: "1px" }}>{s.label}</div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "800", color: s.color }}>{s.val}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Bulk Actions */}
            <div style={{ marginBottom: "16px", display: "flex", gap: "10px" }}>
              <button onClick={() => handleBulkMark("Present")} style={{ background: "#e1fcf2", color: "#065f46", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>All Present</button>
              <button onClick={() => handleBulkMark("Absent")} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>All Absent</button>
            </div>

            {/* Students Table */}
            <motion.div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Student</th>
                    <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "16px 24px", fontSize: "0.75rem", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Last Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      <tr><td colSpan="3" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>Loading students...</td></tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr><td colSpan="3" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No students found in this batch</td></tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <motion.tr 
                          key={student._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                          transition={{ duration: 0.2 }}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.9rem" }}>{student.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{student.email}</div>
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              {[
                                { label: "Present", color: "#10b981", icon: FiCheckCircle },
                                { label: "Absent", color: "#ef4444", icon: FiX },
                                { label: "Late", color: "#f59e0b", icon: FiClock }
                              ].map((opt) => (
                                <button
                                  key={opt.label}
                                  onClick={() => handleStatusChange(student._id, opt.label)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    border: attendance[student._id]?.status === opt.label ? `2px solid ${opt.color}` : "1px solid #e2e8f0",
                                    background: attendance[student._id]?.status === opt.label ? `${opt.color}10` : "transparent",
                                    color: attendance[student._id]?.status === opt.label ? opt.color : "#64748b",
                                    fontSize: "0.8rem",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                  }}
                                >
                                  <opt.icon size={14} />
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: "16px 24px" }}>
                            {attendance[student._id]?.isExisting ? (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "100px", background: "#f1f5f9", color: "#475569", fontSize: "0.7rem", fontWeight: "700" }}>
                                <FiCheckCircle size={12} color="#10b981" /> Recorded
                              </div>
                            ) : (
                              <div style={{ color: "#cbd5e1", fontSize: "0.7rem", fontWeight: "600 italic" }}>Not marked</div>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ padding: "80px 20px", textAlign: "center", background: "white", borderRadius: "20px", border: "2px dashed #e2e8f0" }}
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "#f8fafc", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}
            >
              <FiFilter size={32} color="#94a3b8" />
            </motion.div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#1e293b" }}>Ready to Take Attendance?</h3>
            <p style={{ color: "#64748b", maxWidth: "320px", margin: "12px auto 0", lineHeight: "1.6" }}>Select a batch from the dropdown above to load the current students and start marking your records.</p>
          </motion.div>
        )}
      </div>
      <style>{`
        .spinner-small {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .form-group-att select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }
      `}</style>
    </motion.div>
  );
};

export default AttendanceDashboard;
