import { useDeferredValue, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/jobs.css";
import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CircleAlert,
  Clock3,
  Filter,
  MapPin,
  RefreshCw,
  ScanText,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { buildLearningPriorities, getCompanyInitials } from "../../utils/jobInsights";

const INITIAL_FILTERS = {
  search: "",
  location: "",
  skills: "",
  experience: "",
  source: "all",
  bookmarkedOnly: false,
};

const SOURCE_OPTIONS = [
  { label: "All Sources", value: "all" },
  { label: "Company", value: "company" },
  { label: "Adzuna", value: "adzuna" },
  { label: "RapidAPI", value: "rapidapi" },
  { label: "Naukri Redirects", value: "naukri" },
  { label: "Manual", value: "manual" },
];

const getMatchTone = (matchScore) => {
  if (matchScore >= 80) {
    return {
      chip: "job-card--great",
      badge: "Great match",
    };
  }

  if (matchScore >= 60) {
    return {
      chip: "job-card--good",
      badge: "Good match",
    };
  }

  return {
    chip: "job-card--gap",
    badge: "Skill gap",
  };
};

const formatSource = (value = "") => {
  switch (value) {
    case "adzuna":
      return "Adzuna";
    case "rapidapi":
      return "RapidAPI";
    case "company":
      return "Company Careers";
    case "manual":
      return "Manual Entry";
    case "naukri":
      return "Naukri Redirect";
    default:
      return value ? value[0].toUpperCase() + value.slice(1) : "External Source";
  }
};

const formatPostedDate = (value) => {
  if (!value) {
    return "Recently posted";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatJobType = (value = "") => {
  switch (value) {
    case "fulltime":
      return "Full Time";
    case "parttime":
      return "Part Time";
    case "internship":
      return "Internship";
    case "contract":
      return "Contract";
    default:
      return value || "Not specified";
  }
};

const getDescriptionPreview = (value = "", maxLength = 220) => {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "No job description shared yet.";
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trim()}...`;
};

const getDescriptionParagraphs = (value = "") =>
  String(value || "")
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

function Jobs() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [jobs, setJobs] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [summary, setSummary] = useState({
    totalJobs: 0,
    averageMatch: 0,
    bookmarkedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [error, setError] = useState("");
  const [bookmarkingJobId, setBookmarkingJobId] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [extractingSkills, setExtractingSkills] = useState(false);
  const [savingExtractedSkills, setSavingExtractedSkills] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [resumeSuccess, setResumeSuccess] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const deferredSearch = useDeferredValue(filters.search);
  const deferredLocation = useDeferredValue(filters.location);
  const deferredSkills = useDeferredValue(filters.skills);
  const deferredExperience = useDeferredValue(filters.experience);

  useEffect(() => {
    let ignore = false;

    const loadRecommendedJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/jobs/recommended", {
          params: {
            limit: 60,
            search: deferredSearch || undefined,
            location: deferredLocation || undefined,
            skills: deferredSkills || undefined,
            experience: deferredExperience || undefined,
            source: filters.source !== "all" ? filters.source : undefined,
            bookmarked: filters.bookmarkedOnly || undefined,
          },
        });

        if (ignore) {
          return;
        }

        setJobs(Array.isArray(response.data?.data?.jobs) ? response.data.data.jobs : []);
        setUserSkills(
          Array.isArray(response.data?.data?.userSkills) ? response.data.data.userSkills : []
        );
        setSummary(
          response.data?.data?.summary || {
            totalJobs: 0,
            averageMatch: 0,
            bookmarkedCount: 0,
          }
        );
      } catch (requestError) {
        if (!ignore) {
          setJobs([]);
          setError(requestError.response?.data?.message || "Unable to load recommended jobs.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadRecommendedJobs();

    return () => {
      ignore = true;
    };
  }, [
    deferredExperience,
    deferredLocation,
    deferredSearch,
    deferredSkills,
    filters.bookmarkedOnly,
    filters.source,
    refreshTick,
  ]);

  useEffect(() => {
    setSelectedJob((current) => {
      if (!current) {
        return null;
      }

      return jobs.find((job) => job._id === current._id) || null;
    });
  }, [jobs]);

  useEffect(() => {
    if (!selectedJob) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedJob(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedJob]);

  const learningPriorities = useMemo(() => buildLearningPriorities(jobs), [jobs]);
  const topJob = jobs[0] || null;
  const companiesCount = new Set(jobs.map((job) => job.company).filter(Boolean)).size;
  const bookmarkedInView = jobs.filter((job) => job.bookmarked).length;

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleRefresh = () => {
    setRefreshTick((current) => current + 1);
  };

  const openJobDetails = (job) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  const handleBookmarkToggle = async (job) => {
    const nextBookmarkedValue = !job.bookmarked;

    setBookmarkingJobId(job._id);
    setError("");
    setJobs((current) =>
      current.map((currentJob) =>
        currentJob._id === job._id
          ? { ...currentJob, bookmarked: nextBookmarkedValue }
          : currentJob
      )
    );
    setSelectedJob((current) =>
      current?._id === job._id ? { ...current, bookmarked: nextBookmarkedValue } : current
    );

    try {
      if (job.bookmarked) {
        await api.delete(`/jobs/${job._id}/bookmark`);
      } else {
        await api.post(`/jobs/${job._id}/bookmark`);
      }

      setSummary((current) => ({
        ...current,
        bookmarkedCount: Math.max(0, current.bookmarkedCount + (job.bookmarked ? -1 : 1)),
      }));

      if (filters.bookmarkedOnly && job.bookmarked) {
        handleRefresh();
      }
    } catch (requestError) {
      setJobs((current) =>
        current.map((currentJob) =>
          currentJob._id === job._id
            ? { ...currentJob, bookmarked: job.bookmarked }
            : currentJob
        )
      );
      setSelectedJob((current) =>
        current?._id === job._id ? { ...current, bookmarked: job.bookmarked } : current
      );
      setError(requestError.response?.data?.message || "Unable to update bookmark.");
    } finally {
      setBookmarkingJobId("");
    }
  };

  const handleExtractSkills = async (saveToProfile = false) => {
    if (!resumeText.trim()) {
      setResumeError("Paste your resume text first so CodeCraft can extract skills.");
      setResumeSuccess("");
      return;
    }

    if (saveToProfile) {
      setSavingExtractedSkills(true);
    } else {
      setExtractingSkills(true);
    }

    setResumeError("");
    setResumeSuccess("");

    try {
      const response = await api.post("/resume", {
        resumeText,
        saveToProfile,
      });

      const detectedSkills = Array.isArray(response.data?.data?.extractedSkills)
        ? response.data.data.extractedSkills
        : [];

      setExtractedSkills(detectedSkills);

      if (Array.isArray(response.data?.data?.savedSkills)) {
        setUserSkills(response.data.data.savedSkills);
      }

      setResumeSuccess(
        saveToProfile
          ? "Extracted skills were saved to your profile and recommendations have been refreshed."
          : `Detected ${detectedSkills.length} resume skill${detectedSkills.length === 1 ? "" : "s"}.`
      );

      if (saveToProfile) {
        handleRefresh();
      }
    } catch (requestError) {
      setResumeError(
        requestError.response?.data?.message || "Unable to extract skills from the pasted resume."
      );
    } finally {
      setExtractingSkills(false);
      setSavingExtractedSkills(false);
    }
  };

  return (
    <StudentLayout>
      <div className="sd-container jobs-page">
        <section className="jobs-hero">
          <div className="jobs-hero-copy">
            <span className="eyebrow">CodeCraft Jobs</span>
            <h1>Recommended roles matched to your skills</h1>
            <p>
              CodeCraft stores job metadata only, calculates your skill-fit percentage, and sends you
              to the original job source when you apply.
            </p>
          </div>

          <div className="jobs-hero-actions">
            <button className="ghost-btn" type="button" onClick={handleRefresh}>
              <RefreshCw size={16} />
              Refresh feed
            </button>
            <label className="bookmark-toggle">
              <input
                type="checkbox"
                checked={filters.bookmarkedOnly}
                onChange={(event) => handleFilterChange("bookmarkedOnly", event.target.checked)}
              />
              Show bookmarked only
            </label>
          </div>
        </section>

        <section className="jobs-summary-strip">
          <div className="summary-card">
            <span className="summary-label">Tracked Skills</span>
            <strong>{userSkills.length}</strong>
            <p>{userSkills.length ? "Used for recommendation scoring" : "Add skills for better matching"}</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Average Match</span>
            <strong>{summary.averageMatch || 0}%</strong>
            <p>Across the current filtered recommendation feed</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Best Opportunity</span>
            <strong>{topJob ? `${topJob.matchScore}%` : "0%"}</strong>
            <p>{topJob ? topJob.title : "No jobs available"}</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Bookmarked</span>
            <strong>{filters.bookmarkedOnly ? bookmarkedInView : summary.bookmarkedCount || 0}</strong>
            <p>Saved for later review</p>
          </div>
        </section>

        <section className="jobs-filter-panel">
          <div className="filter-header">
            <h2>
              <Filter size={18} />
              Refine recommendations
            </h2>
            <p>Filter by skill, city, experience band, or source without losing the match ranking.</p>
          </div>

          <div className="jobs-filter-grid">
            <label className="filter-field filter-field--wide">
              <span>Search</span>
              <div className="filter-input">
                <Search size={16} />
                <input
                  placeholder="Frontend, React, Bengaluru, API..."
                  value={filters.search}
                  onChange={(event) => handleFilterChange("search", event.target.value)}
                />
              </div>
            </label>

            <label className="filter-field">
              <span>Location</span>
              <div className="filter-input">
                <MapPin size={16} />
                <input
                  placeholder="Bengaluru"
                  value={filters.location}
                  onChange={(event) => handleFilterChange("location", event.target.value)}
                />
              </div>
            </label>

            <label className="filter-field">
              <span>Skills</span>
              <div className="filter-input">
                <Sparkles size={16} />
                <input
                  placeholder="React, Node.js"
                  value={filters.skills}
                  onChange={(event) => handleFilterChange("skills", event.target.value)}
                />
              </div>
            </label>

            <label className="filter-field">
              <span>Experience</span>
              <div className="filter-input">
                <BriefcaseBusiness size={16} />
                <input
                  placeholder="0-2 years"
                  value={filters.experience}
                  onChange={(event) => handleFilterChange("experience", event.target.value)}
                />
              </div>
            </label>

            <label className="filter-field">
              <span>Source</span>
              <select
                value={filters.source}
                onChange={(event) => handleFilterChange("source", event.target.value)}
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {error && <div className="jobs-banner jobs-banner--error">{error}</div>}
        {!userSkills.length && !loading && (
          <div className="jobs-banner">
            Add skills to your profile or paste your resume below to unlock stronger recommendation scores.
          </div>
        )}

        <div className="jobs-grid">
          <div className="jobs-list">
            {loading ? (
              <div className="job-card job-card--loading">Loading recommended jobs...</div>
            ) : jobs.length ? (
              jobs.map((job) => {
                const tone = getMatchTone(job.matchScore);
                const companyInitials = getCompanyInitials(job.company);

                return (
                  <article key={job._id} className={`job-card ${tone.chip}`}>
                    <div className="job-card-top">
                      <div className="job-card-brand">
                        <div className="job-logo-fallback">{companyInitials}</div>
                        <div>
                          <div className="job-title-row">
                            <h3>
                              <button
                                type="button"
                                className="job-title-trigger"
                                onClick={() => openJobDetails(job)}
                              >
                                {job.title}
                              </button>
                            </h3>
                            <span className="job-source-chip">{formatSource(job.source)}</span>
                          </div>
                          <p className="company-name">
                            <Building2 size={13} />
                            {job.company}
                          </p>
                        </div>
                      </div>

                      <div className="job-match-widget">
                        <strong>{job.matchScore}%</strong>
                        <span>You are a {tone.badge.toLowerCase()}</span>
                      </div>
                    </div>

                    <div className="match-bar-container">
                      <div className="match-bar" style={{ width: `${job.matchScore}%` }} />
                    </div>

                    <div className="job-meta-compact">
                      <span>
                        <MapPin size={13} />
                        {job.location}
                      </span>
                      <span>
                        <BriefcaseBusiness size={13} />
                        {job.experience || "Not specified"}
                      </span>
                      <span>
                        <Clock3 size={13} />
                        Posted {formatPostedDate(job.createdAt)}
                      </span>
                    </div>

                    <p className="job-description">{getDescriptionPreview(job.description)}</p>

                    <div className="skills-section">
                      <div className="skills-subsection">
                        <h4 className="skills-label">
                          <BookOpen size={14} />
                          Required skills for this role
                        </h4>
                        <div className="skills-pills">
                          {job.skills.length ? (
                            job.skills.map((skill) => (
                              <span key={skill} className="skill-pill required-pill">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="empty-inline-note">
                              The job source did not list explicit skills for this role.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="skills-subsection">
                        <h4 className="skills-label">
                          <Target size={14} />
                          Skills you already have
                        </h4>
                        <div className="skills-pills">
                          {job.matchedSkills.length ? (
                            job.matchedSkills.map((skill) => (
                              <span key={skill} className="skill-pill matched-pill">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="empty-inline-note">
                              No exact skill overlaps yet from your saved profile.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="skills-subsection">
                        <h4 className="skills-label">
                          <CircleAlert size={14} />
                          Skills you need to improve
                        </h4>
                        <div className="skills-pills">
                          {job.missingSkills.length ? (
                            job.missingSkills.map((skill) => (
                              <span key={skill} className="skill-pill missing-pill">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="empty-inline-note">You already cover the listed core skills.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="job-card-footer">
                      <div className="job-card-actions">
                        <button
                          type="button"
                          className="bookmark-btn"
                          disabled={bookmarkingJobId === job._id}
                          onClick={() => handleBookmarkToggle(job)}
                        >
                          {job.bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                          {job.bookmarked ? "Bookmarked" : "Bookmark"}
                        </button>

                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => openJobDetails(job)}
                        >
                          <BookOpen size={16} />
                          Read JD
                        </button>
                      </div>

                      <a
                        className="apply-btn"
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply Externally
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="job-card job-card--loading">
                No jobs matched your current filters. Try widening the search or source filters.
              </div>
            )}
          </div>

          <aside className="jobs-sidebar">
            <div className="sidebar-card">
              <h3>
                <Sparkles size={18} />
                Skill profile
              </h3>
              <div className="sidebar-metrics">
                <div className="sidebar-metric">
                  <span>Visible jobs</span>
                  <strong>{summary.totalJobs || jobs.length}</strong>
                </div>
                <div className="sidebar-metric">
                  <span>Companies</span>
                  <strong>{companiesCount}</strong>
                </div>
              </div>

              <div className="skills-pills">
                {userSkills.length ? (
                  userSkills.map((skill) => (
                    <span key={skill} className="skill-pill matched-pill">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="sidebar-copy">Your saved skill profile is empty right now.</p>
                )}
              </div>
            </div>

            <div className="sidebar-card">
              <h3>
                <Target size={18} />
                Learning priorities
              </h3>
              {learningPriorities.length ? (
                <div className="priority-list">
                  {learningPriorities.map((item) => (
                    <div className="priority-card" key={item.skill}>
                      <div>
                        <strong>{item.skill}</strong>
                        <p>Missing in {item.count} recommended role{item.count > 1 ? "s" : ""}</p>
                      </div>
                      <div className="priority-links">
                        <a href={item.resource.videoUrl} target="_blank" rel="noreferrer">
                          Learn
                        </a>
                        <a href={item.resource.docsUrl} target="_blank" rel="noopener noreferrer">
                          Docs
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sidebar-copy">
                  Once jobs have missing skills, CodeCraft will highlight the strongest skill gaps here.
                </p>
              )}
            </div>

            <div className="sidebar-card">
              <h3>
                <ScanText size={18} />
                Resume skill extraction
              </h3>
              <p className="sidebar-copy">
                Paste resume text to extract keywords and optionally save them into your profile for better recommendations.
              </p>

              <textarea
                className="resume-textarea"
                placeholder="Paste your resume summary, project bullets, and skill sections here..."
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
              />

              <div className="resume-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  disabled={extractingSkills}
                  onClick={() => handleExtractSkills(false)}
                >
                  {extractingSkills ? "Extracting..." : "Extract skills"}
                </button>
                <button
                  type="button"
                  className="apply-btn apply-btn--compact"
                  disabled={savingExtractedSkills}
                  onClick={() => handleExtractSkills(true)}
                >
                  {savingExtractedSkills ? "Saving..." : "Save to profile"}
                </button>
              </div>

              {resumeError && <div className="inline-banner inline-banner--error">{resumeError}</div>}
              {resumeSuccess && <div className="inline-banner">{resumeSuccess}</div>}

              {extractedSkills.length > 0 && (
                <div className="skills-pills">
                  {extractedSkills.map((skill) => (
                    <span key={skill} className="skill-pill matched-pill">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="sidebar-card sidebar-card--compliance">
              <h3>
                <CircleAlert size={18} />
                Compliance note
              </h3>
              <p className="sidebar-copy">
                CodeCraft Jobs does not host applications and does not scrape restricted platforms. It stores metadata and redirects you to the original source.
              </p>
            </div>
          </aside>
        </div>

        {selectedJob && (
          <div className="job-modal-overlay" onClick={closeJobDetails}>
            <div
              className="job-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="job-detail-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="job-modal-header">
                <div className="job-modal-copy">
                  <span className="job-source-chip">{formatSource(selectedJob.source)}</span>
                  <h2 id="job-detail-title">{selectedJob.title}</h2>
                  <p className="company-name">
                    <Building2 size={14} />
                    {selectedJob.company}
                  </p>
                </div>

                <button
                  type="button"
                  className="job-modal-close"
                  onClick={closeJobDetails}
                  aria-label="Close job details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="job-modal-meta">
                <span>
                  <MapPin size={13} />
                  {selectedJob.location}
                </span>
                <span>
                  <BriefcaseBusiness size={13} />
                  {formatJobType(selectedJob.type)}
                </span>
                <span>
                  <Target size={13} />
                  {selectedJob.matchScore}% match
                </span>
                <span>
                  <Clock3 size={13} />
                  Posted {formatPostedDate(selectedJob.createdAt)}
                </span>
              </div>

              <div className="job-modal-panels">
                <section className="job-modal-panel">
                  <h3>Required skills</h3>
                  <div className="skills-pills">
                    {selectedJob.skills.length ? (
                      selectedJob.skills.map((skill) => (
                        <span key={skill} className="skill-pill required-pill">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="empty-inline-note">No explicit required skills were provided.</p>
                    )}
                  </div>
                </section>

                <section className="job-modal-panel">
                  <h3>Your saved profile skills</h3>
                  <div className="skills-pills">
                    {userSkills.length ? (
                      userSkills.map((skill) => (
                        <span key={skill} className="skill-pill profile-pill">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="empty-inline-note">
                        Add skills to your profile to compare them against this role.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <div className="job-modal-panels">
                <section className="job-modal-panel">
                  <h3>Skills you already match</h3>
                  <div className="skills-pills">
                    {selectedJob.matchedSkills.length ? (
                      selectedJob.matchedSkills.map((skill) => (
                        <span key={skill} className="skill-pill matched-pill">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="empty-inline-note">
                        No saved profile skills overlap with this job yet.
                      </p>
                    )}
                  </div>
                </section>

                <section className="job-modal-panel">
                  <h3>Skills to improve</h3>
                  <div className="skills-pills">
                    {selectedJob.missingSkills.length ? (
                      selectedJob.missingSkills.map((skill) => (
                        <span key={skill} className="skill-pill missing-pill">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="empty-inline-note">
                        You already cover the listed core skills for this role.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <section className="job-modal-panel">
                <h3>Job description</h3>
                <div className="job-description-detail">
                  {getDescriptionParagraphs(selectedJob.description).length ? (
                    getDescriptionParagraphs(selectedJob.description).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))
                  ) : (
                    <p>No detailed job description was provided for this role.</p>
                  )}
                </div>
              </section>

              <section className="job-modal-panel">
                <h3>Role requirements</h3>
                {selectedJob.requirements?.length ? (
                  <ul className="job-detail-list">
                    {selectedJob.requirements.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-inline-note">
                    The source did not include a separate requirement list for this job.
                  </p>
                )}
              </section>

              <div className="job-modal-actions">
                <button
                  type="button"
                  className="bookmark-btn"
                  disabled={bookmarkingJobId === selectedJob._id}
                  onClick={() => handleBookmarkToggle(selectedJob)}
                >
                  {selectedJob.bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {selectedJob.bookmarked ? "Bookmarked" : "Bookmark"}
                </button>

                <a
                  className="apply-btn"
                  href={selectedJob.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Externally
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default Jobs;
