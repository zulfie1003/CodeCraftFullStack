import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Event from "../models/Event.model.js";
import Job from "../models/Job.model.js";
import User from "../models/User.model.js";

const DEMO_RECRUITER = {
  name: "CodeCraft Demo Recruiter",
  email: "demo.recruiter@codecraft.local",
  password: "Password@123",
  role: "recruiter",
  companyName: "CodeCraft Labs",
  industry: "Software",
  website: "https://codecraft.example.com",
};

const DEMO_ORGANIZER = {
  name: "CodeCraft Demo Organizer",
  email: "demo.organizer@codecraft.local",
  password: "Password@123",
  role: "organizer",
  organizationName: "CodeCraft Community",
  organizationType: "Tech Community",
  website: "https://community.codecraft.example.com",
};

const buildDemoJobs = () => [
  {
    title: "Frontend Developer Intern",
    company: "CodeCraft Labs",
    source: "company",
    type: "internship",
    experience: "0-1 years",
    experienceLevel: "fresher",
    location: "Bengaluru, India",
    remote: true,
    description:
      "Work with the product team to build responsive React features, improve student dashboards, and polish reusable UI components.",
    requirements: [
      "Strong basics in HTML, CSS, and JavaScript",
      "Comfortable with React component patterns",
      "Able to consume REST APIs and manage local state",
    ],
    skills: ["React", "JavaScript", "CSS", "REST API"],
    salary: {
      min: 18000,
      max: 28000,
      currency: "INR",
    },
    applyUrl: "https://codecraft.example.com/jobs/frontend-developer-intern",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    status: "active",
  },
  {
    title: "MERN Stack Developer",
    company: "CodeCraft Labs",
    source: "company",
    type: "fulltime",
    experience: "1-3 years",
    experienceLevel: "junior",
    location: "Pune, India",
    remote: false,
    description:
      "Build full-stack product features using MongoDB, Express, React, and Node.js with a focus on clean APIs and production-ready delivery.",
    requirements: [
      "Experience building full-stack CRUD flows",
      "Good understanding of MongoDB schema design",
      "Comfortable with Git and deployment workflows",
    ],
    skills: ["MongoDB", "Express", "React", "Node.js"],
    salary: {
      min: 500000,
      max: 800000,
      currency: "INR",
    },
    applyUrl: "https://codecraft.example.com/jobs/mern-stack-developer",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    status: "active",
  },
  {
    title: "AI Product Engineering Intern",
    company: "CodeCraft Labs",
    source: "company",
    type: "internship",
    experience: "0-1 years",
    experienceLevel: "fresher",
    location: "Hyderabad, India",
    remote: true,
    description:
      "Prototype AI-assisted features, connect third-party APIs, and ship small product experiments with strong engineering hygiene.",
    requirements: [
      "Solid problem-solving skills",
      "Comfortable with JavaScript or Python",
      "Interest in prompt design and API integration",
    ],
    skills: ["Node.js", "Python", "APIs", "Problem Solving"],
    salary: {
      min: 20000,
      max: 32000,
      currency: "INR",
    },
    applyUrl: "https://codecraft.example.com/jobs/ai-product-engineering-intern",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    status: "active",
  },
];

const buildDemoEvents = () => [
  {
    name: "CodeCraft Build Sprint 2026",
    description:
      "A 36-hour hackathon focused on student productivity, developer tooling, and portfolio-ready product builds.",
    theme: "Developer Productivity and AI Workflows",
    rules:
      "Teams must build an original working prototype, submit source code, and present a short demo before the deadline.",
    teamSizeLimit: 4,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
    status: "open",
  },
  {
    name: "Campus Innovation Hackathon",
    description:
      "Build practical products for college life, placements, student communities, or smart campus operations.",
    theme: "Campus Tech and Student Experience",
    rules:
      "A team can have up to 5 members. Submission must include a problem statement, repository link, and a short presentation.",
    teamSizeLimit: 5,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
    status: "open",
  },
  {
    name: "Open Source Launchpad",
    description:
      "Collaborate on tools that support open source contributors, maintainers, and first-time community builders.",
    theme: "Open Source and Community Platforms",
    rules:
      "Projects should be reproducible, include documentation, and clearly mention the contribution flow or community impact.",
    teamSizeLimit: 3,
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35),
    status: "open",
  },
];

const ensureDemoUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });

  if (!existingUser) {
    return User.create(payload);
  }

  await User.updateOne(
    { _id: existingUser._id },
    {
      $set: {
        name: payload.name,
        role: payload.role,
        website: payload.website,
        companyName: payload.companyName,
        industry: payload.industry,
        organizationName: payload.organizationName,
        organizationType: payload.organizationType,
      },
    }
  );

  return User.findById(existingUser._id);
};

const upsertDemoJobs = async (recruiterId) => {
  const jobs = buildDemoJobs();

  return Promise.all(
    jobs.map((job) =>
      Job.findOneAndUpdate(
        {
          title: job.title,
          company: job.company,
          postedBy: recruiterId,
        },
        {
          ...job,
          postedBy: recruiterId,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      )
    )
  );
};

const upsertDemoEvents = async (organizerId) => {
  const events = buildDemoEvents();

  return Promise.all(
    events.map((event) =>
      Event.findOneAndUpdate(
        {
          name: event.name,
          organizer: organizerId,
        },
        {
          ...event,
          organizer: organizerId,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      )
    )
  );
};

const seedDemoData = async () => {
  await connectDB();

  const recruiter = await ensureDemoUser(DEMO_RECRUITER);
  const organizer = await ensureDemoUser(DEMO_ORGANIZER);

  const [jobs, events] = await Promise.all([
    upsertDemoJobs(recruiter._id),
    upsertDemoEvents(organizer._id),
  ]);

  console.log(
    `Seeded ${jobs.length} demo jobs and ${events.length} demo hackathons into MongoDB.`
  );
};

seedDemoData()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Unable to seed demo data:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
