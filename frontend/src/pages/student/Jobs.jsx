import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/jobs.css";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  BookOpen,
  BriefcaseBusiness,
  ArrowUpRight,
} from "lucide-react";
import {
  extractPortfolioSkills,
  mergeSkills,
  buildMatchedJobs,
  buildLearningPriorities,
  getCompanyInitials,
} from "../../utils/jobInsights";
import { syncStudentProfileCache } from "../../utils/studentProfileSync";

const getMatchTone = (matchPercentage) => {
  if (matchPercentage >= 80) {
    return {
      background: "rgba(34, 197, 94, 0.15)",
      progress: "linear-gradient(90deg, #22c55e, #16a34a)",
      text: "#86efac",
      label: "Strong fit",
    };
  }

  if (matchPercentage >= 60) {
    return {
      background: "rgba(59, 130, 246, 0.15)",
      progress: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
      text: "#93c5fd",
      label: "Good fit",
    };
  }

  return {
    background: "rgba(245, 158, 11, 0.15)",
    progress: "linear-gradient(90deg, #f59e0b, #d97706)",
    text: "#fcd34d",
    label: "Gap to close",
  };
};

function Jobs() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [portfolioSkills, setPortfolioSkills] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingJobId, setSubmittingJobId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setLoading(true);
      setError("");

      const localSkills = extractPortfolioSkills();
      let mergedSkills = localSkills;

      try {
        const profileResponse = await api.get("/student-profiles/me");
        const studentProfile = profileResponse.data?.data?.studentProfile;
        const backendSkills = Array.isArray(studentProfile?.skills)
          ? studentProfile.skills
          : [];
        mergedSkills = mergeSkills(localSkills, backendSkills);
        syncStudentProfileCache(studentProfile);
      } catch {
        mergedSkills = mergeSkills(localSkills);
      }

      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          api.get("/jobs", {
            params: { limit: 50 },
          }),
          api.get("/applications/my").catch(() => ({ data: { data: { applications: [] } } })),
        ]);

        const fetchedJobs = Array.isArray(jobsResponse.data?.data?.jobs)
          ? jobsResponse.data.data.jobs
          : [];
        const myApplications = Array.isArray(applicationsResponse.data?.data?.applications)
          ? applicationsResponse.data.data.applications
          : [];

        if (isMounted) {
          setPortfolioSkills(mergedSkills);
          setJobs(buildMatchedJobs(fetchedJobs, mergedSkills));
          setApplications(myApplications);
        }
      } catch {
        if (isMounted) {
          setPortfolioSkills(mergedSkills);
          setJobs([]);
          setError("Unable to load live jobs right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const haystack = [
          job.title,
          job.company,
          job.location,
          ...(job.displaySkills || []),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(search.toLowerCase());
      }),
    [jobs, search]
  );

  const matchedJobsCount = filteredJobs.filter((job) => job.matchPercentage > 0).length;
  const topJob = filteredJobs[0] || null;
  const averageMatch = filteredJobs.length
    ? Math.round(
        filteredJobs.reduce((total, job) => total + job.matchPercentage, 0) / filteredJobs.length
      )
    : 0;
  const learningPriorities = buildLearningPriorities(filteredJobs);
  const appliedCount = applications.length;
  const shortlistedCount = applications.filter((application) => application.status === "shortlisted").length;
  const companiesHiring = new Set(filteredJobs.map((job) => job.company).filter(Boolean)).size;
  const remoteOpenings = filteredJobs.filter((job) => job.remote).length;
  const typeBreakdown = filteredJobs.reduce((accumulator, job) => {
    const key = job.type || "other";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  const liveRoleMix = Object.entries(typeBreakdown)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
  const applicationsByJobId = useMemo(
    () =>
      applications.reduce((accumulator, application) => {
        if (application.job?._id) {
          accumulator[application.job._id] = application;
        }
        return accumulator;
      }, {}),
    [applications]
  );

  const applyToJob = async (jobId) => {
    setSubmittingJobId(jobId);
    setError("");

    try {
      const response = await api.post("/applications", { jobId });
      const nextApplication = response.data?.data?.application;

      if (nextApplication) {
        setApplications((current) => [nextApplication, ...current]);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit application.");
    } finally {
      setSubmittingJobId("");
    }
  };

  return (
    <StudentLayout>
      <div className="sd-container">
        <div className="sd-header">
          <div>
            <h1>Jobs</h1>
            <p>Jobs ranked against the skills in your portfolio and live openings published by recruiters.</p>
          </div>
        </div>

        <div className="jobs-summary-strip">
          <div className="summary-card">
            <span className="summary-label">Portfolio Skills</span>
            <strong>{portfolioSkills.length}</strong>
            <p>{portfolioSkills.length ? "Using your saved profile skills" : "Add skills in Profile for better matching"}</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Matched Jobs</span>
            <strong>
              {matchedJobsCount}/{filteredJobs.length || jobs.length || 0}
            </strong>
            <p>Jobs with at least one skill overlap</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Average Match</span>
            <strong>{averageMatch}%</strong>
            <p>Across the current filtered results</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Best Opportunity</span>
            <strong>{topJob ? `${topJob.matchPercentage}%` : "0%"}</strong>
            <p>{topJob ? topJob.title : "No jobs found"}</p>
          </div>
        </div>

        {portfolioSkills.length > 0 && (
          <div className="portfolio-skills-panel">
            <div className="portfolio-panel-head">
              <h3>Your Portfolio Skills</h3>
              <span>{portfolioSkills.length} tracked</span>
            </div>
            <div className="skills-pills">
              {portfolioSkills.map((skill) => (
                <span key={skill} className="skill-pill matched-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="jobs-search">
          <Search size={16} />
          <input
            placeholder="Search jobs, companies, locations, or skills..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error && <div className="jobs-banner">{error}</div>}

        <div className="jobs-grid">
          <div className="jobs-list">
            {loading ? (
              <div className="job-card loading-card">Loading jobs and matching them to your portfolio...</div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const tone = getMatchTone(job.matchPercentage);
                const companyInitials = getCompanyInitials(job.company);
                const application = applicationsByJobId[job._id];

                return (
                  <div key={job._id || job.id} className="job-card">
                    <div className="job-header">
                      <div className="job-logo-title">
                        <div className="job-logo-fallback">{companyInitials}</div>
                        <div>
                          <h3 className="job-title">{job.title}</h3>
                          <p className="company-name">
                            <Building2 size={12} /> {job.company}
                          </p>
                          <p className="job-fit-caption">{tone.label}: matched {job.matchedSkills.length} of {job.displaySkills.length || 0} core skills</p>
                        </div>
                      </div>
                      <div className="match-badge" style={{ background: tone.background }}>
                        <div className="match-circle">
                          <span className="match-percentage">{job.matchPercentage}</span>
                          <span className="match-text">%</span>
                        </div>
                        <span className="match-label">Match</span>
                      </div>
                    </div>

                    <div className="match-bar-container">
                      <div
                        className="match-bar"
                        style={{
                          width: `${job.matchPercentage}%`,
                          background: tone.progress,
                        }}
                      />
                    </div>

                    <div className="job-meta-compact">
                      <span>
                        <MapPin size={13} /> {job.remoteLabel}
                      </span>
                      <span>
                        <Clock size={13} /> {job.postedLabel}
                      </span>
                      <span>
                        <DollarSign size={13} /> {job.salaryLabel}
                      </span>
                      <span>
                        <BriefcaseBusiness size={13} /> {job.experienceLevel || "fresher"}
                      </span>
                    </div>

                    <div className="skills-section">
                      <div className="skills-subsection">
                        <h4 className="skills-label">
                          <CheckCircle size={14} /> Your Skills Match
                        </h4>
                        <div className="skills-pills">
                          {job.matchedSkills.length > 0 ? (
                            job.matchedSkills.map((skill) => (
                              <span key={skill} className="skill-pill matched-pill">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="no-skills">No exact matches yet from your portfolio.</p>
                          )}
                        </div>
                      </div>

                      {job.missingSkills.length > 0 && (
                        <div className="skills-subsection">
                          <h4 className="skills-label">
                            <XCircle size={14} /> Skills to Learn
                          </h4>
                          <div className="skills-pills">
                            {job.missingSkills.map((skill) => (
                              <span key={skill} className="skill-pill missing-pill">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {job.learningResources.length > 0 && (
                        <div className="skills-subsection learning-subsection">
                          <h4 className="skills-label">
                            <BookOpen size={14} /> Learning Suggestions
                          </h4>
                          <div className="learning-grid">
                            {job.learningResources.map((resource) => (
                              <div key={resource.skill} className="learning-card">
                                <div>
                                  <span className="learning-skill">{resource.skill}</span>
                                  <p>Recommended because this skill is missing in your profile for this role.</p>
                                </div>
                                <div className="learning-links">
                                  <a href={resource.videoUrl} target="_blank" rel="noreferrer">
                                    {resource.videoLabel}
                                  </a>
                                  <a href={resource.docsUrl} target="_blank" rel="noreferrer">
                                    {resource.docsLabel}
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="job-action-group">
                      {application ? (
                        <div className={`application-state ${application.status}`}>
                          Applied: {application.status}
                        </div>
                      ) : (
                        <button
                          className="apply-btn"
                          disabled={submittingJobId === job._id}
                          onClick={() => applyToJob(job._id)}
                        >
                          <Zap size={16} />{" "}
                          {submittingJobId === job._id ? "Applying..." : "Apply on CodeCraft"}
                        </button>
                      )}

                      {job.applyUrl && (
                        <a
                          className="secondary-link-btn"
                          href={job.applyUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Job Link <ArrowUpRight size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="job-card loading-card">No jobs matched your current search.</div>
            )}
          </div>

          <div className="jobs-sidebar">
            <div className="sidebar-card">
              <h3>
                <BriefcaseBusiness size={18} /> Portfolio Fit
              </h3>
              <div className="sidebar-metrics">
                <div className="sidebar-metric">
                  <span>Best match</span>
                  <strong>{topJob ? `${topJob.matchPercentage}%` : "0%"}</strong>
                </div>
                <div className="sidebar-metric">
                  <span>Match-ready jobs</span>
                  <strong>{matchedJobsCount}</strong>
                </div>
              </div>

              {learningPriorities.length > 0 ? (
                <div className="priority-list">
                  {learningPriorities.map((item) => (
                    <div key={item.skill} className="priority-card">
                      <div>
                        <strong>{item.skill}</strong>
                        <p>Missing in {item.count} job{item.count > 1 ? "s" : ""}</p>
                      </div>
                      <div className="priority-links">
                        <a href={item.resource.videoUrl} target="_blank" rel="noreferrer">
                          YouTube
                        </a>
                        <a href={item.resource.docsUrl} target="_blank" rel="noreferrer">
                          Docs
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sidebar-copy">Add more skills in your portfolio to see personalized learning priorities.</p>
              )}
            </div>

            <div className="sidebar-card">
              <h3>
                <TrendingUp size={18} /> Live Hiring Snapshot
              </h3>
              <div className="sidebar-metrics">
                <div className="sidebar-metric">
                  <span>Companies Hiring</span>
                  <strong>{companiesHiring}</strong>
                </div>
                <div className="sidebar-metric">
                  <span>Remote Openings</span>
                  <strong>{remoteOpenings}</strong>
                </div>
                <div className="sidebar-metric">
                  <span>Applications</span>
                  <strong>{appliedCount}</strong>
                </div>
                <div className="sidebar-metric">
                  <span>Shortlisted</span>
                  <strong>{shortlistedCount}</strong>
                </div>
              </div>
              {liveRoleMix.length > 0 ? (
                <div className="trend-grid">
                  {liveRoleMix.map(([type, count]) => (
                    <div key={type} className="trend-card">
                      <div className="trend-card-header">
                        <strong>{type}</strong>
                        <span>{count}</span>
                      </div>
                      <p className="trend-why">Open roles currently visible in your filtered live job feed.</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sidebar-copy">No live jobs are available right now, so there is no role mix to summarize.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default Jobs;
