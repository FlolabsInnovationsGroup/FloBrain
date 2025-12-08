import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>

      <div style={{ marginTop: 20, display: "flex", gap: 20 }}>
        <a href="/agent" style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8, textDecoration: "none", color: "inherit", display: "block", width: 200 }}>
          <h3>Agent Chat</h3>
          <p>Interact with the AI Agents</p>
        </a>

        <a href="/upload" style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8, textDecoration: "none", color: "inherit", display: "block", width: 200 }}>
          <h3>Media Upload</h3>
          <p>Transcribe Audio Files</p>
        </a>

        <a href="/recordings" style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8, textDecoration: "none", color: "inherit", display: "block", width: 200 }}>
          <h3>Recordings</h3>
          <p>View Past Recordings</p>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
