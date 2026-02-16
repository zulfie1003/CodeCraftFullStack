
import OrganizerLayout from "../../layouts/OrganizerLayout";
const Dashboard = () => {
  return (
    <OrganizerLayout>
      <h1>Organizer Dashboard</h1>

      <div className="grid-3">
        <div className="stat-card">Total Hackathons <b>5</b></div>
        <div className="stat-card">Participants <b>320</b></div>
        <div className="stat-card">Winners <b>15</b></div>
      </div>
    </OrganizerLayout>
  );
};

export default Dashboard;
