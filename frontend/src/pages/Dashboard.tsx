import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 60 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>CAIPO</h1>
        <div style={{ display: "flex", gap: 20 }}>
          <span style={{ color: "var(--text-secondary)" }}>{user?.email || "Guest"}</span>
        </div>
      </header>

      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h2 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: 20, lineHeight: 1.1 }}>
          AI-Powered <span style={{ background: "linear-gradient(to right, var(--accent-purple), var(--accent-blue))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Productivity</span>
        </h2>
        <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>
          Experience the future of work with our agentic workflow engine.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 30 }}>
        <a href="/agent" className="glass-panel" style={{ display: "block", transition: "transform 0.2s" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 10 }}>Agent Chat</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Interact with the AI Agents to plan and execute tasks.</p>
          <span className="btn-primary">Start Chat &rarr;</span>
        </a>

        <a href="/upload" className="glass-panel" style={{ display: "block", transition: "transform 0.2s" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 10 }}>Media Upload</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Upload audio files for instant transcription and analysis.</p>
          <span className="btn-primary">Upload File &rarr;</span>
        </a>

        <a href="/recordings" className="glass-panel" style={{ display: "block", transition: "transform 0.2s" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: 10 }}>Recordings</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>View your past recordings and generated insights.</p>
          <span className="btn-glass">View Archive</span>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
