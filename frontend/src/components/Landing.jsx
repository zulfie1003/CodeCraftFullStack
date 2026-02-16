import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/landing.css";
import logo from "../assets/logo.png";


const heroImages = [
 
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",


"https://plus.unsplash.com/premium_photo-1675793715030-0584c8ec4a13?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZnJlZSUyMGltYWdlc3N0dWRlbnQlMjBhbmQlMjBkZXZlbG9wZXJ8ZW58MHx8MHx8fDA%3",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998",
];


function Landing() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 5000); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing">

           
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="CodeCraft Logo" />
          <span>CodeCraft</span>
        </div>

        <button
  className="btn-primary"
  onClick={() => navigate("/login")}
>
  Get Started/SignUp
</button>
      </nav>

   
      <section className="hero">

        <div className="hero-left">
          <h1>
            Build Skills.<br />
            <span>Track Progress.</span><br />
            Get Hired.
          </h1>

          <p>
            CodeCraft is an AI-powered platform where students learn with
            roadmaps, practice coding, build projects, track skills,
            and become job-ready.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary">Get Started Free</button>
            <button className="btn-outline">Explore Roadmaps</button>
          </div>
        </div>

        <div className="hero-right">
          <div className="glow-ring slider">
            <img
              src={heroImages[current]}
              alt="Students and Developers"
              className="slider-image"
            />
          </div>

          <div className="card stats-card">
            <h4>Learning Performance</h4>
            <div className="bars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div className="card project-card">
            <h4>Projects</h4>
            <p>+5,200 pts this week</p>
          </div>
        </div>

      </section>

      {/* STATS */}
      <section className="stats">
        <div>
          <h2>10K+</h2>
          <p>Students</p>
        </div>
        <div>
          <h2>5K+</h2>
          <p>Projects</p>
        </div>
        <div>
          <h2>AI</h2>
          <p>Skill Tracking</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="feature purple">Roadmaps</div>
        <div className="feature orange">Coding Practice</div>
        <div className="feature blue">Projects</div>
        <div className="feature pink">Job Matching</div>
      </section>

    </div>
  );
}

export default Landing;
