import React, { useState, useEffect } from "react";
import axios from "axios";
import AppToast from "../../components/ui/AppToast";
import "../../components/ui/app-ui.css";
import { FiEdit3, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiBookOpen, FiAward, FiCamera } from "react-icons/fi";

const Profile = () => {
  const [personalEdit, setPersonalEdit] = useState(false);
  const [addressEdit, setAddressEdit] = useState(false);
  const [profilePic, setProfilePic] = useState("https://avatar.iran.liara.run/public/boy");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const examineeId = localStorage.getItem("userId");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    address: "",
    college: "",
    qualification: "",
    status: "active",
  });

  const labels = {
    name: "Full Name",
    email: "Email Address",
    number: "Phone Number",
    address: "Residential Address",
    college: "College / University",
    qualification: "Academic Qualification",
  };

  const getIcon = (field) => {
    switch(field) {
      case 'name': return <FiUser />;
      case 'email': return <FiMail />;
      case 'number': return <FiPhone />;
      case 'college': return <FiBookOpen />;
      case 'qualification': return <FiAward />;
      default: return <FiUser />;
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  useEffect(() => {
    const fetchExaminee = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/examinee/${examineeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setFormData(res.data.data);
          if (res.data.profileImage) {
            setProfilePic(`${import.meta.env.VITE_API_URL}/uploads/${res.data.profileImage}`);
          }
        }
      } catch (err) {
        console.error("Failed to fetch examinee:", err);
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    if (examineeId) fetchExaminee();
  }, [examineeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (selectedFile) data.append("profileImage", selectedFile);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/examinee/${examineeId}`, data, { 
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } 
      });
      if (res.data.success) {
        showToast("Profile updated successfully", "success");
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  if (loading) {
    return <div className="app-page"><div className="container py-5"><div className="text-center">Loading...</div></div></div>;
  }

  return (
    <div className="app-page">
      <AppToast toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />
      
      <div className="container">
        {/* Hero Section */}
        <div className="app-hero mb-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-bold mb-2">My Profile</h2>
              <p className="mb-0">Manage your personal information and account settings</p>
            </div>
          </div>
        </div>

        {/* Profile Avatar Section */}
        <div className="app-panel mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center flex-wrap gap-4">
              <div style={{ position: "relative", width: "120px", height: "120px" }}>
                <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", boxShadow: "0 8px 24px rgba(37,99,235,0.2)" }} />
                <label style={{ position: "absolute", bottom: 0, right: 0, background: "#2563eb", color: "#fff", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "3px solid #fff", transition: "0.2s" }}>
                  <FiCamera size={18} />
                  <input type="file" hidden onChange={handlePicUpload} accept="image/*" />
                </label>
              </div>
              <div>
                <h4 className="fw-bold mb-1">{formData.name || "Student Profile"}</h4>
                <p className="text-muted mb-2">{formData.email}</p>
                <span className="app-badge">Active Learner</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="app-panel mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Personal Information</h5>
              <button className={personalEdit ? "app-btn-primary" : "app-btn-soft"} onClick={() => { if (personalEdit) handleSave(); setPersonalEdit(!personalEdit); }}>
                {personalEdit ? <><FiSave className="me-2" /> Save Details</> : <><FiEdit3 className="me-2" /> Edit Details</>}
              </button>
            </div>
            <div className="row">
              {["name", "email", "number", "college", "qualification"].map((field) => (
                <div className="col-md-6 mb-3" key={field}>
                  <label className="form-label fw-semibold small">{labels[field]}</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>{getIcon(field)}</span>
                    <input 
                      type="text" 
                      className="app-input" 
                      value={formData[field]} 
                      onChange={handleChange} 
                      name={field}
                      disabled={!personalEdit} 
                      placeholder={`Enter ${labels[field]}`}
                      style={{ paddingLeft: "40px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Address Details Section */}
        <div className="app-panel">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">Address Details</h5>
              <button className={addressEdit ? "app-btn-primary" : "app-btn-soft"} onClick={() => { if (addressEdit) handleSave(); setAddressEdit(!addressEdit); }}>
                {addressEdit ? <><FiSave className="me-2" /> Save Address</> : <><FiEdit3 className="me-2" /> Edit Address</>}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "12px", color: "#94a3b8" }}><FiMapPin /></span>
              <textarea 
                className="app-textarea"
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                disabled={!addressEdit} 
                placeholder="Enter your full residential address"
                style={{ paddingLeft: "40px" }}
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
