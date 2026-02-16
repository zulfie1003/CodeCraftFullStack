import { useState } from "react";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import "../../styles/recruiter.css";

const dummyApplicants = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    skills: ["React", "Node", "MongoDB"],
    status: "pending",
  },
  {
    id: 2,
    name: "Ankit Verma",
    email: "ankit@gmail.com",
    skills: ["Java", "Spring Boot"],
    status: "pending",
  },
];

const Applicants = () => {
  const [apps, setApps] = useState(dummyApplicants);

  const updateStatus = (id, status) => {
    setApps(
      apps.map((a) =>
        a.id === id ? { ...a, status } : a
      )
    );
  };

  return (
    <RecruiterLayout>
      <h1>Applicants</h1>

      <div className="applicant-list">
        {apps.map((a) => (
          <div className="applicant-card" key={a.id}>
            <h3>{a.name}</h3>
            <p>{a.email}</p>

            <div className="skills">
              {a.skills.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>

            <div className="actions">
              {a.status === "pending" ? (
                <>
                  <button
                    className="success-btn"
                    onClick={() => updateStatus(a.id, "shortlisted")}
                  >
                    Shortlist
                  </button>
                  <button
                    className="danger-btn"
                    onClick={() => updateStatus(a.id, "rejected")}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <span className={`status ${a.status}`}>
                  {a.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </RecruiterLayout>
  );
};

export default Applicants;
