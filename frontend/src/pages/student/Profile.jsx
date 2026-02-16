import { useState, useEffect, useRef } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/profile.css";
import { Trash2, Plus, Edit2, Check, X, Upload, ZoomIn, ZoomOut } from "lucide-react";

function Profile() {
  const [edit, setEdit] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load profile from localStorage or initialize empty
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("studentProfile");
    return saved ? JSON.parse(saved) : {
      name: "",
      title: "",
      location: "",
      email: "",
      bio: "",
      github: "",
      linkedin: "",
      website: "",
      profileImage: null,
      skills: [],
      projects: [],
      stats: {
        problemsSolved: 0,
        hackathonsJoined: 0,
        rating: 0,
      }
    };
  });

  const [form, setForm] = useState(profile);
  const [newSkill, setNewSkill] = useState({ name: "", level: 0 });
  const [newProject, setNewProject] = useState({ title: "", desc: "", tags: [] });

  // Save to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem("studentProfile", JSON.stringify(profile));
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
      canvas.width = 200;
      canvas.height = 200;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image with zoom and pan
      const drawWidth = img.width * imageZoom;
      const drawHeight = img.height * imageZoom;
      const x = (canvas.width - drawWidth) / 2 + imagePan.x;
      const y = (canvas.height - drawHeight) / 2 + imagePan.y;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setForm({ ...form, profileImage: imageData });
      setImagePreview(null);
      setShowImageUpload(false);
    };

    img.src = imagePreview;
  };

  const deleteProfileImage = () => {
    setForm({ ...form, profileImage: null });
  };

  const canDeleteImage = profile.profileImage !== null;

  const addSkill = () => {
    if (newSkill.name.trim()) {
      setForm({
        ...form,
        skills: [...form.skills, { id: Date.now(), ...newSkill }]
      });
      setNewSkill({ name: "", level: 0 });
    }
  };

  const removeSkill = (id) => {
    setForm({
      ...form,
      skills: form.skills.filter(s => s.id !== id)
    });
  };

  const updateSkill = (id, field, value) => {
    setForm({
      ...form,
      skills: form.skills.map(s => s.id === id ? { ...s, [field]: value } : s)
    });
  };

  const addProject = () => {
    if (newProject.title.trim()) {
      setForm({
        ...form,
        projects: [...form.projects, { id: Date.now(), ...newProject }]
      });
      setNewProject({ title: "", desc: "", tags: [] });
    }
  };

  const removeProject = (id) => {
    setForm({
      ...form,
      projects: form.projects.filter(p => p.id !== id)
    });
  };

  const updateProject = (id, field, value) => {
    setForm({
      ...form,
      projects: form.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const updateStats = (field, value) => {
    setForm({
      ...form,
      stats: { ...form.stats, [field]: parseInt(value) || 0 }
    });
  };

  return (
    <StudentLayout>
      <div className="sd-container">

        {/* HEADER */}
        <div className="sd-header">
          <div>
            <h1>Profile</h1>
            <p>Your developer portfolio & achievement</p>
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

        {/* IMAGE UPLOAD MODAL */}
        {showImageUpload && (
          <div className="image-upload-modal-overlay" onClick={() => setShowImageUpload(false)}>
            <div className="image-upload-modal" onClick={e => e.stopPropagation()}>
              <h3>Adjust Your Profile Picture</h3>
              
              {imagePreview ? (
                <>
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview} 
                      alt="preview"
                      style={{
                        transform: `scale(${imageZoom}) translate(${imagePan.x}px, ${imagePan.y}px)`,
                        cursor: "move"
                      }}
                      onMouseDown={(e) => {
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startPanX = imagePan.x;
                        const startPanY = imagePan.y;

                        const handleMouseMove = (moveEvent) => {
                          setImagePan({
                            x: startPanX + (moveEvent.clientX - startX) / imageZoom,
                            y: startPanY + (moveEvent.clientY - startY) / imageZoom,
                          });
                        };

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove);
                          document.removeEventListener("mouseup", handleMouseUp);
                        };

                        document.addEventListener("mousemove", handleMouseMove);
                        document.addEventListener("mouseup", handleMouseUp);
                      }}
                    />
                  </div>

                  <div className="image-controls">
                    <div className="zoom-controls">
                      <button onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.2))}>
                        <ZoomOut size={18} /> Zoom Out
                      </button>
                      <span className="zoom-level">{Math.round(imageZoom * 100)}%</span>
                      <button onClick={() => setImageZoom(Math.min(3, imageZoom + 0.2))}>
                        <ZoomIn size={18} /> Zoom In
                      </button>
                    </div>
                  </div>

                  <canvas ref={canvasRef} style={{ display: "none" }} />

                  <div className="modal-actions">
                    <button className="sd-btn" onClick={saveProfileImage}>
                      <Check size={16} /> Save Picture
                    </button>
                    <button className="sd-btn ghost" onClick={() => setImagePreview(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                  <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={32} />
                    <p>Click to select an image</p>
                    <span>Supports JPG, PNG, GIF</span>
                  </div>
                  <button className="sd-btn ghost" onClick={() => setShowImageUpload(false)}>
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* PROFILE SECTION */}
        <div className="profile-card">
          {/* LEFT */}
          <div className="profile-left">
            <div className="avatar-container">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="avatar-placeholder">
                  {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              
              {edit && (
                <div className="avatar-actions">
                  <button 
                    className="avatar-btn upload-btn"
                    onClick={() => setShowImageUpload(true)}
                    title="Upload image"
                  >
                    <Upload size={16} />
                  </button>
                  {canDeleteImage && (
                    <button 
                      className="avatar-btn delete-btn"
                      onClick={deleteProfileImage}
                      title="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {!edit ? (
              <>
                <h2>{form.name || "Add your name"}</h2>
                <p className="title">{form.title || "Add your title"}</p>
                <p className="bio">{form.bio || "Add your bio"}</p>
              </>
            ) : (
              <>
                <input 
                  placeholder="Full Name" 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                />
                <input 
                  placeholder="Professional Title" 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })} 
                />
                <textarea 
                  placeholder="Bio" 
                  value={form.bio} 
                  onChange={e => setForm({ ...form, bio: e.target.value })} 
                />
              </>
            )}
          </div>

          {/* RIGHT */}
          <div className="profile-right">
            {!edit ? (
              <>
                {form.email && <p><b>📧 Email:</b> {form.email}</p>}
                {form.location && <p><b>📍 Location:</b> {form.location}</p>}
                
                {(form.github || form.linkedin || form.website) && (
                  <div className="links">
                    {form.github && <a href={`https://${form.github}`} target="_blank" rel="noreferrer">GitHub</a>}
                    {form.linkedin && <a href={`https://${form.linkedin}`} target="_blank" rel="noreferrer">LinkedIn</a>}
                    {form.website && <a href={`https://${form.website}`} target="_blank" rel="noreferrer">Website</a>}
                  </div>
                )}
              </>
            ) : (
              <>
                <input 
                  placeholder="Email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                />
                <input 
                  placeholder="Location" 
                  value={form.location} 
                  onChange={e => setForm({ ...form, location: e.target.value })} 
                />
                <input 
                  placeholder="GitHub URL" 
                  value={form.github} 
                  onChange={e => setForm({ ...form, github: e.target.value })} 
                />
                <input 
                  placeholder="LinkedIn URL" 
                  value={form.linkedin} 
                  onChange={e => setForm({ ...form, linkedin: e.target.value })} 
                />
                <input 
                  placeholder="Portfolio Website" 
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
              <div className="stat-number">{profile.stats.problemsSolved}</div>
              <div className="stat-label">Problems Solved</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{profile.stats.hackathonsJoined}</div>
              <div className="stat-label">Hackathons Joined</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{profile.stats.rating}⭐</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>
        )}

        {edit && (
          <div className="stats-edit-section">
            <h3>📊 Update Your Stats</h3>
            <div className="stats-edit-grid">
              <div>
                <label>Problems Solved:</label>
                <input 
                  type="number" 
                  value={form.stats.problemsSolved}
                  onChange={e => updateStats('problemsSolved', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label>Hackathons Joined:</label>
                <input 
                  type="number" 
                  value={form.stats.hackathonsJoined}
                  onChange={e => updateStats('hackathonsJoined', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label>Rating:</label>
                <input 
                  type="number" 
                  value={form.stats.rating}
                  onChange={e => updateStats('rating', e.target.value)}
                  min="0"
                  max="5"
                />
              </div>
            </div>
          </div>
        )}

        {/* SKILLS SECTION */}
        <div className="profile-box skills-section">
          <h3>🛠️ Skills</h3>
          
          {!edit ? (
            <>
              {form.skills.length === 0 ? (
                <p className="empty-state">No skills added yet. Click Edit to add skills.</p>
              ) : (
                form.skills.map(skill => (
                  <div key={skill.id} className="skill">
                    <span>{skill.name}</span>
                    <div className="bar">
                      <div style={{ width: `${skill.level}%` }} />
                    </div>
                    <span className="level">{skill.level}%</span>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {form.skills.map(skill => (
                <div key={skill.id} className="skill-edit">
                  <input 
                    type="text"
                    value={skill.name}
                    onChange={e => updateSkill(skill.id, 'name', e.target.value)}
                    placeholder="Skill name"
                  />
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={skill.level}
                    onChange={e => updateSkill(skill.id, 'level', parseInt(e.target.value))}
                  />
                  <span className="level">{skill.level}%</span>
                  <button className="delete-btn" onClick={() => removeSkill(skill.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="add-skill">
                <input 
                  type="text"
                  placeholder="New skill"
                  value={newSkill.name}
                  onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                />
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={newSkill.level}
                  onChange={e => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                />
                <span className="level">{newSkill.level}%</span>
                <button className="add-btn" onClick={addSkill}>
                  <Plus size={16} /> Add
                </button>
              </div>
            </>
          )}
        </div>

        {/* PROJECTS SECTION */}
        <div className="profile-box projects-section">
          <h3>🚀 Projects</h3>
          
          {!edit ? (
            <>
              {form.projects.length === 0 ? (
                <p className="empty-state">No projects added yet. Click Edit to add projects.</p>
              ) : (
                form.projects.map(project => (
                  <div key={project.id} className="project">
                    <h4>{project.title}</h4>
                    <p>{project.desc}</p>
                    {project.tags && project.tags.length > 0 && (
                      <div className="tags">
                        {project.tags.map(t => <span key={t}>{t}</span>)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {form.projects.map(project => (
                <div key={project.id} className="project-edit">
                  <input 
                    type="text"
                    value={project.title}
                    onChange={e => updateProject(project.id, 'title', e.target.value)}
                    placeholder="Project title"
                  />
                  <textarea 
                    value={project.desc}
                    onChange={e => updateProject(project.id, 'desc', e.target.value)}
                    placeholder="Project description"
                  />
                  <input 
                    type="text"
                    value={project.tags.join(", ")}
                    onChange={e => updateProject(project.id, 'tags', e.target.value.split(",").map(t => t.trim()))}
                    placeholder="Tags (comma separated)"
                  />
                  <button className="delete-btn" onClick={() => removeProject(project.id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              ))}
              
              <div className="add-project">
                <input 
                  type="text"
                  placeholder="Project title"
                  value={newProject.title}
                  onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                />
                <textarea 
                  placeholder="Project description"
                  value={newProject.desc}
                  onChange={e => setNewProject({ ...newProject, desc: e.target.value })}
                />
                <input 
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={newProject.tags.join(", ")}
                  onChange={e => setNewProject({ ...newProject, tags: e.target.value.split(",").map(t => t.trim()) })}
                />
                <button className="add-btn" onClick={addProject}>
                  <Plus size={16} /> Add Project
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </StudentLayout>
  );
}

export default Profile;
