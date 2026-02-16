
import OrganizerLayout from "../../layouts/OrganizerLayout";
const Hackathons = () => {
  const data = [
    { id: 1, title: "AI Hackathon", status: "Open" },
    { id: 2, title: "Web3 Build", status: "Closed" },
  ];

  return (
    <OrganizerLayout>
      <h1>My Hackathons</h1>

      <div className="table">
        <div className="table-head">
          <div>Title</div>
          <div>Status</div>
        </div>

        {data.map(h => (
          <div key={h.id} className="table-row">
            <div>{h.title}</div>
            <div className={h.status === "Open" ? "open" : "closed"}>{h.status}</div>
          </div>
        ))}
      </div>
    </OrganizerLayout>
  );
};

export default Hackathons;
