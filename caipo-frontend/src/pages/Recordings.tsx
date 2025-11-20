import React, { useEffect, useState } from "react";
import { axiosClient } from "../api/axiosClient";

type Recording = {
  id: string;
  title: string;
};

const Recordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    axiosClient
      .get("/api/recordings")
      .then((res) => setRecordings(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading recordings...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Recordings</h2>
      <ul>
        {recordings.map((r) => (
          <li key={r.id}>{r.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Recordings;
