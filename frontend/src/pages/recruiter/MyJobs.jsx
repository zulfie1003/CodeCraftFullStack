import React from "react";
import RecruiterLayout from "../../layouts/RecruiterLayout";

const jobs = [
  { id: 1, title: "Frontend Developer", applicants: 42, status: "Open" },
  { id: 2, title: "Backend Developer", applicants: 30, status: "Closed" },
  { id: 3, title: "Full Stack Developer", applicants: 65, status: "Open" },
];

const MyJobs = () => {
  return (
    <RecruiterLayout>
      <h1>My Jobs</h1>

      <div className="table">
        <div className="table-head">
          <span>Job Title</span>
          <span>Applicants</span>
          <span>Status</span>
        </div>

        {jobs.map((job) => (
          <div className="table-row" key={job.id}>
            <span>{job.title}</span>
            <span>{job.applicants}</span>
            <span className={job.status === "Open" ? "open" : "closed"}>
              {job.status}
            </span>
          </div>
        ))}
      </div>
    </RecruiterLayout>
  );
};

export default MyJobs;
