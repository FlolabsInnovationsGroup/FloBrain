import React, { useEffect, useState } from "react";
import { axiosClient } from "../api/axiosClient";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setLoading, setError } from "../store/slices/appSlice";

type Recording = {
  id: string;
  title: string;
};

const Recordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const loading = useAppSelector((state) => state.app.loading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLoading(true));

    axiosClient
      .get("/api/recordings")
      .then((res) => {
        setRecordings(res.data);
        dispatch(setError(null));
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.message || "Failed to load recordings";
        dispatch(setError(errorMsg));
      })
      .finally(() => dispatch(setLoading(false)));
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
