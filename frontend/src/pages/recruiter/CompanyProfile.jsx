import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  Edit2,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import api from "../../api/axios";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import "../../styles/profile.css";
import { getStoredUser } from "../../utils/auth";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  bio: "",
  avatar: "",
  companyName: "",
  industry: "",
};

const syncStoredUser = (user) => {
  const storedUser = getStoredUser();

  if (!user) {
    return;
  }

  localStorage.setItem(
    "user",
    JSON.stringify({
      ...(storedUser || {}),
      id: user._id || user.id || storedUser?.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  );
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatDate = (value) => {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Recently"
    : parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatSalary = (job) => {
  if (job?.salary) {
    return job.salary;
  }

  return "Salary not shared";
};

function CompanyProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [form, setForm] = useState(emptyProfile);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      const [profileResult, jobsResult, applicationsResult] = await Promise.allSettled([
        api.get("/auth/me"),
        api.get("/jobs/mine"),
        api.get("/applications/recruiter"),
      ]);

      if (!isMounted) {
        return;
      }

      if (profileResult.status !== "fulfilled") {
        setError(
          profileResult.reason?.response?.data?.message || "Unable to load recruiter profile."
        );
        setLoading(false);
        return;
      }

      const nextProfile = {
        ...emptyProfile,
        ...(profileResult.value.data?.data?.user || {}),
      };

      setProfile(nextProfile);
      setForm(nextProfile);
      setJobs(
        jobsResult.status === "fulfilled" && Array.isArray(jobsResult.value.data?.data?.jobs)
          ? jobsResult.value.data.data.jobs
          : []
      );
      setApplications(
        applicationsResult.status === "fulfilled" &&
          Array.isArray(applicationsResult.value.data?.data?.applications)
          ? applicationsResult.value.data.data.applications
          : []
      );

      if (jobsResult.status !== "fulfilled" || applicationsResult.status !== "fulfilled") {
        setError("Some live recruiter data could not be loaded right now.");
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      handleChange("avatar", dataUrl);
    } catch {
      setError("Unable to read the selected image.");
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch("/auth/me", {
        name: form.name,
        phone: form.phone,
        location: form.location,
        website: form.website,
        bio: form.bio,
        avatar: form.avatar,
        companyName: form.companyName,
        industry: form.industry,
      });

      const nextProfile = {
        ...emptyProfile,
        ...(response.data?.data?.user || form),
      };

      setProfile(nextProfile);
      setForm(nextProfile);
      syncStoredUser(response.data?.data?.user);
      setEditing(false);
      setSuccess("Company profile updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save recruiter profile.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(profile);
    setEditing(false);
    setError("");
    setSuccess("");
  };

  const activeJobs = useMemo(
    () => jobs.filter((job) => String(job.status || "").toLowerCase() === "active").length,
    [jobs]
  );

  const shortlistedCandidates = useMemo(
    () => applications.filter((application) => application.status === "shortlisted").length,
    [applications]
  );

  const uniqueCandidates = useMemo(
    () =>
      new Set(
        applications
          .map((application) => application.student?._id || application.student?.user)
          .filter(Boolean)
      ).size,
    [applications]
  );

  const topSkills = useMemo(() => {
    const skillCounts = new Map();

    jobs.forEach((job) => {
      (Array.isArray(job.skills) ? job.skills : []).forEach((skill) => {
        const key = String(skill || "").trim();

        if (!key) {
          return;
        }

        skillCounts.set(key, (skillCounts.get(key) || 0) + 1);
      });
    });

    return Array.from(skillCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6);
  }, [jobs]);

  const profileTitle =
    profile.companyName || profile.name || (loading ? "Loading recruiter profile" : "Recruiter profile");
  const profileSubtitle =
    profile.industry || "Add your company focus so students understand the hiring context.";
  const profileBio =
    profile.bio || "This recruiter profile will reflect only live company and hiring data.";
  const avatarFallback = (profile.companyName || profile.name || "CC")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <RecruiterLayout>
      <div className="profile-shell">
        <div className="profile-topbar">
          <div>
            <p className="profile-eyebrow">Recruiter Workspace</p>
            <h1>Company Profile</h1>
            <p className="profile-subtitle">
              Your company details, open roles, and applicant pipeline are pulled from live backend
              records only.
            </p>
          </div>

          <div className="profile-action-group">
            <Link className="profile-action-btn primary" to="/recruiter/post-job">
              <BriefcaseBusiness size={16} /> Post Job
            </Link>

            {editing ? (
              <>
                <button className="profile-action-btn success" disabled={saving} onClick={saveProfile}>
                  <Check size={16} /> {saving ? "Saving..." : "Save"}
                </button>
                <button className="profile-action-btn ghost" onClick={resetForm}>
                  <X size={16} /> Cancel
                </button>
              </>
            ) : (
              <button className="profile-action-btn ghost" onClick={() => setEditing(true)}>
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <section className="profile-hero-card">
          <div className="profile-hero-panel">
            <div className="avatar-wrap">
              {form.avatar ? (
                <img className="profile-avatar" src={form.avatar} alt={profileTitle} />
              ) : (
                <div className="avatar-placeholder">{avatarFallback || "CC"}</div>
              )}

              {editing && (
                <div className="avatar-actions">
                  <label className="avatar-icon-btn" htmlFor="recruiter-avatar-input">
                    <Upload size={18} />
                  </label>
                  <input
                    id="recruiter-avatar-input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarUpload}
                  />
                  {form.avatar && (
                    <button
                      className="icon-danger-btn"
                      onClick={() => handleChange("avatar", "")}
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="hero-copy">
              <p className="profile-status-chip">Live Recruiter Profile</p>

              {editing ? (
                <div className="hero-edit-grid">
                  <div className="field-block">
                    <label>Contact Name</label>
                    <input value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
                  </div>
                  <div className="field-block">
                    <label>Company Name</label>
                    <input
                      value={form.companyName}
                      onChange={(event) => handleChange("companyName", event.target.value)}
                    />
                  </div>
                  <div className="field-block">
                    <label>Industry</label>
                    <input
                      value={form.industry}
                      onChange={(event) => handleChange("industry", event.target.value)}
                    />
                  </div>
                  <div className="field-block">
                    <label>Phone</label>
                    <input value={form.phone} onChange={(event) => handleChange("phone", event.target.value)} />
                  </div>
                  <div className="field-block">
                    <label>Location</label>
                    <input
                      value={form.location}
                      onChange={(event) => handleChange("location", event.target.value)}
                    />
                  </div>
                  <div className="field-block">
                    <label>Website</label>
                    <input
                      value={form.website}
                      onChange={(event) => handleChange("website", event.target.value)}
                    />
                  </div>
                  <div className="field-block full-width">
                    <label>Company Summary</label>
                    <textarea
                      value={form.bio}
                      onChange={(event) => handleChange("bio", event.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2>{profileTitle}</h2>
                  <p className="hero-role">{profileSubtitle}</p>
                  <p className="hero-bio">{profileBio}</p>
                </>
              )}
            </div>
          </div>

          <aside className="profile-side-panel">
            <div className="profile-side-card">
              <span className="mini-heading">
                <BriefcaseBusiness size={14} /> Hiring Pipeline
              </span>
              <div className="completion-value">{loading ? "..." : jobs.length}</div>
              <p className="completion-copy">
                Open roles and applicant counts on this page come directly from the jobs and
                applications collections.
              </p>
            </div>

            <div className="profile-side-card">
              <span className="mini-heading">
                <Building2 size={14} /> Contact
              </span>
              <div className="contact-list">
                <div className="contact-row">
                  <Mail size={15} /> <span>{profile.email || "No email available"}</span>
                </div>
                <div className="contact-row">
                  <Phone size={15} /> <span>{profile.phone || "Add a phone number"}</span>
                </div>
                <div className="contact-row">
                  <MapPin size={15} /> <span>{profile.location || "Add a location"}</span>
                </div>
                <div className="contact-row">
                  <Globe2 size={15} /> <span>{profile.website || "Add a website"}</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <div className="profile-grid">
          <div className="profile-main-column">
            <section className="portfolio-card">
              <div className="card-head">
                <div>
                  <p className="card-eyebrow">
                    <Users size={14} /> Live Metrics
                  </p>
                  <h3>Hiring Snapshot</h3>
                </div>
                <span className="card-meta">{applications.length} live applications</span>
              </div>

              <div className="highlight-stack">
                <div className="highlight-stat-card">
                  <span>Jobs Posted</span>
                  <strong>{loading ? "..." : jobs.length}</strong>
                </div>
                <div className="highlight-stat-card">
                  <span>Active Jobs</span>
                  <strong>{loading ? "..." : activeJobs}</strong>
                </div>
                <div className="highlight-stat-card">
                  <span>Unique Candidates</span>
                  <strong>{loading ? "..." : uniqueCandidates}</strong>
                </div>
                <div className="highlight-stat-card">
                  <span>Shortlisted</span>
                  <strong>{loading ? "..." : shortlistedCandidates}</strong>
                </div>
              </div>
            </section>

            <section className="portfolio-card">
              <div className="card-head">
                <div>
                  <p className="card-eyebrow">
                    <BriefcaseBusiness size={14} /> Jobs
                  </p>
                  <h3>Live Job Postings</h3>
                </div>
                <span className="card-meta">{jobs.length} published roles</span>
              </div>

              {jobs.length > 0 ? (
                <div className="project-grid-modern">
                  {jobs.map((job) => (
                    <article className="project-card-modern" key={job._id}>
                      <div className="project-card-header">
                        <div>
                          <h4>{job.title}</h4>
                          <p>{job.location || "Location not set"}</p>
                        </div>
                        <span className="project-chip">{job.status || "draft"}</span>
                      </div>
                      <p>{job.description || "No description provided yet."}</p>
                      <div className="tag-row-modern">
                        <span className="project-tag">{formatSalary(job)}</span>
                        <span className="project-tag">{job.experienceLevel || "fresher"}</span>
                        <span className="project-tag">{job.type || "role"}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-state-modern">
                  No live job postings yet. Publish a role from the recruiter workspace to populate
                  this section.
                </p>
              )}
            </section>

            <section className="portfolio-card accent-card">
              <div className="card-head">
                <div>
                  <p className="card-eyebrow">
                    <Users size={14} /> Candidates
                  </p>
                  <h3>Recent Applicants</h3>
                </div>
                <span className="card-meta">{applications.length} total</span>
              </div>

              {applications.length > 0 ? (
                <div className="project-grid-modern">
                  {applications.slice(0, 6).map((application) => (
                    <article className="project-card-modern" key={application._id}>
                      <div className="project-card-header">
                        <div>
                          <h4>{application.student?.name || "Student"}</h4>
                          <p>{application.job?.title || "Role unavailable"}</p>
                        </div>
                        <span className="project-chip">{application.status || "applied"}</span>
                      </div>
                      <p>
                        {application.student?.college || "College not added"}
                        {application.student?.degree ? ` • ${application.student.degree}` : ""}
                      </p>
                      <div className="tag-row-modern">
                        <span className="project-tag">{formatDate(application.createdAt)}</span>
                        <span className="project-tag">
                          {application.student?.skills?.slice(0, 2).join(", ") || "No skills yet"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-state-modern">
                  Students who apply to your live jobs will appear here automatically.
                </p>
              )}
            </section>
          </div>

          <aside className="profile-side-column">
            <section className="portfolio-card compact-card">
              <div className="card-head">
                <div>
                  <p className="card-eyebrow">
                    <Building2 size={14} /> Visibility
                  </p>
                  <h3>Profile Links</h3>
                </div>
              </div>

              <div className="link-list-modern">
                <div className="link-card-modern">
                  <span className="link-card-icon">
                    <Mail size={16} />
                  </span>
                  <span>{profile.email || "Add a contact email"}</span>
                </div>
                <div className="link-card-modern">
                  <span className="link-card-icon">
                    <MapPin size={16} />
                  </span>
                  <span>{profile.location || "Add a company location"}</span>
                </div>
                {profile.website ? (
                  <a
                    className="link-card-modern"
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="link-card-icon">
                      <Globe2 size={16} />
                    </span>
                    <span>{profile.website}</span>
                  </a>
                ) : (
                  <div className="link-card-modern">
                    <span className="link-card-icon">
                      <Globe2 size={16} />
                    </span>
                    <span>Add a website</span>
                  </div>
                )}
              </div>
            </section>

            <section className="portfolio-card compact-card">
              <div className="card-head">
                <div>
                  <p className="card-eyebrow">
                    <BriefcaseBusiness size={14} /> Skill Demand
                  </p>
                  <h3>Top Hiring Skills</h3>
                </div>
              </div>

              {topSkills.length > 0 ? (
                <div className="strength-list">
                  {topSkills.map(([skill, count]) => (
                    <div className="strength-row" key={skill}>
                      <span>{skill}</span>
                      <strong>{count} roles</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state-modern">
                  Skill demand will appear after you publish jobs with required skills.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </RecruiterLayout>
  );
}

export default CompanyProfile;
