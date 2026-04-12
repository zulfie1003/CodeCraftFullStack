import { useEffect, useState } from "react";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import api from "../../api/axios";
import "../../styles/recruiter.css";

const INITIAL_FILTERS = {
  search: "",
  skills: "",
  experienceLevel: "",
  status: "",
  jobId: "",
};

const Applicants = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadData = async (nextFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const [applicationsResponse, jobsResponse] = await Promise.all([
        api.get("/applications/recruiter", { params: nextFilters }),
        api.get("/jobs/mine"),
      ]);

      setApplications(
        Array.isArray(applicationsResponse.data?.data?.applications)
          ? applicationsResponse.data.data.applications
          : []
      );
      setJobs(Array.isArray(jobsResponse.data?.data?.jobs) ? jobsResponse.data.data.jobs : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(INITIAL_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (field, value) => {
    const nextFilters = {
      ...filters,
      [field]: value,
    };

    setFilters(nextFilters);
    loadData(nextFilters);
  };

  const updateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setError("");

    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      await loadData(filters);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update application status.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <RecruiterLayout>
      <div className="page-intro">
        <h1>Applicants</h1>
        <p>
          Recruiters can review only the students who applied to their jobs. Student profiles are
          shown here in read-only form from the shared student data layer.
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="filter-grid">
        <input
          placeholder="Search student, college, job, or email"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
        />
        <input
          placeholder="Filter by skill"
          value={filters.skills}
          onChange={(event) => updateFilter("skills", event.target.value)}
        />
        <select
          value={filters.experienceLevel}
          onChange={(event) => updateFilter("experienceLevel", event.target.value)}
        >
          <option value="">All Experience</option>
          <option value="fresher">Fresher</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
        <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
          <option value="">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filters.jobId} onChange={(event) => updateFilter("jobId", event.target.value)}>
          <option value="">All Jobs</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="applicant-card">
          <p>Loading recruiter applications...</p>
        </div>
      ) : applications.length > 0 ? (
        <div className="applicant-list">
          {applications.map((application) => {
            const student = application.student || {};
            const projectCount = Array.isArray(student.projects) ? student.projects.length : 0;

            return (
              <article className="applicant-card" key={application._id}>
                <div className="applicant-card-header">
                  <div>
                    <h3>{student.name}</h3>
                    <p>{student.email}</p>
                    <p>
                      Applied for <strong>{application.job?.title}</strong>
                    </p>
                  </div>
                  <span className={`status ${application.status}`}>{application.status}</span>
                </div>

                <div className="candidate-meta-grid">
                  <span>College: {student.college || "Not added"}</span>
                  <span>Degree: {student.degree || "Not added"}</span>
                  <span>Year: {student.year || "Not added"}</span>
                  <span>Experience: {student.experienceLevel || "fresher"}</span>
                  <span>Projects: {projectCount}</span>
                  <span>Phone: {student.phone || "Not added"}</span>
                </div>

                <div className="skills">
                  {Array.isArray(student.skills) && student.skills.length > 0 ? (
                    student.skills.map((skill) => <span key={`${application._id}-${skill}`}>{skill}</span>)
                  ) : (
                    <span>No skills added</span>
                  )}
                </div>

                <div className="read-only-profile">
                  <p>
                    <strong>GitHub:</strong>{" "}
                    {student.githubUrl ? (
                      <a href={student.githubUrl} target="_blank" rel="noreferrer">
                        {student.githubUrl}
                      </a>
                    ) : (
                      "Not added"
                    )}
                  </p>
                  <p>
                    <strong>Portfolio:</strong>{" "}
                    {student.portfolioUrl ? (
                      <a href={student.portfolioUrl} target="_blank" rel="noreferrer">
                        {student.portfolioUrl}
                      </a>
                    ) : (
                      "Not added"
                    )}
                  </p>
                  <p>
                    <strong>Resume:</strong>{" "}
                    {student.resume?.dataUrl ? (
                      <a href={student.resume.dataUrl} download={student.resume.fileName || "resume"}>
                        {student.resume.fileName || "Download resume"}
                      </a>
                    ) : (
                      "Not uploaded"
                    )}
                  </p>
                </div>

                {projectCount > 0 && (
                  <div className="candidate-project-list">
                    {student.projects.map((project) => (
                      <div className="candidate-project-card" key={project._id || project.title}>
                        <strong>{project.title}</strong>
                        <p>{project.description}</p>
                        {project.link && (
                          <a href={project.link} target="_blank" rel="noreferrer">
                            {project.link}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="actions">
                  <button
                    className="success-btn"
                    onClick={() => updateStatus(application._id, "shortlisted")}
                    disabled={updatingId === application._id}
                  >
                    Shortlist
                  </button>
                  <button
                    className="danger-btn"
                    onClick={() => updateStatus(application._id, "rejected")}
                    disabled={updatingId === application._id}
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="applicant-card">
          <p>No student applications matched your current filters.</p>
        </div>
      )}
    </RecruiterLayout>
  );
};

export default Applicants;
