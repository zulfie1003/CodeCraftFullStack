import React, { useState } from "react";
import "../../styles/hackathons.css";
import StudentLayout from "../../layouts/StudentLayout";

const user = {
  name: "Anas",
  role: "student", // Change to "organizer" to see create hackathon option
};

const Hackathons = () => {
  // ========== HACKATHONS LIST ==========
  const [hackathons, setHackathons] = useState([]);

  // ========== STUDENT REGISTRATION FORM ==========
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [selectedHackathonId, setSelectedHackathonId] = useState(null);
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profilePic: "",
    skills: "",
    teamSize: "1",
    bio: ""
  });
  const [profilePicPreview, setProfilePicPreview] = useState("");

  const handleStudentInputChange = (e) => {
    const { name, value } = e.target;
    setStudentFormData({ ...studentFormData, [name]: value });
  };

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        setStudentFormData({ ...studentFormData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    const hackathonName = hackathons.find(h => h.id === selectedHackathonId)?.title;
    console.log("Student Registration for:", hackathonName, studentFormData);
    alert(`✅ Successfully registered for ${hackathonName}! Check console for details.`);
    setStudentFormData({
      name: "",
      email: "",
      phone: "",
      profilePic: "",
      skills: "",
      teamSize: "1",
      bio: ""
    });
    setProfilePicPreview("");
    setShowStudentForm(false);
    setSelectedHackathonId(null);
  };

  // ========== ORGANIZER CREATE HACKATHON FORM ==========
  const [showOrganizerForm, setShowOrganizerForm] = useState(false);
  const [organizerFormData, setOrganizerFormData] = useState({
    title: "",
    date: "",
    prize: "",
    tags: "",
    description: "",
    image: ""
  });
  const [hackathonImagePreview, setHackathonImagePreview] = useState("");

  const handleOrganizerInputChange = (e) => {
    const { name, value } = e.target;
    setOrganizerFormData({ ...organizerFormData, [name]: value });
  };

  const handleHackathonImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHackathonImagePreview(reader.result);
        setOrganizerFormData({ ...organizerFormData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrganizerSubmit = (e) => {
    e.preventDefault();
    const newHackathon = {
      id: Date.now(),
      title: organizerFormData.title,
      date: organizerFormData.date,
      prize: organizerFormData.prize,
      tags: organizerFormData.tags,
      description: organizerFormData.description,
      image: hackathonImagePreview
    };
    setHackathons([...hackathons, newHackathon]);
    console.log("Hackathon Created:", newHackathon);
    alert("✅ Hackathon posted successfully! Check console for details.");
    setOrganizerFormData({
      title: "",
      date: "",
      prize: "",
      tags: "",
      description: "",
      image: ""
    });
    setHackathonImagePreview("");
    setShowOrganizerForm(false);
  };

  return (
    <StudentLayout>
      <div className="hackathon-page">
        {user.role === "student" ? (
          // ========== STUDENT VIEW ==========
          <>
            <div className="hackathon-header">
              <div>
                <h1 className="page-title">Hackathons</h1>
                <p className="page-subtitle">Join amazing hackathons and build great projects</p>
              </div>
            </div>

            {hackathons.length === 0 ? (
              /* Empty State - No Hackathons */
              <div style={{
                textAlign: "center",
                padding: "100px 40px",
                background: "rgba(56, 189, 248, 0.05)",
                borderRadius: "20px",
                border: "2px dashed rgba(56, 189, 248, 0.3)",
                marginTop: "40px",
                marginBottom: "40px"
              }}>
                <h2 style={{ fontSize: "32px", color: "#38bdf8", marginBottom: "16px" }}>🚀 Hackathon Coming Soon</h2>
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>Amazing opportunities are being prepared. Stay tuned!</p>
              </div>
            ) : (
              /* Hackathons Display */
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px",
                  marginTop: "40px",
                  marginBottom: "40px"
                }}>
                  {hackathons.map((hackathon) => (
                    <div key={hackathon.id} className="hackathon-card" style={{
                      background: "linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(99, 102, 241, 0.1))",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      borderRadius: "16px",
                      padding: "24px",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer"
                    }}>
                      {hackathon.image && (
                        <img 
                          src={hackathon.image} 
                          alt={hackathon.title} 
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            marginBottom: "16px"
                          }}
                        />
                      )}
                      <h3 style={{ color: "#38bdf8", marginBottom: "12px", fontSize: "20px", fontWeight: "700" }}>
                        {hackathon.title}
                      </h3>
                      <p style={{ color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>
                        📅 {hackathon.date}
                      </p>
                      <p style={{ color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>
                        💰 Prize: {hackathon.prize}
                      </p>
                      {hackathon.tags && (
                        <p style={{ color: "#94a3b8", marginBottom: "16px", fontSize: "14px" }}>
                          🏷️ {hackathon.tags}
                        </p>
                      )}
                      {hackathon.description && (
                        <p style={{ color: "#cbd5e1", marginBottom: "16px", fontSize: "13px", lineHeight: "1.5" }}>
                          {hackathon.description}
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setSelectedHackathonId(hackathon.id);
                          setShowStudentForm(true);
                        }}
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                          border: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          color: "white",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 8px 16px rgba(99, 102, 241, 0.3)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        📝 Register
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Student Registration Form Modal */}
            {showStudentForm && (
              <div className="modal-overlay" onClick={() => setShowStudentForm(false)}>
                <div className="registration-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Register for Hackathon</h2>
                    <button className="close-btn" onClick={() => setShowStudentForm(false)}>✕</button>
                  </div>

                  <form className="registration-form" onSubmit={handleStudentSubmit}>
                    {/* Profile Section */}
                    <div className="form-section">
                      <h3>Your Profile</h3>

                      <div className="profile-pic-section">
                        {profilePicPreview ? (
                          <img src={profilePicPreview} alt="Profile" className="profile-preview" />
                        ) : (
                          <div style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            background: "rgba(56, 189, 248, 0.1)",
                            border: "2px dashed rgba(56, 189, 248, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94a3b8",
                            fontSize: "40px"
                          }}>
                            📷
                          </div>
                        )}
                        <label className="file-input-label">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicUpload}
                            className="file-input"
                          />
                          📷 Upload Profile Picture
                        </label>
                      </div>

                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name *"
                        value={studentFormData.name}
                        onChange={handleStudentInputChange}
                        required
                      />

                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address *"
                        value={studentFormData.email}
                        onChange={handleStudentInputChange}
                        required
                      />

                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number *"
                        value={studentFormData.phone}
                        onChange={handleStudentInputChange}
                        required
                      />
                    </div>

                    {/* Team Section */}
                    <div className="form-section">
                      <h3>Team Information</h3>

                      <select
                        name="teamSize"
                        value={studentFormData.teamSize}
                        onChange={handleStudentInputChange}
                      >
                        <option value="1">Solo</option>
                        <option value="2">2 Members</option>
                        <option value="3">3 Members</option>
                        <option value="4">4+ Members</option>
                      </select>

                      <input
                        type="text"
                        name="skills"
                        placeholder="Your Skills (e.g., React, Node.js, ML) *"
                        value={studentFormData.skills}
                        onChange={handleStudentInputChange}
                        required
                      />

                      <textarea
                        name="bio"
                        placeholder="Tell us about your experience..."
                        value={studentFormData.bio}
                        onChange={handleStudentInputChange}
                        rows="4"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Submit Registration</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowStudentForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          // ========== ORGANIZER VIEW ==========
          <>
            <div className="hackathon-header">
              <div>
                <h1 className="page-title">Create Hackathon</h1>
                <p className="page-subtitle">Post your hackathon and attract talented students</p>
              </div>
            </div>

            {/* Organizer Create Form Toggle */}
            {!showOrganizerForm && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px", marginTop: "60px" }}>
                <button
                  onClick={() => setShowOrganizerForm(true)}
                  style={{
                    background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                    border: "none",
                    padding: "16px 40px",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 12px 30px rgba(99, 102, 241, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 8px 20px rgba(99, 102, 241, 0.3)";
                  }}
                >
                  ➕ Create New Hackathon
                </button>
              </div>
            )}

            {/* Organizer Create Form */}
            {showOrganizerForm && (
              <div style={{ marginTop: "40px", marginBottom: "40px" }}>
                <form className="create-form" onSubmit={handleOrganizerSubmit}>
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ color: "#38bdf8", fontSize: "20px", fontWeight: "700" }}>📝 Hackathon Details</h3>
                  </div>

                  <input
                    type="text"
                    name="title"
                    placeholder="Hackathon Title *"
                    value={organizerFormData.title}
                    onChange={handleOrganizerInputChange}
                    required
                  />

                  <input
                    type="text"
                    name="date"
                    placeholder="Event Date (e.g., Feb 15–17, 2026) *"
                    value={organizerFormData.date}
                    onChange={handleOrganizerInputChange}
                    required
                  />

                  <input
                    type="text"
                    name="prize"
                    placeholder="Prize Pool (e.g., $50,000) *"
                    value={organizerFormData.prize}
                    onChange={handleOrganizerInputChange}
                    required
                  />

                  <input
                    type="text"
                    name="tags"
                    placeholder="Categories (e.g., AI, ML, Web)"
                    value={organizerFormData.tags}
                    onChange={handleOrganizerInputChange}
                  />

                  <textarea
                    name="description"
                    placeholder="Hackathon Description"
                    value={organizerFormData.description}
                    onChange={handleOrganizerInputChange}
                    rows="4"
                  />

                  <label className="file-input-label" style={{ margin: "20px 0" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHackathonImageUpload}
                      className="file-input"
                    />
                    🖼️ Upload Hackathon Image
                  </label>

                  {hackathonImagePreview && (
                    <img 
                      src={hackathonImagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: "100%", 
                        maxHeight: "200px", 
                        objectFit: "cover", 
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }} 
                    />
                  )}

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button type="submit" className="submit-btn" style={{ flex: 1 }}>Post Hackathon</button>
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={() => {
                        setShowOrganizerForm(false);
                        setHackathonImagePreview("");
                        setOrganizerFormData({
                          title: "",
                          date: "",
                          prize: "",
                          tags: "",
                          description: "",
                          image: ""
                        });
                      }}
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Display Created Hackathons */}
            {hackathons.length > 0 && (
              <div style={{
                marginTop: "60px",
                paddingTop: "40px",
                borderTop: "2px solid rgba(56, 189, 248, 0.2)"
              }}>
                <h2 style={{ color: "#38bdf8", marginBottom: "24px", fontSize: "24px", fontWeight: "700" }}>
                  📋 Your Hackathons ({hackathons.length})
                </h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "24px"
                }}>
                  {hackathons.map((hackathon) => (
                    <div key={hackathon.id} style={{
                      background: "linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(99, 102, 241, 0.1))",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      borderRadius: "16px",
                      padding: "24px",
                      backdropFilter: "blur(10px)"
                    }}>
                      {hackathon.image && (
                        <img 
                          src={hackathon.image} 
                          alt={hackathon.title} 
                          style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            marginBottom: "16px"
                          }}
                        />
                      )}
                      <h3 style={{ color: "#38bdf8", marginBottom: "12px", fontSize: "20px", fontWeight: "700" }}>
                        {hackathon.title}
                      </h3>
                      <p style={{ color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>
                        📅 {hackathon.date}
                      </p>
                      <p style={{ color: "#94a3b8", marginBottom: "8px", fontSize: "14px" }}>
                        💰 Prize: {hackathon.prize}
                      </p>
                      {hackathon.tags && (
                        <p style={{ color: "#94a3b8", marginBottom: "16px", fontSize: "14px" }}>
                          🏷️ {hackathon.tags}
                        </p>
                      )}
                      {hackathon.description && (
                        <p style={{ color: "#cbd5e1", marginBottom: "16px", fontSize: "13px", lineHeight: "1.5" }}>
                          {hackathon.description}
                        </p>
                      )}
                      <button
                        onClick={() => alert("Edit feature coming soon!")}
                        style={{
                          width: "100%",
                          background: "linear-gradient(135deg, #38bdf8, #6366f1)",
                          border: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          color: "white",
                          fontWeight: "700",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 8px 16px rgba(99, 102, 241, 0.3)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default Hackathons;
