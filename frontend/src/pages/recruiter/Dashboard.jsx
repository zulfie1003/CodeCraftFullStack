import React from "react";
import RecruiterLayout from "../../layouts/RecruiterLayout";

const Dashboard = () => {
  return (
    <RecruiterLayout>
      <h1>Recruiter Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "20px" }}>
        <div className="stat-card">Total Jobs<br /><b>12</b></div>
        <div className="stat-card">Applicants<br /><b>245</b></div>
        <div className="stat-card">Shortlisted<br /><b>48</b></div>
        <div className="stat-card">Hired<br /><b>12</b></div>
      </div>
    </RecruiterLayout>
  );
};

export default Dashboard;
