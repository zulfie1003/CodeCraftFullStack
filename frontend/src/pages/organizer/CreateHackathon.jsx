
import { useState } from "react";
import OrganizerLayout from "../../layouts/OrganizerLayout";

const CreateHackathon = () => {
  const [form, setForm] = useState({
    title: "",
    date: "",
    prize: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.prize) {
      setError("All fields are required");
      return;
    }
    setError("");
    setSuccess("Hackathon Created Successfully!");
    console.log(form);
  };

  return (
    <OrganizerLayout>
      <h1>Create Hackathon</h1>

      <form className="org-form" onSubmit={submit}>
        <input placeholder="Hackathon Title" onChange={e => setForm({...form, title: e.target.value})} />
        <input type="date" onChange={e => setForm({...form, date: e.target.value})} />
        <input placeholder="Prize Pool" onChange={e => setForm({...form, prize: e.target.value})} />
        <textarea placeholder="Description" onChange={e => setForm({...form, description: e.target.value})} />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button className="primary-btn">Create</button>
      </form>
    </OrganizerLayout>
  );
};

export default CreateHackathon;
