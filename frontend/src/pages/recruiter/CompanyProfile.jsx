import { useState, useEffect, useRef } from "react";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import "../../styles/profile.css";
import { Edit2, Check, X, Trash2, Plus, Upload, ZoomIn, ZoomOut } from "lucide-react";

const CompanyProfile = () => {
  const [edit, setEdit] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("recruiterProfile");
    return saved ? JSON.parse(saved) : {
      companyName: "",
      industry: "",
      location: "",
      email: "",
      phone: "",
      website: "",
      bio: "",
      logo: null,
      jobs: [],
      team: [],
      stats: {
        jobsPosted: 0,
        candidatesHired: 0,
        totalApplications: 0,
      }
    };
  });

  const [form, setForm] = useState(profile);
  const [newJob, setNewJob] = useState({ title: "", position: "", salary: "", applicants: 0 });
  const [newMember, setNewMember] = useState({ name: "", designation: "", email: "" });

  useEffect(() => {
    localStorage.setItem("recruiterProfile", JSON.stringify(profile));
  }, [profile]);

  const saveProfile = () => {
    setProfile(form);
    setEdit(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setImageZoom(1);
        setImagePan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileImage = () => {
    if (!canvasRef.current || !imagePreview) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 150;
      canvas.height = 150;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const drawWidth = img.width * imageZoom;
      const drawHeight = img.height * imageZoom;
      const x = (canvas.width - drawWidth) / 2 + imagePan.x;
      const y = (canvas.height - drawHeight) / 2 + imagePan.y;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setForm({ ...form, logo: imageData });
      setImagePreview(null);
      setShowImageUpload(false);
    };

    img.src = imagePreview;
  };

  const deleteProfileImage = () => {
    setForm({ ...form, logo: null });
  };

  const canDeleteImage = profile.logo !== null;

  const addJob = () => {
    if (newJob.title.trim()) {
      setForm({
        ...form,
        jobs: [...form.jobs, { id: Date.now(), ...newJob }]
      });
      setNewJob({ title: "", position: "", salary: "", applicants: 0 });
    }
  };

  const removeJob = (id) => {
    setForm({
      ...form,
      jobs: form.jobs.filter(j => j.id !== id)
    });
  };

  const addTeamMember = () => {
    if (newMember.name.trim()) {
      setForm({
        ...form,
        team: [...form.team, { id: Date.now(), ...newMember }]
      });
      setNewMember({ name: "", designation: "", email: "" });
    }
  };

  const removeTeamMember = (id) => {
    setForm({
      ...form,
      team: form.team.filter(m => m.id !== id)
    });
  };

  const updateStats = (field, value) => {
    setForm({
      ...form,
      stats: { ...form.stats, [field]: parseInt(value) || 0 }
    });
  };

  return (
    <RecruiterLayout>
      <div className="sd-container">

        {/* HEADER */}
        <div className="sd-header">
          <div>
            <h1>Company Profile</h1>
            <p>Manage your company & job postings</p>
          </div>
          {!edit && (
            <button className="sd-btn" onClick={() => setEdit(true)}>
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {edit && (
          <div className="edit-actions-top">
            <button className="sd-btn" onClick={saveProfile}>
              <Check size={16} /> Save Changes
            </button>
            <button className="sd-btn ghost" onClick={() => { setEdit(false); setForm(profile); }}>
              <X size={16} /> Cancel
            </button>
          </div>
        )}

        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-left">
            <div className="company-logo">
              {form.logo ? (
                <img src={form.logo} alt="logo" />
              ) : (
                <div className="logo-placeholder">🏢</div>
              )}
            </div>

            {edit && (
              <div className="image-upload-section">
                <button onClick={() => setShowImageUpload(true)} className="upload-btn">
                  <Upload size={18} /> {form.logo ? "Change Logo" : "Upload Logo"}
                </button>
                {form.logo && (
                  <button onClick={deleteProfileImage} className="delete-btn">
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            )}

            {!edit ? (
              <>
                <h2>{form.companyName || "Company Name"}</h2>
                <p className="title">{form.industry || "Industry"}</p>
                <p className="bio">{form.bio || "Add company bio"}</p>
              </>
            ) : (
              <>
                <input 
                  placeholder="Company Name" 
                  value={form.companyName}
                  onChange={e => setForm({ ...form, companyName: e.target.value })}
                />
                <input 
                  placeholder="Industry" 
                  value={form.industry}
                  onChange={e => setForm({ ...form, industry: e.target.value })}
                />
                <textarea 
                  placeholder="Company Bio"
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                />
              </>
            )}
          </div>

          <div className="profile-right">
            {!edit ? (
              <>
                {form.email && <p><b>📧 Email:</b> {form.email}</p>}
                {form.phone && <p><b>📱 Phone:</b> {form.phone}</p>}
                {form.location && <p><b>📍 Location:</b> {form.location}</p>}
                {form.website && <p><b>🌐 Website:</b> <a href={form.website} target="_blank" rel="noreferrer">{form.website}</a></p>}
              </>
            ) : (
              <>
                <input 
                  placeholder="Email" 
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <input 
                  placeholder="Phone" 
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
                <input 
                  placeholder="Location" 
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
                <input 
                  placeholder="Website" 
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                />
              </>
            )}
          </div>
        </div>

        {/* STATS SECTION */}
        {!edit && (
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">{profile.stats.jobsPosted}</div>
              <div className="stat-label">Jobs Posted</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{profile.stats.candidatesHired}</div>
              <div className="stat-label">Candidates Hired</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{profile.stats.totalApplications}</div>
              <div className="stat-label">Total Applications</div>
            </div>
          </div>
        )}

        {edit && (
          <div className="stats-edit-section">
            <h3>📊 Update Your Stats</h3>
            <div className="stats-edit-grid">
              <div>
                <label>Jobs Posted:</label>
                <input 
                  type="number" 
                  value={form.stats.jobsPosted}
                  onChange={e => updateStats('jobsPosted', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label>Candidates Hired:</label>
                <input 
                  type="number" 
                  value={form.stats.candidatesHired}
                  onChange={e => updateStats('candidatesHired', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label>Total Applications:</label>
                <input 
                  type="number" 
                  value={form.stats.totalApplications}
                  onChange={e => updateStats('totalApplications', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* JOBS SECTION */}
        <div className="profile-box jobs-section">
          <h3>💼 Active Job Postings</h3>
          
          {!edit ? (
            <>
              {form.jobs.length === 0 ? (
                <p className="empty-state">No jobs posted yet. Click Edit to add jobs.</p>
              ) : (
                form.jobs.map(job => (
                  <div key={job.id} className="job-card">
                    <h4>{job.title}</h4>
                    <p className="position">{job.position}</p>
                    <p className="salary">💰 {job.salary}</p>
                    <p className="applicants">👥 {job.applicants} Applicants</p>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {form.jobs.map(job => (
                <div key={job.id} className="job-edit">
                  <input 
                    type="text"
                    value={job.title}
                    onChange={e => {
                      setForm({
                        ...form,
                        jobs: form.jobs.map(j => j.id === job.id ? { ...j, title: e.target.value } : j)
                      });
                    }}
                    placeholder="Job title"
                  />
                  <input 
                    type="text"
                    value={job.position}
                    onChange={e => {
                      setForm({
                        ...form,
                        jobs: form.jobs.map(j => j.id === job.id ? { ...j, position: e.target.value } : j)
                      });
                    }}
                    placeholder="Position"
                  />
                  <input 
                    type="text"
                    value={job.salary}
                    onChange={e => {
                      setForm({
                        ...form,
                        jobs: form.jobs.map(j => j.id === job.id ? { ...j, salary: e.target.value } : j)
                      });
                    }}
                    placeholder="Salary Range"
                  />
                  <input 
                    type="number"
                    value={job.applicants}
                    onChange={e => {
                      setForm({
                        ...form,
                        jobs: form.jobs.map(j => j.id === job.id ? { ...j, applicants: parseInt(e.target.value) } : j)
                      });
                    }}
                    placeholder="Applicants"
                    min="0"
                  />
                  <button className="delete-btn" onClick={() => removeJob(job.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="add-job">
                <input 
                  type="text"
                  placeholder="Job title"
                  value={newJob.title}
                  onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                />
                <input 
                  type="text"
                  placeholder="Position"
                  value={newJob.position}
                  onChange={e => setNewJob({ ...newJob, position: e.target.value })}
                />
                <input 
                  type="text"
                  placeholder="Salary Range"
                  value={newJob.salary}
                  onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
                />
                <input 
                  type="number"
                  placeholder="Applicants"
                  value={newJob.applicants}
                  onChange={e => setNewJob({ ...newJob, applicants: parseInt(e.target.value) })}
                  min="0"
                />
                <button className="add-btn" onClick={addJob}>
                  <Plus size={16} /> Add Job
                </button>
              </div>
            </>
          )}
        </div>

        {/* TEAM SECTION */}
        <div className="profile-box team-section">
          <h3>👥 Hiring Team</h3>
          
          {!edit ? (
            <>
              {form.team.length === 0 ? (
                <p className="empty-state">No team members added yet. Click Edit to add team.</p>
              ) : (
                form.team.map(member => (
                  <div key={member.id} className="team-card">
                    <h4>{member.name}</h4>
                    <p className="role">{member.designation}</p>
                    <p className="email">📧 {member.email}</p>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {form.team.map(member => (
                <div key={member.id} className="team-edit">
                  <input 
                    type="text"
                    value={member.name}
                    onChange={e => {
                      setForm({
                        ...form,
                        team: form.team.map(m => m.id === member.id ? { ...m, name: e.target.value } : m)
                      });
                    }}
                    placeholder="Member name"
                  />
                  <input 
                    type="text"
                    value={member.designation}
                    onChange={e => {
                      setForm({
                        ...form,
                        team: form.team.map(m => m.id === member.id ? { ...m, designation: e.target.value } : m)
                      });
                    }}
                    placeholder="Designation"
                  />
                  <input 
                    type="email"
                    value={member.email}
                    onChange={e => {
                      setForm({
                        ...form,
                        team: form.team.map(m => m.id === member.id ? { ...m, email: e.target.value } : m)
                      });
                    }}
                    placeholder="Email"
                  />
                  <button className="delete-btn" onClick={() => removeTeamMember(member.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="add-member">
                <input 
                  type="text"
                  placeholder="Member name"
                  value={newMember.name}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                />
                <input 
                  type="text"
                  placeholder="Designation"
                  value={newMember.designation}
                  onChange={e => setNewMember({ ...newMember, designation: e.target.value })}
                />
                <input 
                  type="email"
                  placeholder="Email"
                  value={newMember.email}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                />
                <button className="add-btn" onClick={addTeamMember}>
                  <Plus size={16} /> Add Member
                </button>
              </div>
            </>
          )}
        </div>

        {/* IMAGE UPLOAD MODAL */}
        {showImageUpload && (
          <div className="image-modal-overlay" onClick={() => setShowImageUpload(false)}>
            <div className="image-modal" onClick={e => e.stopPropagation()}>
              <h3>Upload & Adjust Company Logo</h3>
              
              {!imagePreview ? (
                <div className="image-input-section">
                  <label htmlFor="file-input" className="file-input-label">
                    <Upload size={32} /> Click to select image
                  </label>
                  <input 
                    id="file-input"
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageSelect}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                  />
                </div>
              ) : (
                <>
                  <div className="cropper-container">
                    <canvas 
                      ref={canvasRef} 
                      className="canvas-cropper"
                      style={{
                        transform: `scale(${imageZoom})`,
                        cursor: "grab"
                      }}
                    />
                  </div>
                  
                  <div className="crop-controls">
                    <div className="zoom-controls">
                      <button 
                        onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.2))}
                        className="control-btn"
                      >
                        <ZoomOut size={16} />
                      </button>
                      <span className="zoom-level">{(imageZoom * 100).toFixed(0)}%</span>
                      <button 
                        onClick={() => setImageZoom(Math.min(3, imageZoom + 0.2))}
                        className="control-btn"
                      >
                        <ZoomIn size={16} />
                      </button>
                    </div>
                    
                    <div className="action-buttons">
                      <button onClick={saveProfileImage} className="sd-btn primary">
                        <Check size={16} /> Save Logo
                      </button>
                      <button 
                        onClick={() => setImagePreview(null)} 
                        className="sd-btn ghost"
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
};

export default CompanyProfile;
