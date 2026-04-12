import { useEffect, useState } from "react";
import OrganizerLayout from "../../layouts/OrganizerLayout";
import api from "../../api/axios";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const Hackathons = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      try {
        const response = await api.get("/events/manage/mine");

        if (isMounted) {
          setEvents(Array.isArray(response.data?.data?.events) ? response.data.data.events : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || "Unable to load organizer events.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <OrganizerLayout>
      <div className="page-intro">
        <h1>My Hackathons</h1>
        <p>Each event here belongs to the logged-in organizer and shows live registration counts.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="table organizer-table-wide">
        <div className="table-head">
          <div>Event</div>
          <div>Theme</div>
          <div>Deadline</div>
          <div>Teams</div>
          <div>Status</div>
        </div>

        {loading ? (
          <div className="table-row table-row-empty">
            <div>Loading organizer events...</div>
          </div>
        ) : events.length > 0 ? (
          events.map((event) => (
            <div className="table-row" key={event._id}>
              <div>
                <strong>{event.name}</strong>
                <small>{event.description}</small>
              </div>
              <div>{event.theme}</div>
              <div>{formatDate(event.deadline)}</div>
              <div>{event.registrationsCount || 0}</div>
              <div className={event.status === "open" ? "open" : "closed"}>{event.status}</div>
            </div>
          ))
        ) : (
          <div className="table-row table-row-empty">
            <div>No hackathons created yet.</div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};

export default Hackathons;
