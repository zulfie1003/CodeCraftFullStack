import { useState } from "react";
import api from "../../api/axios";
import RecruiterLayout from "../../layouts/RecruiterLayout";
import "../../styles/recruiter.css";

const INITIAL_FORM = {
  title: "",
  company: "",
  source: "manual",
  location: "",
  type: "fulltime",
  experience: "",
  experienceLevel: "fresher",
  remote: false,
  salaryMin: "",
  salaryMax: "",
  currency: "INR",
  description: "",
  requirements: "",
  skills: "",
  applyUrl: "",
  expiresAt: "",
};

const SOURCE_OPTIONS = [
  { label: "Manual Entry", value: "manual" },
  { label: "Company Careers", value: "company" },
  { label: "Naukri Redirect", value: "naukri" },
  { label: "Adzuna", value: "adzuna" },
  { label: "Other", value: "other" },
];

const splitMultivalueField = (value) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const PostJob = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Job title required";
    if (!form.company.trim()) nextErrors.company = "Company required";
    if (!form.location.trim()) nextErrors.location = "Location required";
    if (!form.source) nextErrors.source = "Source required";
    if (!form.type) nextErrors.type = "Job type required";
    if (!form.experienceLevel) nextErrors.experienceLevel = "Experience level required";
    if (!form.description.trim()) nextErrors.description = "Description required";
    if (!form.applyUrl.trim()) nextErrors.applyUrl = "Apply URL required";
    if (splitMultivalueField(form.skills).length === 0) nextErrors.skills = "Add at least one skill";

    if (form.salaryMin && Number.isNaN(Number(form.salaryMin))) {
      nextErrors.salaryMin = "Min salary must be a number";
    }

    if (form.salaryMax && Number.isNaN(Number(form.salaryMax))) {
      nextErrors.salaryMax = "Max salary must be a number";
    }

    if (
      form.salaryMin &&
      form.salaryMax &&
      Number(form.salaryMax) < Number(form.salaryMin)
    ) {
      nextErrors.salaryMax = "Max salary must be greater than min salary";
    }

    return nextErrors;
  };

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage("");
      return;
    }

    setSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      await api.post("/jobs", {
        title: form.title.trim(),
        company: form.company.trim(),
        source: form.source,
        location: form.location.trim(),
        type: form.type,
        experience: form.experience.trim(),
        experienceLevel: form.experienceLevel,
        remote: form.remote,
        description: form.description.trim(),
        requirements: splitMultivalueField(form.requirements),
        skills: splitMultivalueField(form.skills),
        applyUrl: form.applyUrl.trim(),
        expiresAt: form.expiresAt || undefined,
        salary: {
          min: form.salaryMin ? Number(form.salaryMin) : undefined,
          max: form.salaryMax ? Number(form.salaryMax) : undefined,
          currency: form.currency,
        },
      });

      setSuccessMessage("Job saved successfully. It will appear in CodeCraft Jobs with external apply redirect and skill-based matching.");
      setForm(INITIAL_FORM);
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || "Unable to post job right now",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RecruiterLayout>
      <div className="page-intro">
        <h1>Manual Job Entry</h1>
        <p>
          Add structured job metadata, required skills, and an external apply link. CodeCraft will recommend the role but will not host the application itself.
        </p>
      </div>

      <form className="job-form wide" onSubmit={handleSubmit}>
        <div className="form-grid two-col">
          <div className="form-field">
            <label>Job Title</label>
            <input
              placeholder="Frontend Developer"
              value={form.title}
              onChange={(event) => handleChange("title", event.target.value)}
            />
            {errors.title && <p className="error">{errors.title}</p>}
          </div>

          <div className="form-field">
            <label>Company Name</label>
            <input
              placeholder="Google"
              value={form.company}
              onChange={(event) => handleChange("company", event.target.value)}
            />
            {errors.company && <p className="error">{errors.company}</p>}
          </div>

          <div className="form-field">
            <label>Job Source</label>
            <select value={form.source} onChange={(event) => handleChange("source", event.target.value)}>
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.source && <p className="error">{errors.source}</p>}
          </div>

          <div className="form-field">
            <label>Location</label>
            <input
              placeholder="Bangalore"
              value={form.location}
              onChange={(event) => handleChange("location", event.target.value)}
            />
            {errors.location && <p className="error">{errors.location}</p>}
          </div>

          <div className="form-field">
            <label>Job Type</label>
            <select value={form.type} onChange={(event) => handleChange("type", event.target.value)}>
              <option value="fulltime">Full Time</option>
              <option value="parttime">Part Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
            {errors.type && <p className="error">{errors.type}</p>}
          </div>

          <div className="form-field">
            <label>Experience</label>
            <input
              placeholder="0-2 years"
              value={form.experience}
              onChange={(event) => handleChange("experience", event.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Experience Level</label>
            <select
              value={form.experienceLevel}
              onChange={(event) => handleChange("experienceLevel", event.target.value)}
            >
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
            {errors.experienceLevel && <p className="error">{errors.experienceLevel}</p>}
          </div>

          <div className="form-field checkbox-field">
            <label>
              <input
                type="checkbox"
                checked={form.remote}
                onChange={(event) => handleChange("remote", event.target.checked)}
              />
              Remote Friendly
            </label>
          </div>

          <div className="form-field">
            <label>Apply URL</label>
            <input
              placeholder="https://company.com/jobs/frontend-developer"
              value={form.applyUrl}
              onChange={(event) => handleChange("applyUrl", event.target.value)}
            />
            {errors.applyUrl && <p className="error">{errors.applyUrl}</p>}
          </div>

          <div className="form-field">
            <label>Min Salary</label>
            <input
              placeholder="600000"
              value={form.salaryMin}
              onChange={(event) => handleChange("salaryMin", event.target.value)}
            />
            {errors.salaryMin && <p className="error">{errors.salaryMin}</p>}
          </div>

          <div className="form-field">
            <label>Max Salary</label>
            <input
              placeholder="1200000"
              value={form.salaryMax}
              onChange={(event) => handleChange("salaryMax", event.target.value)}
            />
            {errors.salaryMax && <p className="error">{errors.salaryMax}</p>}
          </div>

          <div className="form-field">
            <label>Currency</label>
            <select value={form.currency} onChange={(event) => handleChange("currency", event.target.value)}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="form-field">
            <label>Expiry Date</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(event) => handleChange("expiresAt", event.target.value)}
            />
          </div>
        </div>

          <div className="form-field">
            <label>Short Summary</label>
          <textarea
            placeholder="Add a concise summary of the role, ownership, and expected outcomes."
            value={form.description}
            onChange={(event) => handleChange("description", event.target.value)}
          />
          {errors.description && <p className="error">{errors.description}</p>}
        </div>

        <div className="form-grid two-col">
          <div className="form-field">
            <label>Required Skills</label>
            <textarea
              className="compact-textarea"
              placeholder={"React\nTypeScript\nREST API\nTesting"}
              value={form.skills}
              onChange={(event) => handleChange("skills", event.target.value)}
            />
            <p className="field-help">Use one skill per line or separate with commas.</p>
            {errors.skills && <p className="error">{errors.skills}</p>}
          </div>

          <div className="form-field">
            <label>Job Requirements</label>
            <textarea
              className="compact-textarea"
              placeholder={"Strong debugging\nAPI integration experience\nPortfolio-ready frontend work"}
              value={form.requirements}
              onChange={(event) => handleChange("requirements", event.target.value)}
            />
            <p className="field-help">Optional. Use one requirement per line or separate with commas.</p>
          </div>
        </div>

        {errors.submit && <p className="error">{errors.submit}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting ? "Posting Job..." : "Post Job"}
        </button>
      </form>
    </RecruiterLayout>
  );
};

export default PostJob;
