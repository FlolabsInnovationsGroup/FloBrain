import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Recordings from "./pages/Recordings";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalError from "./components/GlobalError";
import GlobalLoading from "./components/GlobalLoading";

import AgentChat from "./pages/AgentChat";
import MediaUpload from "./pages/MediaUpload";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <GlobalError />
        <GlobalLoading />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/recordings"
            element={<Recordings />}
          />

          <Route
            path="/agent"
            element={<AgentChat />}
          />

          <Route
            path="/upload"
            element={<MediaUpload />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
