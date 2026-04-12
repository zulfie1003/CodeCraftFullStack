import { useEffect, useMemo, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import api from "../../api/axios";
import "../../styles/hackathons.css";

const INITIAL_REGISTRATION = {
  teamName: "",
  teamMembers: "",
  submissionUrl: "",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Date to be announced";

function Hackathons() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState(INITIAL_REGISTRATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadHackathons = async () => {
      try {
        const [eventsResponse, registrationsResponse] = await Promise.all([
          api.get("/events"),
          api.get("/registrations/my"),
        ]);

        if (isMounted) {
          setEvents(Array.isArray(eventsResponse.data?.data?.events) ? eventsResponse.data.data.events : []);
          setRegistrations(
            Array.isArray(registrationsResponse.data?.data?.registrations)
              ? registrationsResponse.data.data.registrations
              : []
          );
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load hackathons.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHackathons();

    return () => {
      isMounted = false;
    };
  }, []);

  const registrationsByEventId = useMemo(
    () =>
      registrations.reduce((accumulator, registration) => {
        if (registration.event?._id) {
          accumulator[registration.event._id] = registration;
        }
        return accumulator;
      }, {}),
    [registrations]
  );

  const openRegistrationModal = (event) => {
    setSelectedEvent(event);
    setForm(INITIAL_REGISTRATION);
    setError("");
    setSuccess("");
  };

  const closeRegistrationModal = () => {
    setSelectedEvent(null);
    setForm(INITIAL_REGISTRATION);
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();

    if (!selectedEvent) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/registrations", {
        eventId: selectedEvent._id,
        teamName: form.teamName,
        teamMembers: form.teamMembers,
        submissionUrl: form.submissionUrl,
      });

      const nextRegistration = response.data?.data?.registration;

      if (nextRegistration) {
        setRegistrations((current) => [nextRegistration, ...current]);
      }

      setSuccess(`Registered for ${selectedEvent.name}.`);
      closeRegistrationModal();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to register for this event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="hackathon-page">
        <div className="hackathon-header">
          <div>
            <h1 className="page-title">Hackathons</h1>
            <p className="page-subtitle">
              Students can browse organizer-created events and register with a shared student profile.
            </p>
          </div>
        </div>

        {error && <div className="info-box error-box">{error}</div>}
        {success && <div className="info-box success-box">{success}</div>}

        <div className="summary-strip">
          <div className="summary-card">
            <span>Open Events</span>
            <strong>{events.length}</strong>
          </div>
          <div className="summary-card">
            <span>My Registrations</span>
            <strong>{registrations.length}</strong>
          </div>
          <div className="summary-card">
            <span>Pending Review</span>
            <strong>{registrations.filter((item) => item.status === "pending").length}</strong>
          </div>
        </div>

        {loading ? (
          <div className="empty-state-panel">
            <h2>Loading hackathons...</h2>
          </div>
        ) : events.length > 0 ? (
          <div className="hackathon-grid">
            {events.map((event) => {
              const registration = registrationsByEventId[event._id];

              return (
                <article className="hackathon-card" key={event._id}>
                  <div className="card-body">
                    <div className="card-topline">
                      <span className="status-pill">{event.status}</span>
                      <span className="organizer">{event.organizer?.name || "Organizer"}</span>
                    </div>

                    <h2>{event.name}</h2>
                    <p className="date">Deadline: {formatDate(event.deadline)}</p>
                    <p className="prize">Theme: {event.theme}</p>
                    <p className="hackathon-description">{event.description}</p>

                    <div className="tags">
                      <span>Team Limit: {event.teamSizeLimit}</span>
                    </div>

                    <div className="event-rule-box">
                      <strong>Rules</strong>
                      <p>{event.rules}</p>
                    </div>

                    {registration ? (
                      <div className={`application-state ${registration.status}`}>
                        Registration: {registration.status}
                      </div>
                    ) : (
                      <button className="register-btn" onClick={() => openRegistrationModal(event)}>
                        Register
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-panel">
            <h2>No hackathons available right now.</h2>
            <p>When organizers publish events, they will appear here.</p>
          </div>
        )}

        {selectedEvent && (
          <div className="modal-overlay" onClick={closeRegistrationModal}>
            <div className="registration-modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedEvent.name}</h2>
                  <p>Register your team for this event.</p>
                </div>
                <button className="close-btn" onClick={closeRegistrationModal} type="button">
                  x
                </button>
              </div>

              <form className="registration-form" onSubmit={handleSubmit}>
                <div className="form-section">
                  <h3>Team Details</h3>
                  <input
                    placeholder="Team name"
                    value={form.teamName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, teamName: event.target.value }))
                    }
                    required
                  />
                  <textarea
                    rows="4"
                    placeholder="Additional team member names, one per line or comma separated"
                    value={form.teamMembers}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, teamMembers: event.target.value }))
                    }
                  />
                  <input
                    placeholder="Submission URL (optional)"
                    value={form.submissionUrl}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, submissionUrl: event.target.value }))
                    }
                  />
                </div>

                <div className="form-actions">
                  <button className="submit-btn" disabled={submitting} type="submit">
                    {submitting ? "Submitting..." : "Submit Registration"}
                  </button>
                  <button className="cancel-btn" type="button" onClick={closeRegistrationModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default Hackathons;
