import React from "react";
import { useAuth } from "../context/AuthContext";

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h2>Profile</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default Profile;
