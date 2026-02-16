
import { useState } from "react";
import OrganizerLayout from "../../layouts/OrganizerLayout";
const Participants = () => {
  const [list, setList] = useState([
    { id: 1, name: "Anas", status: "Pending" },
    { id: 2, name: "Rahul", status: "Pending" },
  ]);

  const update = (id, status) => {
    setList(list.map(p => p.id === id ? { ...p, status } : p));
  };

  return (
    <OrganizerLayout>
      <h1>Participants</h1>

      <div className="applicant-list">
        {list.map(p => (
          <div key={p.id} className="applicant-card">
            <b>{p.name}</b>
            <p className={`status ${p.status.toLowerCase()}`}>{p.status}</p>

            <div className="actions">
              <button className="success-btn" onClick={() => update(p.id, "Shortlisted")}>Shortlist</button>
              <button className="danger-btn" onClick={() => update(p.id, "Rejected")}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </OrganizerLayout>
  );
};

export default Participants;
