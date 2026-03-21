import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [personalEdit, setPersonalEdit] = useState(false);
  const [addressEdit, setAddressEdit] = useState(false);
  const [profilePic, setProfilePic] = useState("https://avatar.iran.liara.run/public/boy");
  const [selectedFile, setSelectedFile] = useState(null);

  const examineeId = localStorage.getItem("userId"); // from login
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
    name: "Name",
    email: "Email",
    number: "Phone",
    address: "Address",
    college: "College",
    qualification: "Qualification",
  };

  // Fetch examinee details when component loads
  useEffect(() => {
    const fetchExaminee = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/examinee/${examineeId}`);
        console.log(res.data.data);
        
        if (res.data) {
          setFormData(res.data.data);
          if (res.data.profileImage) {
            setProfilePic(`http://localhost:5000/uploads/${res.data.profileImage}`);
          }
        }
      } catch (err) {
        console.error("Failed to fetch examinee:", err);
      }
    };
    if (examineeId) fetchExaminee();
  }, [examineeId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile picture upload
  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  // Save/Update data
  const handleSave = async () => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (selectedFile) {
      data.append("profileImage", selectedFile);
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/examinee/${examineeId}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.success) {
        alert("Profile updated successfully ✅");
      }
    } catch (err) {
      console.error(err);
      alert("Update failed ❌");
    }
  };

  return (
    <div className="container my-4">
      {/* Profile Section */}
      <div className="card shadow-sm mb-4 profile-card">
        <div className="card-body d-flex align-items-center">
          <img
            src={profilePic}
            alt={`${formData.name}'s profile`}
            className="profile-img"
          />
          <div className="ms-3">
            <h5 className="mb-0">{formData.name}</h5>
            <p className="text-muted mb-0">{formData.email}</p>
            <label className="btn btn-sm btn-outline-primary mt-2">
              Upload Photo{" "}
              <input type="file" hidden onChange={handlePicUpload} accept="image/*" />
            </label>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="card shadow-sm mb-4 profile-section">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Personal Information</h6>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => {
                if (personalEdit) handleSave();
                setPersonalEdit(!personalEdit);
              }}
            >
              {personalEdit ? "Save ✅" : "Edit ✏️"}
            </button>
          </div>

          <div className="row">
            {["name", "email", "number", "college", "qualification"].map((field, i) => (
              <div className="col-md-6 mb-3" key={i}>
                <label htmlFor={field}>
                  <strong>{labels[field]}</strong>
                </label>
                <input
                  id={field}
                  type="text"
                  name={field}
                  className="form-control"
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={!personalEdit}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Address Info */}
      <div className="card shadow-sm profile-section">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Address</h6>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => {
                if (addressEdit) handleSave();
                setAddressEdit(!addressEdit);
              }}
            >
              {addressEdit ? "Save ✅" : "Edit ✏️"}
            </button>
          </div>

          <div className="row">
            <div className="col-md-12 mb-3">
              <label htmlFor="address"><strong>Address</strong></label>
              <input
                id="address"
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                disabled={!addressEdit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
