import React, { useState } from "react";
import { axiosClient } from "../api/axiosClient";

type PlanStep = {
    tool: string;
    description?: string;
};

type ExecutionResult = {
    step: PlanStep;
    result: string;
    data?: any;
};

type AgentResponse = {
    plan: PlanStep[];
    execution_results: ExecutionResult[];
    final_response: string;
    evaluation: string;
    verdict: string;
};

const AgentChat: React.FC = () => {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<{ type: "user" | "agent"; content: any }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { type: "user" as const, content: input };
        setHistory((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            // Assuming the backend endpoint is /api/v1/chat based on previous analysis
            // But wait, the python backend usually mounts api_v1 at /api/v1
            // Let's check main.py again if needed, but standard is /api/v1/chat
            const res = await axiosClient.post("/api/v1/chat", { message: userMsg.content });

            // The backend response structure from AgenticWorkflow wrapper in chat.py:
            // return {"response_text": response_text, "audio_content": audio_content}
            // Wait, the chat.py wrapper extracts final_response. 
            // It DOES NOT return the full plan/verdict in the current implementation of chat.py!
            // I need to update chat.py to return the full debug info if I want to show it in UI.
            // For now, I will display what I get, but I should probably update chat.py to return more info.

            // Actually, let's assume I will update chat.py to return the full object for this UI to be useful.
            // Or I can just display the text. 
            // The user wants "multiple functionalities... connected with all the endpoints".
            // Let's stick to what the current chat.py returns first, then maybe enhance.
            // Current chat.py returns: { response_text: string, audio_content: string | null }

            const agentMsg = { type: "agent" as const, content: res.data };
            setHistory((prev) => [...prev, agentMsg]);
        } catch (err) {
            console.error(err);
            setHistory((prev) => [...prev, { type: "agent", content: { response_text: "Error communicating with agent." } }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
            <header style={{ marginBottom: 40 }}>
                <a href="/dashboard" style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>&larr; Back to Dashboard</a>
                <h2 style={{ fontSize: "2rem", marginTop: 10 }}>Agent Chat</h2>
            </header>

            <div className="glass-panel" style={{ height: 500, display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1, overflowY: "auto", marginBottom: 20, paddingRight: 10 }}>
                    {history.length === 0 && (
                        <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 100 }}>
                            <p>Start a conversation with the AI Agent.</p>
                            <p style={{ fontSize: "0.9rem" }}>Try "Help me plan a marketing campaign" or "Summarize this text"</p>
                        </div>
                    )}
                    {history.map((msg, idx) => (
                        <div key={idx} style={{ marginBottom: 20, textAlign: msg.type === "user" ? "right" : "left" }}>
                            <div style={{
                                display: "inline-block",
                                padding: "12px 18px",
                                borderRadius: 12,
                                background: msg.type === "user" ? "var(--accent-blue)" : "rgba(255,255,255,0.1)",
                                color: "white",
                                maxWidth: "80%"
                            }}>
                                <strong style={{ display: "block", fontSize: "0.8rem", marginBottom: 5, opacity: 0.7 }}>
                                    {msg.type === "user" ? "You" : "Agent"}
                                </strong>
                                <p style={{ margin: 0, lineHeight: 1.5 }}>{msg.content.response_text || msg.content}</p>
                                {msg.content.audio_content && (
                                    <div style={{ marginTop: 10 }}>
                                        <audio controls src={`data:audio/mpeg;base64,${msg.content.audio_content}`} style={{ width: "100%" }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ textAlign: "left" }}>
                            <span style={{ display: "inline-block", padding: "10px 20px", background: "rgba(255,255,255,0.05)", borderRadius: 20, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                Agent is thinking...
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", gap: 10, borderTop: "1px solid var(--glass-border)", paddingTop: 20 }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        style={{ flex: 1 }}
                        placeholder="Type your message..."
                    />
                    <button onClick={handleSend} className="btn-primary" disabled={loading}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgentChat;
