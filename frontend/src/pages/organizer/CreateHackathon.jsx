import { useState } from "react";
import OrganizerLayout from "../../layouts/OrganizerLayout";
import api from "../../api/axios";

const INITIAL_FORM = {
  name: "",
  description: "",
  theme: "",
  rules: "",
  teamSizeLimit: "4",
  deadline: "",
};

const CreateHackathon = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/events", {
        name: form.name,
        description: form.description,
        theme: form.theme,
        rules: form.rules,
        teamSizeLimit: Number(form.teamSizeLimit),
        deadline: form.deadline,
      });

      setSuccess("Hackathon created successfully.");
      setForm(INITIAL_FORM);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create hackathon.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OrganizerLayout>
      <div className="page-intro">
        <h1>Create Hackathon</h1>
        <p>
          Organizers can create events here with theme, rules, team size limit, and deadline.
          Students only see the published result, not these controls.
        </p>
      </div>

      <form className="org-form org-form-wide" onSubmit={submit}>
        <input
          placeholder="Hackathon name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
        <input
          placeholder="Theme"
          value={form.theme}
          onChange={(event) => updateField("theme", event.target.value)}
        />
        <input
          type="number"
          min="1"
          max="10"
          placeholder="Team size limit"
          value={form.teamSizeLimit}
          onChange={(event) => updateField("teamSizeLimit", event.target.value)}
        />
        <input
          type="date"
          value={form.deadline}
          onChange={(event) => updateField("deadline", event.target.value)}
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
        <textarea
          placeholder="Rules"
          value={form.rules}
          onChange={(event) => updateField("rules", event.target.value)}
        />

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting ? "Publishing..." : "Publish Hackathon"}
        </button>
      </form>
    </OrganizerLayout>
  );
};

export default CreateHackathon;
