import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { FiSearch, FiEdit3, FiTrash2, FiPlus, FiUser, FiMail, FiPhone, FiMapPin, FiBookOpen, FiAward, FiX, FiCheckCircle } from "react-icons/fi";
import { SkeletonTable } from "../../components/ui/SkeletonLoader";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";

const initialForm = {
  name: "",
  email: "",
  number: "",
  address: "",
  college: "",
  qualification: "",
};

const initialAccessForm = {
  batchId: "",
  replaceBatchId: "",
  grantType: "free",
  accessStatus: "active",
};

const Examinee = () => {
  const [examinees, setExaminees] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedExaminee, setSelectedExaminee] = useState(null);
  const [batches, setBatches] = useState([]);
  const [accessForm, setAccessForm] = useState(initialAccessForm);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const isEditing = Boolean(editingId);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchExaminees = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/examinee`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExaminees(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load examinees", "error");
    } finally {
      setFetching(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/batch`);
      setBatches(res?.data?.data || []);
    } catch (error) {
      showToast("Failed to load batches", "error");
    }
  };

  useEffect(() => {
    fetchExaminees();
    fetchBatches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name || "",
      email: item.email || "",
      number: item.number || "",
      address: item.address || "",
      college: item.college || "",
      qualification: item.qualification || "",
    });
    setEditingId(item._id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const openAccessModal = (item) => {
    setSelectedExaminee(item);
    setAccessForm(initialAccessForm);
    setAccessModalOpen(true);
  };

  const closeAccessModal = () => {
    setSelectedExaminee(null);
    setAccessForm(initialAccessForm);
    setAccessModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    if (!form.name || !form.email || !form.number) {
      showToast("Name, email and number are required", "error");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("adminToken");
      await axios.put(`${import.meta.env.VITE_API_URL}/api/examinee/${editingId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Examinee updated successfully");
      closeModal();
      fetchExaminees();
    } catch (error) {
      showToast("Error updating examinee", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this examinee?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/examinee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Examinee deleted successfully");
      fetchExaminees();
    } catch (error) {
      showToast("Delete failed", "error");
    }
  };

  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExaminee?._id || !accessForm.batchId) {
      showToast("Select batch first", "error");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/examinee/${selectedExaminee._id}/batch-access`,
        accessForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(accessForm.grantType === "free" ? "Free batch assigned" : "Batch access updated");
      closeAccessModal();
      fetchExaminees();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update batch access", "error");
    }
  };

  const handleRemoveAccess = async (batchId) => {
    if (!selectedExaminee?._id) return;
    if (!window.confirm("Remove this batch access from student?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/examinee/${selectedExaminee._id}/batch-access/${batchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Batch access removed");
      const updated = await axios.get(`${import.meta.env.VITE_API_URL}/api/examinee`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = updated?.data?.data || [];
      setExaminees(list);
      setSelectedExaminee(list.find((item) => item._id === selectedExaminee._id) || null);
    } catch (error) {
      showToast("Failed to remove batch access", "error");
    }
  };

  const filteredExaminees = useMemo(() => {
    const keyword = search.toLowerCase();
    return examinees.filter((item) => {
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.number?.toLowerCase().includes(keyword) ||
        item.address?.toLowerCase().includes(keyword) ||
        item.college?.toLowerCase().includes(keyword) ||
        item.qualification?.toLowerCase().includes(keyword) ||
        item.purchasedBatches?.some((entry) => entry.batch?.batchName?.toLowerCase().includes(keyword))
      );
    });
  }, [examinees, search]);

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="container">
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">Examinee Management</h2>
              <p className="mb-0" style={{ opacity: 0.88 }}>
                View, manage, and assign batch access to student records in a cinematic professional interface.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 16, padding: "12px 20px", display: "inline-block", backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Total Students</div>
                <div className="fw-bold" style={{ fontSize: 24 }}>{examinees.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">Student Pool</div><h4 className="fw-bold mb-0">{examinees.length}</h4></div></div>
          <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">Active Filter</div><h4 className="fw-bold mb-0">{search ? filteredExaminees.length : "All Records"}</h4></div></div>
          <div className="col-md-4"><div className="app-stat-card"><div className="app-label-muted">Interface</div><h4 className="fw-bold mb-0">Management</h4></div></div>
        </div>

        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h4 className="fw-bold mb-1">Student Records</h4>
                <p className="text-muted small">Comprehensive list of registered examinees and their status.</p>
              </div>
              <div className="app-search" style={{ minWidth: 280 }}>
                <FiSearch className="app-search__icon" />
                <input type="text" className="form-control app-input" placeholder="Search by name, email, or batch..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="table-responsive d-none d-md-block">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>STUDENT INFO</th>
                    <th>CONTACT</th>
                    <th>COLLEGE/QUAL</th>
                    <th>BATCH ACCESS</th>
                    <th className="text-end">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {fetching ? (
                    <tr><td colSpan="6" className="p-0 border-0"><SkeletonTable rows={8} cols={6} /></td></tr>
                  ) : filteredExaminees.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-5 text-muted">No students found matching your search.</td></tr>
                  ) : (
                    filteredExaminees.map((item, index) => (
                      <tr key={item._id}>
                        <td className="text-muted small fw-bold">{index + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{item.name}</div>
                          <div className="small text-muted">{item.email}</div>
                        </td>
                        <td>
                          <div className="small fw-semibold">{item.number}</div>
                          <div className="smaller text-muted">{item.address || "-"}</div>
                        </td>
                        <td>
                          <div className="app-badge mb-1">{item.college || "No College"}</div>
                          <div className="smaller text-muted">{item.qualification || "-"}</div>
                        </td>
                        <td>
                          <span className="badge rounded-pill" style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 12px' }}>
                            {item.purchasedBatches?.length || 0} Batches
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                             <button className="app-btn-edit" title="Edit Profile" onClick={() => handleEdit(item)}><FiEdit3 /></button>
                             <button className="app-btn-primary" style={{ padding: '8px 12px', fontSize: '13px' }} onClick={() => openAccessModal(item)}>Access</button>
                             <button className="app-btn-delete" title="Delete Student" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="d-block d-md-none">
              {fetching ? (
                 <div className="text-center py-5 text-muted">Loading student data...</div>
              ) : filteredExaminees.length === 0 ? (
                 <div className="text-center py-5 text-muted">No students found.</div>
              ) : (
                <div className="row g-3">
                  {filteredExaminees.map((item, index) => (
                    <div className="col-12" key={item._id}>
                      <div className="app-mobile-card p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <strong className="text-muted">#{index+1}</strong>
                          <div className="app-badge">{item.college || "N/A"}</div>
                        </div>
                        <h5 className="fw-bold mb-1">{item.name}</h5>
                        <p className="small text-muted mb-3">{item.email} | {item.number}</p>
                        <div className="mb-4">
                          <div className="small fw-bold text-uppercase opacity-50 mb-1">Assigned Batches</div>
                          <span className="badge bg-light text-dark border">{item.purchasedBatches?.length || 0} Batches Active</span>
                        </div>
                        <div className="d-flex gap-2">
                           <button className="app-btn-edit flex-grow-1" onClick={() => handleEdit(item)}><FiEdit3 className="me-2"/>Edit</button>
                           <button className="app-btn-primary flex-grow-1" onClick={() => openAccessModal(item)}>Access</button>
                        </div>
                        <button className="app-btn-delete w-100 mt-2" onClick={() => handleDelete(item._id)}><FiTrash2 className="me-2"/>Delete Student</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: 'blur(10px)', display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998, padding: 16 }}>
          <div className="app-panel" style={{ width: "100%", maxWidth: 1000, padding: 0, overflow: "hidden" }}>
             <div className="p-4" style={{ background: 'linear-gradient(135deg, #0d0626, #1c0750)', color: '#fff' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold mb-1">Edit Student Profile</h4>
                    <p className="mb-0 small opacity-75">Modify information for: {form.name}</p>
                  </div>
                  <button onClick={closeModal} className="btn text-white p-0"><FiX size={24}/></button>
                </div>
             </div>
             <form onSubmit={handleSubmit} className="p-4">
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Students Full Name</label>
                    <div className="app-input-wrap"><FiUser className="app-input__icon"/><input type="text" name="name" value={form.name} onChange={handleChange} className="app-input" placeholder="Full Name" /></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Email Address</label>
                    <div className="app-input-wrap"><FiMail className="app-input__icon"/><input type="email" name="email" value={form.email} onChange={handleChange} className="app-input" placeholder="Email" /></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Phone Number</label>
                    <div className="app-input-wrap"><FiPhone className="app-input__icon"/><input type="text" name="number" value={form.number} onChange={handleChange} className="app-input" placeholder="Number" /></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">College Name</label>
                    <div className="app-input-wrap"><FiBookOpen className="app-input__icon"/><input type="text" name="college" value={form.college} onChange={handleChange} className="app-input" placeholder="College Name" /></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Qualification</label>
                    <div className="app-input-wrap"><FiAward className="app-input__icon"/><input type="text" name="qualification" value={form.qualification} onChange={handleChange} className="app-input" placeholder="Qualification" /></div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Address</label>
                    <div className="app-input-wrap"><FiMapPin className="app-input__icon"/><input type="text" name="address" value={form.address} onChange={handleChange} className="app-input" placeholder="Address" /></div>
                  </div>
                </div>
                <div className="d-flex gap-3 pt-3 border-top">
                   <button type="submit" className="app-btn-primary px-5" disabled={saving}>{saving ? "Updating..." : "Update Student"}</button>
                   <button type="button" onClick={closeModal} className="app-btn-soft px-4">Close Info</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Access Modal */}
      {accessModalOpen && selectedExaminee && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: 'blur(12px)', display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998, padding: 16 }}>
           <div className="app-panel" style={{ width: "100%", maxWidth: 1000, maxHeight: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="p-4" style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', flexShrink: 0 }}>
                 <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="fw-bold mb-1">Batch Access Control</h4>
                      <p className="mb-0 small opacity-75">Student: {selectedExaminee.name}</p>
                    </div>
                    <button onClick={closeAccessModal} className="btn text-white p-0"><FiX size={24}/></button>
                 </div>
              </div>
              <div className="p-4 overflow-auto" style={{ flexGrow: 1 }}>
                 <div className="mb-5">
                    <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary"><FiCheckCircle/> Active Access Control</h5>
                    {selectedExaminee.purchasedBatches?.length ? (
                      <div className="row g-4">
                        {selectedExaminee.purchasedBatches.map((entry, index) => (
                           <div className="col-lg-6" key={index}>
                              <div className="p-4 rounded-4 border bg-light h-100">
                                 <div className="fw-bold text-dark h6 mb-1">{entry.batch?.batchName || "Batch"}</div>
                                 <div className="small text-muted fw-semibold mb-3">{entry.course?.title || "No Course Linked"}</div>
                                 <div className="row g-2 mb-4">
                                    <div className="col-6"><div className="small opacity-50">Type</div><div className="fw-bold smaller">{entry.accessType || "paid"}</div></div>
                                    <div className="col-6"><div className="small opacity-50">Status</div><div className="fw-bold smaller text-success">{entry.accessStatus || "active"}</div></div>
                                 </div>
                                 <button onClick={() => handleRemoveAccess(entry.batch?._id || entry.batch)} className="btn btn-sm w-100 fw-bold" style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '10px' }}>Revoke Access</button>
                              </div>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5 border rounded-4 bg-light text-muted">No batches assigned to this student.</div>
                    )}
                 </div>

                 <form onSubmit={handleAccessSubmit} className="p-4 border rounded-4 shadow-sm bg-white">
                    <h5 className="fw-bold mb-4">Enroll in New Batch</h5>
                    <div className="row g-4 mb-4">
                       <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Target Batch</label>
                          <select className="form-select app-input" value={accessForm.batchId} onChange={(e) => setAccessForm({...accessForm, batchId: e.target.value})} style={{ paddingLeft: 12 }}>
                             <option value="">Choose a batch...</option>
                             {batches.map(b => <option key={b._id} value={b._id}>{b.batchName} ({b.course?.title})</option>)}
                          </select>
                       </div>
                       <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Replace Existing</label>
                          <select className="form-select app-input" value={accessForm.replaceBatchId} onChange={(e) => setAccessForm({...accessForm, replaceBatchId: e.target.value})} style={{ paddingLeft: 12 }}>
                             <option value="">Add logic (No replace)</option>
                             {selectedExaminee.purchasedBatches?.map((entry, idx) => <option key={idx} value={entry.batch?._id}>{entry.batch?.batchName}</option>)}
                          </select>
                       </div>
                       <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Enrollment Grant</label>
                          <select className="form-select app-input" value={accessForm.grantType} onChange={(e) => setAccessForm({...accessForm, grantType: e.target.value})} style={{ paddingLeft: 12 }}>
                             <option value="free">Grant Free Access</option>
                             <option value="paid">Force Paid Status</option>
                          </select>
                       </div>
                       <div className="col-md-6">
                          <label className="form-label fw-bold small text-muted text-uppercase">Initial Status</label>
                          <select className="form-select app-input" value={accessForm.accessStatus} onChange={(e) => setAccessForm({...accessForm, accessStatus: e.target.value})} style={{ paddingLeft: 12 }}>
                             <option value="active">Active Access</option>
                             <option value="inactive">Locked Access</option>
                          </select>
                       </div>
                    </div>
                    <div className="d-flex gap-3">
                       <button type="submit" className="app-btn-primary px-5">Assign Batch Access</button>
                       <button type="button" onClick={closeAccessModal} className="app-btn-soft px-4">Cancel</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Examinee;
