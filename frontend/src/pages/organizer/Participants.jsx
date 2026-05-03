import { useEffect, useState } from "react";
import OrganizerLayout from "../../layouts/OrganizerLayout";
import api from "../../api/axios";

const Participants = () => {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [teamDrafts, setTeamDrafts] = useState({});

  const loadRegistrations = async (nextSearch = search) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/registrations/organizer", {
        params: {
          search: nextSearch,
        },
      });

      const nextRegistrations = Array.isArray(response.data?.data?.registrations)
        ? response.data.data.registrations
        : [];

      setRegistrations(nextRegistrations);
      setTeamDrafts(
        nextRegistrations.reduce((accumulator, registration) => {
          accumulator[registration._id] = {
            teamName: registration.teamName || "",
            teamMembers: Array.isArray(registration.teamMembers)
              ? registration.teamMembers.join(", ")
              : "",
          };
          return accumulator;
        }, {})
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => loadRegistrations(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (registrationId, status) => {
    setUpdatingId(registrationId);
    setError("");

    try {
      await api.patch(`/registrations/${registrationId}/status`, { status });
      await loadRegistrations(search);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update registration status.");
    } finally {
      setUpdatingId("");
    }
  };

  const updateTeamDraft = (registrationId, field, value) => {
    setTeamDrafts((current) => ({
      ...current,
      [registrationId]: {
        ...current[registrationId],
        [field]: value,
      },
    }));
  };

  const saveTeam = async (registrationId) => {
    setUpdatingId(registrationId);
    setError("");

    try {
      const draft = teamDrafts[registrationId] || { teamName: "", teamMembers: "" };

      await api.patch(`/registrations/${registrationId}/team`, draft);
      await loadRegistrations(search);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update team assignment.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <OrganizerLayout>
      <div className="page-intro">
        <h1>Participants</h1>
        <p>
          Organizers can review registrations, read shared student profiles, and manage team
          assignments for their own events.
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="filter-grid">
        <input
          placeholder="Search event, student, team, or email"
          value={search}
          onChange={(event) => {
            const nextSearch = event.target.value;
            setSearch(nextSearch);
            loadRegistrations(nextSearch);
          }}
        />
      </div>

      {loading ? (
        <div className="applicant-card">
          <p>Loading organizer registrations...</p>
        </div>
      ) : registrations.length > 0 ? (
        <div className="applicant-list">
          {registrations.map((registration) => {
            const student = registration.student || {};
            const draft = teamDrafts[registration._id] || {
              teamName: "",
              teamMembers: "",
            };

            return (
              <article className="applicant-card" key={registration._id}>
                <div className="applicant-card-header">
                  <div>
                    <h3>{student.name}</h3>
                    <p>{student.email}</p>
                    <p>
                      Registered for <strong>{registration.event?.name}</strong>
                    </p>
                  </div>
                  <span className={`status ${registration.status}`}>{registration.status}</span>
                </div>

                <div className="candidate-meta-grid">
                  <span>College: {student.college || "Not added"}</span>
                  <span>Degree: {student.degree || "Not added"}</span>
                  <span>Year: {student.year || "Not added"}</span>
                  <span>Phone: {student.phone || "Not added"}</span>
                </div>

                <div className="skills">
                  {Array.isArray(student.skills) && student.skills.length > 0 ? (
                    student.skills.map((skill) => <span key={`${registration._id}-${skill}`}>{skill}</span>)
                  ) : (
                    <span>No skills added</span>
                  )}
                </div>

                <div className="read-only-profile">
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

                <div className="team-editor-card">
                  <label>
                    Team Name
                    <input
                      value={draft.teamName}
                      onChange={(event) =>
                        updateTeamDraft(registration._id, "teamName", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    Team Members
                    <textarea
                      rows="3"
                      value={draft.teamMembers}
                      onChange={(event) =>
                        updateTeamDraft(registration._id, "teamMembers", event.target.value)
                      }
                    />
                  </label>
                  <button onClick={() => saveTeam(registration._id)} disabled={updatingId === registration._id}>
                    Save Team
                  </button>
                </div>

                <div className="actions">
                  <button
                    className="success-btn"
                    onClick={() => updateStatus(registration._id, "shortlisted")}
                    disabled={updatingId === registration._id}
                  >
                    Shortlist
                  </button>
                  <button
                    className="danger-btn"
                    onClick={() => updateStatus(registration._id, "rejected")}
                    disabled={updatingId === registration._id}
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state-panel">
          <h2>No registrations found.</h2>
          <p>Students who register for your events will appear here.</p>
        </div>
      )}
    </OrganizerLayout>
  );
};

export default Participants;
