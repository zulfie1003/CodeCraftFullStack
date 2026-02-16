import { useState } from "react";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import "../../styles/recruiter.css";

const PostJob = () => {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    experience: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title) e.title = "Job title required";
    if (!form.company) e.company = "Company required";
    if (!form.location) e.location = "Location required";
    if (!form.type) e.type = "Job type required";
    if (!form.salary) e.salary = "Salary required";
    if (!form.description) e.description = "Description required";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSuccess(true);
    console.log("JOB POSTED:", form);

    // backend later
    setForm({
      title: "",
      company: "",
      location: "",
      type: "",
      salary: "",
      experience: "",
      description: "",
    });
  };

  return (
    <RecruiterLayout>
      <h1>Post New Job</h1>

      <form className="job-form" onSubmit={handleSubmit}>
        <input
          placeholder="Job Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        {errors.title && <p className="error">{errors.title}</p>}

        <input
          placeholder="Company Name"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        {errors.company && <p className="error">{errors.company}</p>}

        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        {errors.location && <p className="error">{errors.location}</p>}

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="">Select Job Type</option>
          <option>Full Time</option>
          <option>Part Time</option>
          <option>Internship</option>
          <option>Remote</option>
        </select>
        {errors.type && <p className="error">{errors.type}</p>}

        <input
          placeholder="Salary (e.g. 6-10 LPA)"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
        />
        {errors.salary && <p className="error">{errors.salary}</p>}

        <input
          placeholder="Experience (e.g. 1-3 Years)"
          value={form.experience}
          onChange={(e) => setForm({ ...form, experience: e.target.value })}
        />

        <textarea
          placeholder="Job Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        {errors.description && <p className="error">{errors.description}</p>}

        <button className="primary-btn">Post Job</button>

        {success && <p className="success">Job Posted Successfully ✅</p>}
      </form>
    </RecruiterLayout>
  );
};

export default PostJob;
