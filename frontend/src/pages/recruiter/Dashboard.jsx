import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import RecruiterLayout from "../../layouts/RecruiterLayout";

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          api.get("/jobs/mine"),
          api.get("/applications/recruiter"),
        ]);

        if (isMounted) {
          setJobs(Array.isArray(jobsResponse.data?.data?.jobs) ? jobsResponse.data.data.jobs : []);
          setApplications(
            Array.isArray(applicationsResponse.data?.data?.applications)
              ? applicationsResponse.data.data.applications
              : []
          );
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load recruiter dashboard data.");
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

  const activeJobs = useMemo(
    () => jobs.filter((job) => String(job.status || "").toLowerCase() === "active").length,
    [jobs]
  );

  const uniqueSkills = useMemo(() => {
    const allSkills = jobs.flatMap((job) => (Array.isArray(job.skills) ? job.skills : []));
    return new Set(allSkills.map((skill) => skill.toLowerCase())).size;
  }, [jobs]);
  const shortlistedApplications = useMemo(
    () => applications.filter((application) => application.status === "shortlisted").length,
    [applications]
  );

  return (
    <RecruiterLayout>
      <div className="page-intro">
        <h1>Recruiter Dashboard</h1>
        <p>Recruiters only see job posting, applicant review, and company profile tools in this workspace.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Total Jobs</h4>
          <b>{loading ? "..." : jobs.length}</b>
        </div>
        <div className="stat-card">
          <h4>Active Jobs</h4>
          <b>{loading ? "..." : activeJobs}</b>
        </div>
        <div className="stat-card">
          <h4>Skills Tracked</h4>
          <b>{loading ? "..." : uniqueSkills}</b>
        </div>
        <div className="stat-card">
          <h4>Shortlisted</h4>
          <b>{loading ? "..." : shortlistedApplications}</b>
        </div>
      </div>

      <div className="dashboard-action-grid">
        <Link className="dashboard-action-card" to="/recruiter/post-job">
          <strong>Post Job</strong>
          <p>Create a new role for students to discover.</p>
        </Link>
        <Link className="dashboard-action-card" to="/recruiter/jobs">
          <strong>Manage Jobs</strong>
          <p>Review the jobs you already published.</p>
        </Link>
        <Link className="dashboard-action-card" to="/recruiter/applicants">
          <strong>Review Applicants</strong>
          <p>Check shortlisted and pending applicants.</p>
        </Link>
        <Link className="dashboard-action-card" to="/recruiter/company">
          <strong>Company Profile</strong>
          <p>Keep your recruiter presence updated.</p>
        </Link>
      </div>
    </RecruiterLayout>
  );
};

export default RecruiterDashboard;
