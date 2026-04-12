import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Edit2,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Trophy,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import api from "../../api/axios";
import OrganizerLayout from "../../layouts/OrganizerLayout";
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
  organizationName: "",
  organizationType: "",
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
    return "Upcoming";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Upcoming"
    : parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

function OrganizerProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [form, setForm] = useState(emptyProfile);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
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

      const [profileResult, eventsResult, registrationsResult] = await Promise.allSettled([
        api.get("/auth/me"),
        api.get("/events/manage/mine"),
        api.get("/registrations/organizer"),
      ]);

      if (!isMounted) {
        return;
      }

      if (profileResult.status !== "fulfilled") {
        setError(
          profileResult.reason?.response?.data?.message || "Unable to load organizer profile."
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
      setEvents(
        eventsResult.status === "fulfilled" && Array.isArray(eventsResult.value.data?.data?.events)
          ? eventsResult.value.data.data.events
          : []
      );
      setRegistrations(
        registrationsResult.status === "fulfilled" &&
          Array.isArray(registrationsResult.value.data?.data?.registrations)
          ? registrationsResult.value.data.data.registrations
          : []
      );

      if (eventsResult.status !== "fulfilled" || registrationsResult.status !== "fulfilled") {
        setError("Some live organizer data could not be loaded right now.");
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
        organizationName: form.organizationName,
        organizationType: form.organizationType,
      });

      const nextProfile = {
        ...emptyProfile,
        ...(response.data?.data?.user || form),
      };

      setProfile(nextProfile);
      setForm(nextProfile);
      syncStoredUser(response.data?.data?.user);
      setEditing(false);
      setSuccess("Organizer profile updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save organizer profile.");
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

  const openEvents = useMemo(
    () => events.filter((event) => String(event.status || "").toLowerCase() === "open").length,
    [events]
  );

  const assignedTeams = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.teamName || (Array.isArray(registration.teamMembers) && registration.teamMembers.length > 0)
      ).length,
    [registrations]
  );

  const upcomingEvents = useMemo(
    () =>
      events
        .slice()
        .sort((left, right) => new Date(left.deadline || 0) - new Date(right.deadline || 0))
        .slice(0, 6),
    [events]
  );

  const recentRegistrations = useMemo(
    () =>
      registrations
        .slice()
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
        .slice(0, 6),
    [registrations]
  );

  const profileTitle =
    profile.organizationName ||
    profile.name ||
    (loading ? "Loading organizer profile" : "Organizer profile");
  const profileSubtitle =
    profile.organizationType || "Add your organization type so students understand your events.";
  const profileBio =
    profile.bio || "This organizer profile shows only live event and registration data from the backend.";
  const avatarFallback = (profile.organizationName || profile.name || "CC")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <OrganizerLayout>
      <div className="profile-shell">
        <div className="profile-topbar">
          <div>
            <p className="profile-eyebrow">Organizer Workspace</p>
            <h1>Organizer Profile</h1>
            <p className="profile-subtitle">
              Event stats, participant counts, and published hackathons on this page come only from
              live backend records.
            </p>
          </div>

          <div className="profile-action-group">
            <Link className="profile-action-btn primary" to="/organizer/create">
              <CalendarDays size={16} /> Create Event
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
                  <label className="avatar-icon-btn" htmlFor="organizer-avatar-input">
                    <Upload size={18} />
                  </label>
                  <input
                    id="organizer-avatar-input"
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
              <p className="profile-status-chip">Live Organizer Profile</p>

              {editing ? (
                <div className="hero-edit-grid">
                  <div className="field-block">
                    <label>Contact Name</label>
                    <input value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
                  </div>
                  <div className="field-block">
                    <label>Organization Name</label>
                    <input
                      value={form.organizationName}
                      onChange={(event) =>
                        handleChange("organizationName", event.target.value)
                      }
                    />
                  </div>
                  <div className="field-block">
                    <label>Organization Type</label>
                    <input
                      value={form.organizationType}
                      onChange={(event) =>
                        handleChange("organizationType", event.target.value)
                      }
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
                    <label>Organization Summary</label>
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
                <CalendarDays size={14} /> Event Pipeline
              </span>
              <div className="completion-value">{loading ? "..." : events.length}</div>
              <p className="completion-copy">
                Published hackathons and participant counts update from the events and registrations
                collections in real time.
              </p>
            </div>

            <div className="profile-side-card">
              <span className="mini-heading">
                <Users size={14} /> Contact
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
                    <Trophy size={14} /> Live Metrics
                  </p>
                  <h3>Organizer Snapshot</h3>
                </div>
                <span className="card-meta">{registrations.length} live registrations</span>
              </div>

              <div className="highlight-stack">
                <div className="highlight-stat-card">
                  <span>Total Events</span>
                  <strong>{loading ? "..." : events.length}</strong>
                </div>
                <div className="highlight-stat-card">
                  <span>Open Events</span>
                  <strong>{loading ? "..." : openEvents}</strong>
                </div>
                <div className="highlight-stat-card">
                  <span>Registrations</span>
                  <strong>{loading ? "..." : registrations.length}</strong>
                </div>
                <div className="highlight-stat-card">
                  <span>Teams Assigned</span>
                  <strong>{loading ? "..." : assignedTeams}</strong>
                </div>
              </div>
            </section>

            <section className="portfolio-card">
              <div className="card-head">
                <div>
                  <p className="card-eyebrow">
                    <CalendarDays size={14} /> Events
                  </p>
                  <h3>Published Hackathons</h3>
                </div>
                <span className="card-meta">{events.length} live events</span>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="project-grid-modern">
                  {upcomingEvents.map((event) => (
                    <article className="project-card-modern" key={event._id}>
                      <div className="project-card-header">
                        <div>
                          <h4>{event.name}</h4>
                          <p>{event.theme || "Theme not added"}</p>
                        </div>
                        <span className="project-chip">{event.status || "draft"}</span>
                      </div>
                      <p>{event.description || "No description provided yet."}</p>
                      <div className="tag-row-modern">
                        <span className="project-tag">{formatDate(event.deadline)}</span>
                        <span className="project-tag">
                          Team limit {event.teamSizeLimit || 1}
                        </span>
                        <span className="project-tag">
                          {event.registrationCount || 0} registrations
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-state-modern">
                  No live events yet. Publish an event from the organizer workspace to populate this
                  section.
                </p>
              )}
            </section>

            <section className="portfolio-card accent-card">
              <div className="card-head">
                <div>
                  <p className="card-eyebrow">
                    <Users size={14} /> Participants
                  </p>
                  <h3>Recent Registrations</h3>
                </div>
                <span className="card-meta">{registrations.length} total</span>
              </div>

              {recentRegistrations.length > 0 ? (
                <div className="project-grid-modern">
                  {recentRegistrations.map((registration) => (
                    <article className="project-card-modern" key={registration._id}>
                      <div className="project-card-header">
                        <div>
                          <h4>{registration.student?.name || "Student"}</h4>
                          <p>{registration.event?.name || "Event unavailable"}</p>
                        </div>
                        <span className="project-chip">{registration.status || "registered"}</span>
                      </div>
                      <p>
                        {registration.student?.college || "College not added"}
                        {registration.student?.degree ? ` • ${registration.student.degree}` : ""}
                      </p>
                      <div className="tag-row-modern">
                        <span className="project-tag">{formatDate(registration.createdAt)}</span>
                        <span className="project-tag">
                          {registration.teamName || "No team assigned"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-state-modern">
                  Students who register for your live events will appear here automatically.
                </p>
              )}
            </section>
          </div>

          <aside className="profile-side-column">
            <section className="portfolio-card compact-card">
              <div className="card-head">
                <div>
                  <p className="card-eyebrow">
                    <Users size={14} /> Visibility
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
                  <span>{profile.location || "Add an organizer location"}</span>
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
                    <CalendarDays size={14} /> Event Status
                  </p>
                  <h3>Registration Health</h3>
                </div>
              </div>

              {events.length > 0 ? (
                <div className="strength-list">
                  {events.slice(0, 6).map((event) => (
                    <div className="strength-row" key={event._id}>
                      <span>{event.name}</span>
                      <strong>{event.registrationCount || 0} regs</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state-modern">
                  Event participation health will appear after you publish hackathons.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </OrganizerLayout>
  );
}

export default OrganizerProfile;
