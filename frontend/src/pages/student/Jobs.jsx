import { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/jobs.css";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";

/* ---------------- MOCK DATA ---------------- */
const JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Google",
    location: "Bangalore",
    salary: "₹12–18 LPA",
    postedAt: "2 days ago",
    match: 82,
    logo: "https://logo.clearbit.com/google.com",
    matched: ["React", "JavaScript"],
    missing: ["System Design"],
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Amazon",
    location: "Hyderabad",
    salary: "₹18–25 LPA",
    postedAt: "5 days ago",
    match: 64,
    logo: "https://logo.clearbit.com/amazon.com",
    matched: ["Node.js", "MongoDB"],
    missing: ["AWS"],
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "Microsoft",
    location: "Noida",
    salary: "₹15–22 LPA",
    postedAt: "1 week ago",
    match: 76,
    logo: "https://logo.clearbit.com/microsoft.com",
    matched: ["Java", "Spring Boot"],
    missing: ["Microservices"],
  },
  {
    id: 4,
    title: "Software Engineer",
    company: "Flipkart",
    location: "Bangalore",
    salary: "₹10–16 LPA",
    postedAt: "3 days ago",
    match: 71,
    logo: "https://logo.clearbit.com/flipkart.com",
    matched: ["DSA", "Java"],
    missing: ["System Design"],
  },
  {
    id: 5,
    title: "React Developer",
    company: "Paytm",
    location: "Noida",
    salary: "₹8–14 LPA",
    postedAt: "6 days ago",
    match: 88,
    logo: "https://logo.clearbit.com/paytm.com",
    matched: ["React", "Redux"],
    missing: ["Testing"],
  },
  {
    id: 6,
    title: "Node.js Developer",
    company: "Swiggy",
    location: "Remote",
    salary: "₹14–20 LPA",
    postedAt: "4 days ago",
    match: 69,
    logo: "https://logo.clearbit.com/swiggy.com",
    matched: ["Node.js", "Express"],
    missing: ["AWS"],
  },
  {
    id: 7,
    title: "Junior Software Engineer",
    company: "TCS",
    location: "Pune",
    salary: "₹5–8 LPA",
    postedAt: "1 day ago",
    match: 92,
    logo: "https://logo.clearbit.com/tcs.com",
    matched: ["Java", "OOPs"],
    missing: [],
  },
];


const TRENDS = [
  { name: "React", growth: "+18%" },
  { name: "Node.js", growth: "+14%" },
  { name: "AWS", growth: "+22%" },
  { name: "Spring Boot", growth: "+16%" },
  { name: "System Design", growth: "+19%" },
  { name: "MongoDB", growth: "+13%" },
  { name: "Docker", growth: "+21%" },
];


function Jobs() {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    setJobs(JOBS);
  }, []);

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StudentLayout>
      <div className="sd-container">

        {/* HEADER */}
        <div className="sd-header">
          <div>
            <h1>Jobs</h1>
            <p>AI matched jobs based on your skills</p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="jobs-search">
          <Search size={16} />
          <input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* GRID */}
        <div className="jobs-grid">

          {/* JOB LIST */}
          <div className="jobs-list">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-card">

                {/* TOP SECTION WITH MATCH */}
                <div className="job-header">
                  <div className="job-logo-title">
                    <img src={job.logo} alt={job.company} className="job-logo" />
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <p className="company-name"><Building2 size={12} /> {job.company}</p>
                    </div>
                  </div>
                  <div className="match-badge" style={{ background: job.match >= 80 ? 'rgba(34, 197, 94, 0.15)' : job.match >= 70 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)' }}>
                    <div className="match-circle">
                      <span className="match-percentage">{job.match}</span>
                      <span className="match-text">%</span>
                    </div>
                    <span className="match-label">Match</span>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="match-bar-container">
                  <div className="match-bar" style={{
                    width: `${job.match}%`,
                    background: job.match >= 80 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : job.match >= 70 ? 'linear-gradient(90deg, #3b82f6, #1d4ed8)' : 'linear-gradient(90deg, #f59e0b, #d97706)'
                  }}></div>
                </div>

                {/* META INFO */}
                <div className="job-meta-compact">
                  <span><MapPin size={13} /> {job.location}</span>
                  <span><Clock size={13} /> {job.postedAt}</span>
                  <span><DollarSign size={13} /> {job.salary}</span>
                </div>

                {/* SKILLS SECTION */}
                <div className="skills-section">
                  <div className="skills-subsection">
                    <h4 className="skills-label"><CheckCircle size={14} /> Your Skills Match</h4>
                    <div className="skills-pills">
                      {job.matched.length > 0 ? (
                        job.matched.map((s) => (
                          <span key={s} className="skill-pill matched-pill">{s}</span>
                        ))
                      ) : (
                        <p className="no-skills">No matching skills yet</p>
                      )}
                    </div>
                  </div>

                  {job.missing.length > 0 && (
                    <div className="skills-subsection">
                      <h4 className="skills-label"><XCircle size={14} /> Skills to Learn</h4>
                      <div className="skills-pills">
                        {job.missing.map((s) => (
                          <span key={s} className="skill-pill missing-pill">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTON */}
                <button className="apply-btn">
                  <Zap size={16} /> Apply Now
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="jobs-sidebar">
            <h3>
              <TrendingUp size={18} /> Market Trends
            </h3>

            {TRENDS.map((t) => (
              <div key={t.name} className="trend">
                <span>{t.name}</span>
                <span className="growth">{t.growth}</span>
              </div>
            ))}

            <div className="career-tip">
              <h4>Career Tip</h4>
              <p>
                Learn <span>AWS</span> to increase job match rate.
              </p>
            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}

export default Jobs;
