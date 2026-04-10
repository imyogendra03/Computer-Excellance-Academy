import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiPercent, FiPlus, FiTag, FiTrash2, FiX } from "react-icons/fi";
import { SkeletonTable, SkeletonStats } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const API = import.meta.env.VITE_API_URL;

const AdminCoupons = () => {
  const token = localStorage.getItem("adminToken");
  const [coupons, setCoupons] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [form, setForm] = useState({
    code: "", discountType: "flat", discountValue: "", expiryDate: "",
    maxUses: 100, applicableBatches: [], isActive: true,
  });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 2800);
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API}/api/coupon`, { headers: { Authorization: `Bearer ${token}` } });
      setCoupons(res.data?.data || []);
    } catch (_) { showToast("Could not load coupons", "error"); }
    finally { setLoading(false); }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API}/api/batch`, { headers: { Authorization: `Bearer ${token}` } });
      setBatches(res.data?.data || []);
    } catch (_) {}
  };

  useEffect(() => { fetchCoupons(); fetchBatches(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/coupon`, form, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Coupon created successfully!");
      setShowForm(false);
      setForm({ code: "", discountType: "flat", discountValue: "", expiryDate: "", maxUses: 100, applicableBatches: [], isActive: true });
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create coupon", "error");
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await axios.put(`${API}/api/coupon/${id}`, { isActive: !current }, { headers: { Authorization: `Bearer ${token}` } });
      fetchCoupons();
    } catch (_) { showToast("Update failed", "error"); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${API}/api/coupon/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Coupon deleted.");
      fetchCoupons();
    } catch (_) { showToast("Delete failed", "error"); }
  };

  const handleBatchToggle = (id) => {
    setForm(prev => ({
      ...prev,
      applicableBatches: prev.applicableBatches.includes(id)
        ? prev.applicableBatches.filter(b => b !== id)
        : [...prev.applicableBatches, id]
    }));
  };

  return (
    <div className="app-page">
      <AppToast
        toast={toast}
        onClose={() => setToast({ show: false, msg: "", type: "success" })}
      />
      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Coupon Intelligence</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                Architect your economy. Create discount triggers and monitor enrollment incentives at scale.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button type="button" className="app-btn-primary" onClick={() => setShowForm(s => !s)}>
                {showForm ? <><FiX className="me-2" /> Cancel</> : <><FiPlus className="me-2" /> Create Coupon</>}
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
           {loading ? (
             <SkeletonStats count={3} />
           ) : (
             <>
               <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">Total Coupons</div><h4 className="fw-bold mb-0">{coupons.length}</h4></div></div>
               <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">Active Now</div><h4 className="fw-bold mb-0">{coupons.filter(c => c.isActive).length}</h4></div></div>
               <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">Used Redemptions</div><h4 className="fw-bold mb-0">{coupons.reduce((v, c) => v + (c.usedCount || 0), 0)}</h4></div></div>
             </>
           )}
        </div>

        {showForm && (
          <div className="app-panel mb-4">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-4">Create New Campaign Segment</h4>
              <form onSubmit={handleCreate}>
                <div className="row g-4">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Coupon Code</label>
                    <div className="app-input-wrap">
                      <FiTag className="app-input__icon" />
                      <input 
                        className="form-control app-input" 
                        placeholder="e.g. FESTIVE20" 
                        value={form.code} 
                        onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Reduction Type</label>
                    <select 
                      className="form-select app-input" 
                      value={form.discountType} 
                      onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                    >
                      <option value="flat">Flat ₹ Reduction</option>
                      <option value="percentage">Percentage % Off</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-semibold">Incentive Value</label>
                    <input 
                      className="form-control app-input" 
                      type="number" 
                      min="0" 
                      value={form.discountValue} 
                      onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Expiry Date</label>
                    <input 
                      className="form-control app-input" 
                      type="date" 
                      value={form.expiryDate} 
                      onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Maximum Lifecycle Uses</label>
                    <input 
                      className="form-control app-input" 
                      type="number" 
                      min="1" 
                      value={form.maxUses} 
                      onChange={e => setForm(f => ({ ...f, maxUses: Number(e.target.value) }))} 
                      required 
                    />
                  </div>
                  <div className="col-md-9">
                    <label className="form-label fw-semibold">Targeted Batches (Empty = Global Application)</label>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {batches.map(b => (
                        <button 
                          type="button" 
                          key={b._id} 
                          className={form.applicableBatches.includes(b._id) ? "app-btn-primary" : "app-btn-soft"}
                          onClick={() => handleBatchToggle(b._id)}
                        >
                          {b.batchName}
                        </button>
                      ))}
                      {batches.length === 0 && <span className="text-muted small">No target segments available</span>}
                    </div>
                  </div>
                  <div className="col-12 pt-2">
                    <button type="submit" className="app-btn-primary">Deploy Coupon Strategy</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Strategy Inventory</h4>
            </div>

            <div className="d-none d-md-block table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr style={{ color: "#475569" }}>
                    <th>Coupon Identifier</th>
                    <th>Type & Impact</th>
                    <th>Lifecycle Status</th>
                    <th>Redemption Capacity</th>
                    <th>Operational Control</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                     <tr><td colSpan="5" className="p-0 border-0"><SkeletonTable rows={5} cols={5} /></td></tr>
                  ) : coupons.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No tactical coupons deployed yet.</td></tr>
                  ) : (
                    coupons.map(c => {
                      const expired = new Date() > new Date(c.expiryDate);
                      const exhausted = c.usedCount >= c.maxUses;
                      const active = c.isActive && !expired && !exhausted;
                      return (
                        <tr key={c._id} className="border-light">
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="p-2 bg-primary-subtle" style={{ borderRadius: '8px' }}>
                                <FiTag className="text-primary" />
                              </div>
                              <div>
                                <strong className="text-dark">{c.code}</strong>
                                <div className="small text-muted">{c.applicableBatches?.length === 0 ? "Global Reach" : `${c.applicableBatches.length} Segments`}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="app-badge" style={{ background: c.discountType === 'flat' ? '#dbeafe' : '#fef3c7', color: c.discountType === 'flat' ? '#1d4ed8' : '#92400e' }}>
                              {c.discountType === 'flat' ? 'Flat' : 'Margin'}
                            </span>
                            <div className="fw-bold mt-1">{c.discountType === "flat" ? `₹${c.discountValue}` : `${c.discountValue}%`}</div>
                          </td>
                          <td>
                            <span className="app-badge" style={{ background: active ? '#dcfce7' : '#fee2e2', color: active ? '#16a34a' : '#dc2626' }}>
                              {active ? "Active" : exhausted ? "Exhausted" : "Inactive"}
                            </span>
                            <div className="small text-muted mt-1">{new Date(c.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</div>
                          </td>
                          <td>
                            <div className="progress rounded-pill" style={{ height: 8, width: 120 }}>
                              <div 
                                className="progress-bar rounded-pill" 
                                style={{ 
                                  width: `${(c.usedCount / c.maxUses) * 100}%`, 
                                  background: active ? '#22c55e' : '#94a3b8' 
                                }}
                              ></div>
                            </div>
                            <div className="small fw-bold mt-1">{c.usedCount} / {c.maxUses} used</div>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                               <button 
                                 className={c.isActive ? "app-btn-soft" : "app-btn-soft"} 
                                 onClick={() => toggleActive(c._id, c.isActive)}
                               >
                                 {c.isActive ? "Deactivate" : "Activate"}
                               </button>
                               <button className="app-btn-delete" onClick={() => deleteCoupon(c._id)}>
                                 <FiTrash2 />
                               </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-block d-md-none">
              {loading ? (
                <div className="text-center py-4">Loading coupons...</div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-4 text-muted">No coupons found.</div>
              ) : (
                <div className="row g-3">
                  {coupons.map((c, index) => (
                    <div className="col-12" key={c._id}>
                      <div className="app-mobile-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong>#{index + 1}</strong>
                          <span className="app-badge">{c.code}</span>
                        </div>
                        <div className="text-muted small mb-2">Type: {c.discountType === 'flat' ? `₹${c.discountValue}` : `${c.discountValue}%`}</div>
                        <div className="text-muted small">Status: {c.isActive ? "Active" : "Inactive"}</div>
                        <div className="text-muted small mb-3">Used: {c.usedCount} / {c.maxUses}</div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="app-btn-soft flex-grow-1"
                            onClick={() => toggleActive(c._id, c.isActive)}
                          >
                            {c.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="app-btn-delete flex-grow-1"
                            onClick={() => deleteCoupon(c._id)}
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
      </div>
    </div>
  );
};

export default AdminCoupons;
