import { useEffect, useState } from "react";
import api from "../../api/axios";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import "../../styles/recruiter.css";

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
      return value || "Not set";
  }
};

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      try {
        const response = await api.get("/jobs/mine");

        if (isMounted) {
          setJobs(Array.isArray(response.data?.data?.jobs) ? response.data.data.jobs : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load recruiter jobs");
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

  return (
    <RecruiterLayout>
      <div className="page-intro">
        <h1>My Jobs</h1>
        <p>Review the external jobs you have published into CodeCraft Jobs.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="table jobs-table-wide">
        <div className="table-head">
          <span>Job Title</span>
          <span>Source</span>
          <span>Type</span>
          <span>Experience</span>
          <span>Apply Link</span>
          <span>Status</span>
          <span>Posted</span>
        </div>

        {loading ? (
          <div className="table-row table-row-empty">
            <span>Loading your jobs...</span>
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div className="table-row" key={job._id}>
              <span>
                <strong>{job.title}</strong>
                <small>{job.company}</small>
              </span>
              <span>{job.source || "manual"}</span>
              <span>{formatJobType(job.type)}</span>
              <span>{job.experience || job.experienceLevel || "fresher"}</span>
              <span>
                {job.applyUrl ? (
                  <a href={job.applyUrl} target="_blank" rel="noreferrer">
                    External link
                  </a>
                ) : (
                  "Missing"
                )}
              </span>
              <span className={job.status === "active" ? "open" : "closed"}>{job.status}</span>
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        ) : (
          <div className="table-row table-row-empty">
            <span>No jobs posted yet. Use Post Job to create one.</span>
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
};

export default MyJobs;
