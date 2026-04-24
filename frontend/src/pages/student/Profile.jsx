import { useEffect, useState } from "react";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/profile.css";
import { getStoredUser } from "../../utils/auth";
import { syncStudentProfileCache } from "../../utils/studentProfileSync";

const EMPTY_RESUME = {
  fileName: "",
  dataUrl: "",
  text: "",
};

const EMPTY_PROJECT = {
  title: "",
  description: "",
  link: "",
};

const EMPTY_EXPERIENCE = {
  title: "",
  company: "",
  type: "internship",
  duration: "",
  location: "",
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
  experiences: [],
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
  text: resume.text || "",
});

const normalizeProfile = (studentProfile = {}, fallbackUser) => ({
  ...EMPTY_PROFILE,
  ...studentProfile,
  name: studentProfile.name || fallbackUser?.name || "",
  email: studentProfile.email || fallbackUser?.email || "",
  skills: Array.isArray(studentProfile.skills) ? studentProfile.skills : [],
  projects: Array.isArray(studentProfile.projects) ? studentProfile.projects : [],
  experiences: Array.isArray(studentProfile.experiences) ? studentProfile.experiences : [],
  resume: cloneResume(studentProfile.resume),
});

const syncStoredUserFromProfile = (studentProfile) => {
  const existingUser = getStoredUser();

  if (!existingUser) {
    return;
  }

  localStorage.setItem(
    "user",
    JSON.stringify({
      ...existingUser,
      name: studentProfile.name,
      email: studentProfile.email,
      phone: studentProfile.phone,
      github: studentProfile.githubUrl,
      leetcode: studentProfile.leetcodeUrl,
      gfg: studentProfile.gfgUrl,
      linkedin: studentProfile.linkedinUrl,
      portfolio: studentProfile.portfolioUrl,
    })
  );
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (loadEvent) => resolve(String(loadEvent.target?.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });

const getConnectedProfileCount = (profile) =>
  [
    profile.githubUrl,
    profile.leetcodeUrl,
    profile.gfgUrl,
    profile.linkedinUrl,
    profile.portfolioUrl,
  ].filter(Boolean).length;

const buildCourseDurationOptions = (selectedValue = "") => {
  const currentYear = new Date().getFullYear();
  const options = [];
  const preferredDurations = [4, 3, 2, 5, 6];

  for (let startYear = currentYear + 2; startYear >= currentYear - 8; startYear -= 1) {
    preferredDurations.forEach((duration) => {
      options.push(`${startYear} - ${startYear + duration}`);
    });
  }

  if (selectedValue && !options.includes(selectedValue)) {
    options.unshift(selectedValue);
  }

  return [...new Set(options)];
};

function Profile() {
  const [fallbackUser] = useState(() => getStoredUser());
  const [savedProfile, setSavedProfile] = useState(() => normalizeProfile({}, fallbackUser));
  const [form, setForm] = useState(() => normalizeProfile({}, fallbackUser));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newProject, setNewProject] = useState(EMPTY_PROJECT);
  const [newExperience, setNewExperience] = useState(EMPTY_EXPERIENCE);

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
  const courseDurationOptions = buildCourseDurationOptions(form.year);

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
    setNewExperience(EMPTY_EXPERIENCE);
    setForm(normalizeProfile(savedProfile, fallbackUser));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setError("");
    setSuccess("");
    setNewSkill("");
    setNewProject(EMPTY_PROJECT);
    setNewExperience(EMPTY_EXPERIENCE);
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

  const addExperience = () => {
    if (!isEditing) {
      return;
    }

    if (!newExperience.title.trim()) {
      return;
    }

    setForm((current) => ({
      ...current,
      experiences: [
        ...current.experiences,
        {
          _id: String(Date.now()),
          title: newExperience.title.trim(),
          company: newExperience.company.trim(),
          type: newExperience.type,
          duration: newExperience.duration.trim(),
          location: newExperience.location.trim(),
          description: newExperience.description.trim(),
          link: newExperience.link.trim(),
        },
      ],
    }));

    setNewExperience(EMPTY_EXPERIENCE);
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

  const updateProject = (projectId, field, value) => {
    if (!isEditing) {
      return;
    }

    setForm((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        (project._id || project.id) === projectId
          ? { ...project, [field]: value }
          : project
      ),
    }));
  };

  const removeExperience = (experienceId) => {
    if (!isEditing) {
      return;
    }

    setForm((current) => ({
      ...current,
      experiences: current.experiences.filter(
        (experience) => (experience._id || experience.id) !== experienceId
      ),
    }));
  };

  const updateExperience = (experienceId, field, value) => {
    if (!isEditing) {
      return;
    }

    setForm((current) => ({
      ...current,
      experiences: current.experiences.map((experience) =>
        (experience._id || experience.id) === experienceId
          ? { ...experience, [field]: value }
          : experience
      ),
    }));
  };

  const handleResumeUpload = async (event) => {
    if (!isEditing || loading || saving || parsingResume) {
      event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setParsingResume(true);
    setError("");
    setSuccess("");

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await api.post("/student-profiles/me/autofill-resume", {
        resume: {
          fileName: file.name,
          dataUrl,
        },
      });

      const nextProfile = normalizeProfile(response.data?.data?.studentProfile, fallbackUser);
      const autofill = response.data?.data?.autofill || {};

      setSavedProfile(nextProfile);
      setForm(nextProfile);
      syncStudentProfileCache(nextProfile);
      syncStoredUserFromProfile(nextProfile);

      const summary = [
        autofill.extractedSkills ? `${autofill.extractedSkills} skills` : "",
        autofill.extractedProjects ? `${autofill.extractedProjects} projects` : "",
        autofill.extractedExperiences ? `${autofill.extractedExperiences} experiences` : "",
      ]
        .filter(Boolean)
        .join(", ");

      setSuccess(
        `Resume uploaded and profile autofilled${summary ? ` with ${summary}` : ""}.`
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || requestError.message || "Unable to parse resume."
      );
    } finally {
      setParsingResume(false);
      event.target.value = "";
    }
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
        experiences: form.experiences.map((experience) => ({
          title: experience.title,
          company: experience.company,
          type: experience.type,
          duration: experience.duration,
          location: experience.location,
          description: experience.description,
          link: experience.link,
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
      syncStoredUserFromProfile(nextSavedProfile);
      setIsEditing(false);

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
            <span>Experience</span>
            <strong>{form.experiences.length}</strong>
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
                Course Duration
                <select
                  value={form.year}
                  onChange={(event) => updateField("year", event.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Select course duration</option>
                  {courseDurationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
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
                  accept=".pdf,.docx,.txt"
                  onChange={handleResumeUpload}
                  disabled={isReadOnly || parsingResume}
                />
              </label>
            </div>

            <div className="resume-box">
              <div>
                <strong>
                  {parsingResume
                    ? "Parsing resume and autofilling profile..."
                    : form.resume?.fileName || "No resume uploaded yet"}
                </strong>
                <p className="resume-box-copy">
                  {isEditing
                    ? "Upload a PDF, DOCX, or TXT resume to autofill skills, projects, experience, education, and social links."
                    : "Switch to edit mode to upload a PDF, DOCX, or TXT resume and autofill your profile."}
                </p>
              </div>
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
                <h2>Experience and Internships</h2>
                <p>Internship and experience details can now be autofilled from your uploaded resume.</p>
              </div>
            </div>

            {isEditing && (
              <div className="experience-form-grid">
                <input
                  placeholder="Role or internship title"
                  value={newExperience.title}
                  onChange={(event) =>
                    setNewExperience((current) => ({ ...current, title: event.target.value }))
                  }
                />
                <input
                  placeholder="Company or organization"
                  value={newExperience.company}
                  onChange={(event) =>
                    setNewExperience((current) => ({ ...current, company: event.target.value }))
                  }
                />
                <select
                  value={newExperience.type}
                  onChange={(event) =>
                    setNewExperience((current) => ({ ...current, type: event.target.value }))
                  }
                >
                  <option value="internship">Internship</option>
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="leadership">Leadership</option>
                  <option value="other">Other</option>
                </select>
                <input
                  placeholder="Duration"
                  value={newExperience.duration}
                  onChange={(event) =>
                    setNewExperience((current) => ({ ...current, duration: event.target.value }))
                  }
                />
                <input
                  placeholder="Location"
                  value={newExperience.location}
                  onChange={(event) =>
                    setNewExperience((current) => ({ ...current, location: event.target.value }))
                  }
                />
                <input
                  placeholder="Project or certificate link"
                  value={newExperience.link}
                  onChange={(event) =>
                    setNewExperience((current) => ({ ...current, link: event.target.value }))
                  }
                />
                <textarea
                  placeholder="What you worked on"
                  value={newExperience.description}
                  onChange={(event) =>
                    setNewExperience((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
                <button type="button" onClick={addExperience}>
                  Add Experience
                </button>
              </div>
            )}

            <div className="experience-list">
              {form.experiences.length > 0 ? (
                form.experiences.map((experience) => {
                  const experienceId = experience._id || experience.id;

                  return (
                    <article key={experienceId} className="project-card-v2 experience-card">
                      <div className="project-card-main">
                        {isEditing ? (
                          <div className="experience-card-editor">
                            <div className="experience-card-editor-grid">
                              <input
                                placeholder="Role or internship title"
                                value={experience.title}
                                onChange={(event) =>
                                  updateExperience(experienceId, "title", event.target.value)
                                }
                              />
                              <input
                                placeholder="Company or organization"
                                value={experience.company || ""}
                                onChange={(event) =>
                                  updateExperience(experienceId, "company", event.target.value)
                                }
                              />
                              <select
                                value={experience.type || "other"}
                                onChange={(event) =>
                                  updateExperience(experienceId, "type", event.target.value)
                                }
                              >
                                <option value="internship">Internship</option>
                                <option value="fulltime">Full Time</option>
                                <option value="parttime">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="freelance">Freelance</option>
                                <option value="leadership">Leadership</option>
                                <option value="other">Other</option>
                              </select>
                              <input
                                placeholder="Duration"
                                value={experience.duration || ""}
                                onChange={(event) =>
                                  updateExperience(experienceId, "duration", event.target.value)
                                }
                              />
                              <input
                                placeholder="Location"
                                value={experience.location || ""}
                                onChange={(event) =>
                                  updateExperience(experienceId, "location", event.target.value)
                                }
                              />
                              <input
                                placeholder="Project or certificate link"
                                value={experience.link || ""}
                                onChange={(event) =>
                                  updateExperience(experienceId, "link", event.target.value)
                                }
                              />
                            </div>
                            <textarea
                              placeholder="What you worked on"
                              value={experience.description || ""}
                              onChange={(event) =>
                                updateExperience(experienceId, "description", event.target.value)
                              }
                            />
                          </div>
                        ) : (
                          <>
                            <strong>{experience.title}</strong>
                            <p className="experience-meta">
                              {[experience.company, experience.duration, experience.location]
                                .filter(Boolean)
                                .join(" • ") || experience.type}
                            </p>
                            {experience.description && <p>{experience.description}</p>}
                            {experience.link && (
                              <a href={experience.link} target="_blank" rel="noreferrer">
                                {experience.link}
                              </a>
                            )}
                          </>
                        )}
                      </div>

                      {isEditing && (
                        <button type="button" onClick={() => removeExperience(experienceId)}>
                          Remove
                        </button>
                      )}
                    </article>
                  );
                })
              ) : (
                <p className="muted-copy">
                  Upload a resume or add experience manually to keep internship details on your profile.
                </p>
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
                      <div className="project-card-main">
                        {isEditing ? (
                          <div className="project-card-editor">
                            <input
                              placeholder="Project title"
                              value={project.title}
                              onChange={(event) =>
                                updateProject(projectId, "title", event.target.value)
                              }
                            />
                            <input
                              placeholder="Project link"
                              value={project.link || ""}
                              onChange={(event) =>
                                updateProject(projectId, "link", event.target.value)
                              }
                            />
                            <textarea
                              placeholder="Project description"
                              value={project.description}
                              onChange={(event) =>
                                updateProject(projectId, "description", event.target.value)
                              }
                            />
                          </div>
                        ) : (
                          <>
                            <strong>{project.title}</strong>
                            <p>{project.description}</p>
                            {project.link && (
                              <a href={project.link} target="_blank" rel="noreferrer">
                                {project.link}
                              </a>
                            )}
                          </>
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
