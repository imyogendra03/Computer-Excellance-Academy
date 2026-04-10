import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import LeaderboardWidget from "../../components/Leaderboard";

const API = import.meta.env.VITE_API_URL;

const Leaderboard = () => {
  const { batchId } = useParams();
  const token = localStorage.getItem("token");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(batchId || "");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/examinee/${userId}/my-batches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = (res.data?.data || []).filter(b => b.accessStatus === "active");
        setBatches(list);
        if (!selectedBatch && list.length > 0) {
          setSelectedBatch(String(list[0].batch?._id || list[0].batch));
        }
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, [userId]);

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />
      
      <div className="container">
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">🏆 Batch Leaderboard</h2>
              <p className="mb-0">See how you rank among your batchmates based on quiz, test, and attendance scores.</p>
            </div>
          </div>
        </div>

        {/* Batch Selector */}
        {!loading && batches.length > 1 && (
          <div className="app-panel mb-4">
            <div className="card-body p-4">
              <label className="form-label fw-semibold mb-2">Select Batch:</label>
              <select className="app-input" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                <option value="">Choose a batch...</option>
                {batches.map(b => (
                  <option key={b.batch?._id || b.batch} value={String(b.batch?._id || b.batch)}>
                    {b.batch?.batchName || "Batch"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Leaderboard Widget */}
        {selectedBatch ? (
          <LeaderboardWidget batchId={selectedBatch} />
        ) : !loading && (
          <div className="app-panel">
            <div className="card-body p-4 text-center py-5">
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📚</div>
              <p className="text-muted fw-bold">Enroll in a batch to see the leaderboard.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
