import React, { useState } from "react";
import { axiosClient } from "../api/axiosClient";

const MediaUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Endpoint from audio.py: /audio/transcribe
            // But usually it's prefixed with /api/v1 in main.py
            const res = await axiosClient.post("/api/v1/audio/transcribe", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setResult(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
            <h2>Media Upload</h2>
            <div style={{ marginBottom: 20 }}>
                <input type="file" accept="audio/*" onChange={handleFileChange} />
                <button onClick={handleUpload} disabled={!file || loading} style={{ marginLeft: 10 }}>
                    {loading ? "Transcribing..." : "Upload & Transcribe"}
                </button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {result && (
                <div style={{ marginTop: 20 }}>
                    <h3>Transcription Result</h3>
                    <div style={{ background: "#f5f5f5", padding: 15, borderRadius: 8 }}>
                        <p>{result.text}</p>
                    </div>

                    {result.segments && (
                        <div style={{ marginTop: 20 }}>
                            <h4>Segments</h4>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {result.segments.map((seg: any, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 10, padding: 10, borderBottom: "1px solid #eee" }}>
                                        <small style={{ color: "#666" }}>
                                            {seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s
                                        </small>
                                        <p style={{ margin: "5px 0" }}>{seg.text}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MediaUpload;
