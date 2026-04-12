import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrganizerLayout from "../../layouts/OrganizerLayout";
import api from "../../api/axios";

const OrganizerDashboard = () => {
  const [summary, setSummary] = useState({
    events: [],
    registrations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const [eventsResponse, registrationsResponse] = await Promise.all([
          api.get("/events/manage/mine"),
          api.get("/registrations/organizer"),
        ]);

        if (isMounted) {
          setSummary({
            events: Array.isArray(eventsResponse.data?.data?.events) ? eventsResponse.data.data.events : [],
            registrations: Array.isArray(registrationsResponse.data?.data?.registrations)
              ? registrationsResponse.data.data.registrations
              : [],
          });
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load organizer dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <OrganizerLayout>
      <div className="page-intro">
        <h1>Organizer Dashboard</h1>
        <p>Organizers only see event publishing, registrations, and participant management in this workspace.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="grid-3">
        <div className="stat-card">
          Total Events
          <b>{loading ? "..." : summary.events.length}</b>
        </div>
        <div className="stat-card">
          Open Events
          <b>{loading ? "..." : summary.events.filter((event) => event.status === "open").length}</b>
        </div>
        <div className="stat-card">
          Registrations
          <b>{loading ? "..." : summary.registrations.length}</b>
        </div>
      </div>

      <div className="dashboard-action-grid">
        <Link className="dashboard-action-card" to="/organizer/create">
          <strong>Create Hackathon</strong>
          <p>Publish a new event with rules, theme, and team size limits.</p>
        </Link>
        <Link className="dashboard-action-card" to="/organizer/hackathons">
          <strong>Manage Events</strong>
          <p>Review your published events and registration totals.</p>
        </Link>
        <Link className="dashboard-action-card" to="/organizer/participants">
          <strong>Participants</strong>
          <p>View student registrations tied to your events.</p>
        </Link>
      </div>
    </OrganizerLayout>
  );
};

export default OrganizerDashboard;
