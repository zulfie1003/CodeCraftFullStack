
import StudentLayout from "../../layouts/StudentLayout";
import { useState } from "react";

function Dashboard() {
  const chartData = [40, 65, 30, 80, 55, 90, 70];
  const totalActivity = chartData.reduce((a, b) => a + b, 0) || 0;
  
  return (
  
    <StudentLayout>
        <div className="sd-container">

          {/* HEADER */}
          <div className="sd-header">
            <div>
              <h1>Dashboard</h1>
              <p>Track your learning & growth</p>
            </div>
            <span className="sync">Last synced: Just now</span>
          </div>

          {/* STATS */}
          <div className="sd-stats">
            <div className="sd-card">
              <h4>Weekly Activity</h4>
              <p>Top 5%</p>
            </div>
            <div className="sd-card purple">
              <h4>Total Commits</h4>
              <p>1,248</p>
            </div>
            <div className="sd-card pink">
              <h4>Problems Solved</h4>
              <p>342</p>
            </div>
            <div className="sd-card yellow">
              <h4>Current Streak</h4>
              <p>12 Days</p>
            </div>
          </div>

          {/* GRID */}
          <div className="sd-grid">

            {/* ACTIVITY */}
            <div className="sd-glass large" style={{ "--activity-count": totalActivity }}>
              <h3>Activity Overview</h3>

              <div className="fake-chart">
                <div style={{ height: "40%" }} />
                <div style={{ height: "65%" }} />
                <div style={{ height: "30%" }} />
                <div style={{ height: "80%" }} />
                <div style={{ height: "55%" }} />
                <div style={{ height: "90%" }} />
                <div style={{ height: "70%" }} />
              </div>

              <p className="chart-note">Commits & Problems (Weekly)</p>
              
              <div className="chart-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Activity</span>
                  <span className="stat-value">{totalActivity}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg per Day</span>
                  <span className="stat-value">{(totalActivity / 7).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* SKILLS */}
            <div className="sd-glass">
              <h3>Skill Mastery</h3>

              <div className="skill">
                <span>Frontend</span>
                <div className="bar"><div style={{ width: "90%" }} /></div>
              </div>

              <div className="skill">
                <span>Backend</span>
                <div className="bar purple"><div style={{ width: "65%" }} /></div>
              </div>

              <div className="skill">
                <span>DSA</span>
                <div className="bar pink"><div style={{ width: "75%" }} /></div>
              </div>

              <button className="sd-btn">Continue Practice</button>
            </div>
          </div>

          {/* PROJECTS */}
      <div className="sd-projects">
  <h3>Recent Projects</h3>

  <div className="project-grid">
    <div className="sd-glass">
      <h4>Hospital Management System</h4>
      <p>React + Node.js + MongoDB</p>
    </div>

    <div className="sd-glass">
      <h4>Attendance Management System</h4>
      <p>Java + Spring Boot + MySQL</p>
    </div>

    <div className="sd-glass">
      <h4>Crypto Crash Game</h4>
      <p>Node.js + WebSockets + MongoDB</p>
    </div>

    <div className="sd-glass">
      <h4>Smart Queue Management</h4>
      <p>React + Socket.IO + Firebase</p>
    </div>

    <div className="sd-glass">
      <h4>E-Commerce Website</h4>
      <p>React + Tailwind + Stripe</p>
    </div>

    <div className="sd-glass">
      <h4>Weather Forecast App</h4>
      <p>React + OpenWeather API</p>
    </div>

    <div className="sd-glass">
      <h4>Admin Dashboard Panel</h4>
      <p>React + Chart.js</p>
    </div>

    <div className="sd-glass">
      <h4>Portfolio Website</h4>
      <p>React + CSS + Vite</p>
    </div>
  </div>
</div>


        </div>
        </StudentLayout>
   
  );
}

export default Dashboard;

