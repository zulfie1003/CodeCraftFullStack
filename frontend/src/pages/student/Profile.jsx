import { useEffect, useState } from "react";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/profile.css";
import { getStoredUser } from "../../utils/auth";
import { syncStudentProfileCache } from "../../utils/studentProfileSync";

const EMPTY_RESUME = {
  fileName: "",
  dataUrl: "",
};

const EMPTY_PROJECT = {
  title: "",
  description: "",
  link: "",
};

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  college: "",
  degree: "",
  year: "",
  experienceLevel: "fresher",
  skills: [],
  projects: [],
  resume: EMPTY_RESUME,
  githubUrl: "",
  leetcodeUrl: "",
  gfgUrl: "",
  portfolioUrl: "",
  linkedinUrl: "",
};

const cloneResume = (resume = {}) => ({
  fileName: resume.fileName || "",
  dataUrl: resume.dataUrl || "",
});

const normalizeProfile = (studentProfile = {}, fallbackUser) => ({
  ...EMPTY_PROFILE,
  ...studentProfile,
  name: studentProfile.name || fallbackUser?.name || "",
  email: studentProfile.email || fallbackUser?.email || "",
  skills: Array.isArray(studentProfile.skills) ? studentProfile.skills : [],
  projects: Array.isArray(studentProfile.projects) ? studentProfile.projects : [],
  resume: cloneResume(studentProfile.resume),
});

const getConnectedProfileCount = (profile) =>
  [
    profile.githubUrl,
    profile.leetcodeUrl,
    profile.gfgUrl,
    profile.linkedinUrl,
    profile.portfolioUrl,
  ].filter(Boolean).length;

function Profile() {
  const [fallbackUser] = useState(() => getStoredUser());
  const [savedProfile, setSavedProfile] = useState(() => normalizeProfile({}, fallbackUser));
  const [form, setForm] = useState(() => normalizeProfile({}, fallbackUser));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState(EMPTY_PROJECT);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/student-profiles/me");
        const nextProfile = normalizeProfile(response.data?.data?.studentProfile, fallbackUser);

        if (isMounted) {
          setSavedProfile(nextProfile);
          setForm(nextProfile);
          syncStudentProfileCache(nextProfile);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load student profile.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [fallbackUser]);

  const isReadOnly = !isEditing || loading || saving;
  const connectedProfilesCount = getConnectedProfileCount(form);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const startEditing = () => {
    setError("");
    setSuccess("");
    setNewSkill("");
    setNewProject(EMPTY_PROJECT);
    setForm(normalizeProfile(savedProfile, fallbackUser));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setError("");
    setSuccess("");
    setNewSkill("");
    setNewProject(EMPTY_PROJECT);
    setForm(normalizeProfile(savedProfile, fallbackUser));
    setIsEditing(false);
  };

  const addSkill = () => {
    if (!isEditing) {
      return;
    }

    const trimmedSkill = newSkill.trim();

    if (!trimmedSkill) {
      return;
    }

    setForm((current) => ({
      ...current,
      skills: current.skills.includes(trimmedSkill)
        ? current.skills
        : [...current.skills, trimmedSkill],
    }));
    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    if (!isEditing) {
      return;
    }

    setForm((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const addProject = () => {
    if (!isEditing) {
      return;
    }

    if (!newProject.title.trim() || !newProject.description.trim()) {
      return;
    }

    setForm((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          _id: String(Date.now()),
          title: newProject.title.trim(),
          description: newProject.description.trim(),
          link: newProject.link.trim(),
        },
      ],
    }));

    setNewProject(EMPTY_PROJECT);
  };

  const removeProject = (projectId) => {
    if (!isEditing) {
      return;
    }

    setForm((current) => ({
      ...current,
      projects: current.projects.filter((project) => (project._id || project.id) !== projectId),
    }));
  };

  const handleResumeUpload = (event) => {
    if (!isEditing) {
      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setForm((current) => ({
        ...current,
        resume: {
          fileName: file.name,
          dataUrl: String(loadEvent.target?.result || ""),
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!isEditing) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        college: form.college,
        degree: form.degree,
        year: form.year,
        experienceLevel: form.experienceLevel,
        skills: form.skills,
        projects: form.projects.map((project) => ({
          title: project.title,
          description: project.description,
          link: project.link,
        })),
        resume: form.resume,
        githubUrl: form.githubUrl,
        leetcodeUrl: form.leetcodeUrl,
        gfgUrl: form.gfgUrl,
        portfolioUrl: form.portfolioUrl,
        linkedinUrl: form.linkedinUrl,
      };

      const response = await api.put("/student-profiles/me", payload);
      const nextSavedProfile = normalizeProfile(response.data?.data?.studentProfile, fallbackUser);

      setSavedProfile(nextSavedProfile);
      setForm(nextSavedProfile);
      syncStudentProfileCache(nextSavedProfile);
      setIsEditing(false);

      const existingUser = getStoredUser();
      if (existingUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...existingUser,
            name: nextSavedProfile.name,
            email: nextSavedProfile.email,
            github: nextSavedProfile.githubUrl,
            leetcode: nextSavedProfile.leetcodeUrl,
            gfg: nextSavedProfile.gfgUrl,
            linkedin: nextSavedProfile.linkedinUrl,
            portfolio: nextSavedProfile.portfolioUrl,
          })
        );
      }

      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save student profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <StudentLayout>
      <div className="profile-shell-v2">
        <div className="profile-page-header">
          <div>
            <p className="profile-eyebrow">Central Student Profile</p>
            <h1>Student Profile</h1>
            <p className="profile-subtitle">
              Keep your core details, coding profiles, resume, and projects in one shared profile
              for the dashboard, jobs, and hackathons sections.
            </p>
          </div>

          <div className="profile-header-actions">
            {isEditing ? (
              <>
                <button
                  className="profile-secondary-btn"
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="profile-save-btn"
                  type="button"
                  onClick={saveProfile}
                  disabled={saving || loading}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                className="profile-save-btn"
                type="button"
                onClick={startEditing}
                disabled={loading}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {error && <div className="profile-message error">{error}</div>}
        {success && <div className="profile-message success">{success}</div>}

        <div className="profile-summary-grid">
          <div className="profile-summary-card">
            <span>Skills</span>
            <strong>{form.skills.length}</strong>
          </div>
          <div className="profile-summary-card">
            <span>Projects</span>
            <strong>{form.projects.length}</strong>
          </div>
          <div className="profile-summary-card">
            <span>Resume</span>
            <strong>{form.resume?.fileName ? "Uploaded" : "Missing"}</strong>
          </div>
          <div className="profile-summary-card">
            <span>Coding Profiles</span>
            <strong>{connectedProfilesCount}</strong>
          </div>
          <div className="profile-summary-card">
            <span>Mode</span>
            <strong>{isEditing ? "Editing" : "Read Only"}</strong>
          </div>
        </div>

        <div className="profile-grid-v2">
          <section className="profile-form-card">
            <div className="profile-section-head">
              <div>
                <h2>Core Details</h2>
                <p>Your main student details used across the platform.</p>
              </div>
            </div>

            <div className="profile-fields-grid">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                Email
                <input
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                College
                <input
                  value={form.college}
                  onChange={(event) => updateField("college", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                Degree
                <input
                  value={form.degree}
                  onChange={(event) => updateField("degree", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                Year
                <input
                  value={form.year}
                  onChange={(event) => updateField("year", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                Experience Level
                <select
                  value={form.experienceLevel}
                  onChange={(event) => updateField("experienceLevel", event.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="fresher">Fresher</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                </select>
              </label>
            </div>
          </section>

          <section className="profile-form-card">
            <div className="profile-section-head">
              <div>
                <h2>Coding Profiles and Resume</h2>
                <p>These links feed the dashboard so GitHub, LeetCode, and GFG data can sync.</p>
              </div>
            </div>

            <div className="profile-fields-grid">
              <label>
                GitHub
                <input
                  placeholder="https://github.com/username"
                  value={form.githubUrl}
                  onChange={(event) => updateField("githubUrl", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                LeetCode
                <input
                  placeholder="https://leetcode.com/u/username/ or username"
                  value={form.leetcodeUrl}
                  onChange={(event) => updateField("leetcodeUrl", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                GeeksforGeeks
                <input
                  placeholder="https://www.geeksforgeeks.org/user/username/ or username"
                  value={form.gfgUrl}
                  onChange={(event) => updateField("gfgUrl", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                Portfolio
                <input
                  placeholder="https://portfolio.com"
                  value={form.portfolioUrl}
                  onChange={(event) => updateField("portfolioUrl", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label>
                LinkedIn
                <input
                  placeholder="https://linkedin.com/in/username"
                  value={form.linkedinUrl}
                  onChange={(event) => updateField("linkedinUrl", event.target.value)}
                  readOnly={isReadOnly}
                />
              </label>
              <label className="resume-upload-field">
                Resume Upload
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={isReadOnly}
                />
              </label>
            </div>

            <div className="resume-box">
              <strong>{form.resume?.fileName || "No resume uploaded yet"}</strong>
              {form.resume?.dataUrl && (
                <a href={form.resume.dataUrl} download={form.resume.fileName || "resume"}>
                  Download Resume
                </a>
              )}
            </div>
          </section>

          <section className="profile-form-card">
            <div className="profile-section-head">
              <div>
                <h2>Skills</h2>
                <p>Add skills here so job matching can work correctly.</p>
              </div>
            </div>

            {isEditing && (
              <div className="inline-form-row">
                <input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <button type="button" onClick={addSkill}>
                  Add Skill
                </button>
              </div>
            )}

            <div className="chip-list">
              {form.skills.length > 0 ? (
                form.skills.map((skill) =>
                  isEditing ? (
                    <button
                      key={skill}
                      className="skill-chip"
                      type="button"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} x
                    </button>
                  ) : (
                    <span key={skill} className="skill-chip static">
                      {skill}
                    </span>
                  )
                )
              ) : (
                <p className="muted-copy">Add your core skills for recruiter filtering and job matching.</p>
              )}
            </div>
          </section>

          <section className="profile-form-card full-span">
            <div className="profile-section-head">
              <div>
                <h2>Projects</h2>
                <p>Saved projects are shown in your profile and can also support the dashboard.</p>
              </div>
            </div>

            {isEditing && (
              <div className="project-form-grid">
                <input
                  placeholder="Project title"
                  value={newProject.title}
                  onChange={(event) =>
                    setNewProject((current) => ({ ...current, title: event.target.value }))
                  }
                />
                <input
                  placeholder="Project link"
                  value={newProject.link}
                  onChange={(event) =>
                    setNewProject((current) => ({ ...current, link: event.target.value }))
                  }
                />
                <textarea
                  placeholder="Project description"
                  value={newProject.description}
                  onChange={(event) =>
                    setNewProject((current) => ({ ...current, description: event.target.value }))
                  }
                />
                <button type="button" onClick={addProject}>
                  Add Project
                </button>
              </div>
            )}

            <div className="project-list">
              {form.projects.length > 0 ? (
                form.projects.map((project) => {
                  const projectId = project._id || project.id;

                  return (
                    <article key={projectId} className="project-card-v2">
                      <div>
                        <strong>{project.title}</strong>
                        <p>{project.description}</p>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noreferrer">
                            {project.link}
                          </a>
                        )}
                      </div>

                      {isEditing && (
                        <button type="button" onClick={() => removeProject(projectId)}>
                          Remove
                        </button>
                      )}
                    </article>
                  );
                })
              ) : (
                <p className="muted-copy">Add projects so recruiters and organizers can review your work.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </StudentLayout>
  );
}

export default Profile;
