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
        <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
            <header style={{ marginBottom: 40 }}>
                <a href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>&larr; Back to Dashboard</a>
                <h2 style={{ fontSize: "2rem", marginTop: 10 }}>Media Upload</h2>
            </header>

            <div className="glass-panel">
                <div style={{ border: "2px dashed var(--glass-border)", borderRadius: 12, padding: 40, textAlign: "center", marginBottom: 30 }}>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" style={{ cursor: "pointer", display: "block" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 10 }}>📁</div>
                        <p style={{ fontSize: "1.1rem", marginBottom: 5 }}>{file ? file.name : "Click to select an audio file"}</p>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Supported formats: MP3, WAV, M4A</p>
                    </label>
                </div>

                <div style={{ textAlign: "right" }}>
                    <button onClick={handleUpload} className="btn-primary" disabled={!file || loading}>
                        {loading ? "Transcribing..." : "Upload & Transcribe"}
                    </button>
                </div>

                {error && <p style={{ color: "#ef4444", marginTop: 20 }}>{error}</p>}

                {result && (
                    <div style={{ marginTop: 40, borderTop: "1px solid var(--glass-border)", paddingTop: 30 }}>
                        <h3 style={{ marginBottom: 20 }}>Transcription Result</h3>
                        <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 12, lineHeight: 1.6 }}>
                            <p>{result.text}</p>
                        </div>

                        {result.segments && (
                            <div style={{ marginTop: 30 }}>
                                <h4 style={{ color: "var(--text-secondary)", marginBottom: 15 }}>Segments</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {result.segments.map((seg: any, idx: number) => (
                                        <div key={idx} style={{ padding: 15, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                                            <small style={{ color: "var(--accent-blue)", display: "block", marginBottom: 5 }}>
                                                {seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s
                                            </small>
                                            <p style={{ margin: 0 }}>{seg.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaUpload;
