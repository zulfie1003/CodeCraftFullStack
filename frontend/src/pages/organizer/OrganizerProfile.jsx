
import { useState, useEffect, useRef } from "react";
import OrganizerLayout from "../../layouts/OrganizerLayout";
import "../../styles/profile.css";
import { Edit2, Check, X, Trash2, Plus, Upload, ZoomIn, ZoomOut } from "lucide-react";

const OrganizerProfile = () => {
  const [edit, setEdit] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("organizerProfile");
    return saved ? JSON.parse(saved) : {
      organizationName: "",
      type: "Tech Community",
      location: "",
      email: "",
      website: "",
      bio: "",
      logo: null,
      events: [],
      team: [],
      stats: {
        hackathonsHosted: 0,
        totalParticipants: 0,
        totalPrizePool: 0,
      }
    };
  });

  const [form, setForm] = useState(profile);
  const [newEvent, setNewEvent] = useState({ name: "", date: "", participants: 0 });
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" });

  useEffect(() => {
    localStorage.setItem("organizerProfile", JSON.stringify(profile));
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

  const addEvent = () => {
    if (newEvent.name.trim()) {
      setForm({
        ...form,
        events: [...form.events, { id: Date.now(), ...newEvent }]
      });
      setNewEvent({ name: "", date: "", participants: 0 });
    }
  };

  const removeEvent = (id) => {
    setForm({
      ...form,
      events: form.events.filter(e => e.id !== id)
    });
  };

  const addTeamMember = () => {
    if (newMember.name.trim()) {
      setForm({
        ...form,
        team: [...form.team, { id: Date.now(), ...newMember }]
      });
      setNewMember({ name: "", role: "", email: "" });
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
    <OrganizerLayout>
      <div className="sd-container">

        {/* HEADER */}
        <div className="sd-header">
          <div>
            <h1>Organization Profile</h1>
            <p>Manage your hackathon events & team</p>
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
          <div className="image-modal-overlay" onClick={() => setShowImageUpload(false)}>
            <div className="image-modal" onClick={e => e.stopPropagation()}>
              <h3>Upload & Adjust Organization Logo</h3>
              
              {!imagePreview ? (
                <div className="image-input-section">
                  <label htmlFor="file-input-org" className="file-input-label">
                    <Upload size={32} /> Click to select image
                  </label>
                  <input 
                    id="file-input-org"
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
                <h2>{form.organizationName || "Organization Name"}</h2>
                <p className="title">{form.type}</p>
                <p className="bio">{form.bio || "Add organization bio"}</p>
              </>
            ) : (
              <>
                <input 
                  placeholder="Organization Name" 
                  value={form.organizationName}
                  onChange={e => setForm({ ...form, organizationName: e.target.value })}
                />
                <input 
                  placeholder="Organization Type" 
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                />
                <textarea 
                  placeholder="Organization Bio"
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
                {form.location && <p><b>📍 Location:</b> {form.location}</p>}
                {form.website && <p><b>🌐 Website:</b> {form.website}</p>}
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
              <div className="stat-number">{profile.stats.hackathonsHosted}</div>
              <div className="stat-label">Hackathons Hosted</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{profile.stats.totalParticipants}</div>
              <div className="stat-label">Total Participants</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">₹{profile.stats.totalPrizePool}K</div>
              <div className="stat-label">Prize Pool</div>
            </div>
          </div>
        )}

        {edit && (
          <div className="stats-edit-section">
            <h3>📊 Update Your Stats</h3>
            <div className="stats-edit-grid">
              <div>
                <label>Hackathons Hosted:</label>
                <input 
                  type="number" 
                  value={form.stats.hackathonsHosted}
                  onChange={e => updateStats('hackathonsHosted', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label>Total Participants:</label>
                <input 
                  type="number" 
                  value={form.stats.totalParticipants}
                  onChange={e => updateStats('totalParticipants', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label>Total Prize Pool (in K):</label>
                <input 
                  type="number" 
                  value={form.stats.totalPrizePool}
                  onChange={e => updateStats('totalPrizePool', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
        )}

        {/* EVENTS SECTION */}
        <div className="profile-box events-section">
          <h3>🎉 Hackathon Events</h3>
          
          {!edit ? (
            <>
              {form.events.length === 0 ? (
                <p className="empty-state">No events created yet. Click Edit to add events.</p>
              ) : (
                form.events.map(event => (
                  <div key={event.id} className="event-card">
                    <h4>{event.name}</h4>
                    <p>📅 {event.date}</p>
                    <p>👥 {event.participants} Participants</p>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              {form.events.map(event => (
                <div key={event.id} className="event-edit">
                  <input 
                    type="text"
                    value={event.name}
                    onChange={e => {
                      setForm({
                        ...form,
                        events: form.events.map(ev => ev.id === event.id ? { ...ev, name: e.target.value } : ev)
                      });
                    }}
                    placeholder="Event name"
                  />
                  <input 
                    type="date"
                    value={event.date}
                    onChange={e => {
                      setForm({
                        ...form,
                        events: form.events.map(ev => ev.id === event.id ? { ...ev, date: e.target.value } : ev)
                      });
                    }}
                  />
                  <input 
                    type="number"
                    value={event.participants}
                    onChange={e => {
                      setForm({
                        ...form,
                        events: form.events.map(ev => ev.id === event.id ? { ...ev, participants: parseInt(e.target.value) } : ev)
                      });
                    }}
                    placeholder="Participants"
                    min="0"
                  />
                  <button className="delete-btn" onClick={() => removeEvent(event.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="add-event">
                <input 
                  type="text"
                  placeholder="Event name"
                  value={newEvent.name}
                  onChange={e => setNewEvent({ ...newEvent, name: e.target.value })}
                />
                <input 
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <input 
                  type="number"
                  placeholder="Participants"
                  value={newEvent.participants}
                  onChange={e => setNewEvent({ ...newEvent, participants: parseInt(e.target.value) })}
                  min="0"
                />
                <button className="add-btn" onClick={addEvent}>
                  <Plus size={16} /> Add Event
                </button>
              </div>
            </>
          )}
        </div>

        {/* TEAM SECTION */}
        <div className="profile-box team-section">
          <h3>👥 Team Members</h3>
          
          {!edit ? (
            <>
              {form.team.length === 0 ? (
                <p className="empty-state">No team members added yet. Click Edit to add team.</p>
              ) : (
                form.team.map(member => (
                  <div key={member.id} className="team-card">
                    <h4>{member.name}</h4>
                    <p className="role">{member.role}</p>
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
                    value={member.role}
                    onChange={e => {
                      setForm({
                        ...form,
                        team: form.team.map(m => m.id === member.id ? { ...m, role: e.target.value } : m)
                      });
                    }}
                    placeholder="Role"
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
                  placeholder="Role"
                  value={newMember.role}
                  onChange={e => setNewMember({ ...newMember, role: e.target.value })}
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

      </div>
    </OrganizerLayout>
  );
};

export default OrganizerProfile;
