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
        <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
            <h2>Agent Chat</h2>
            <div style={{ border: "1px solid #ccc", padding: 20, height: 400, overflowY: "auto", marginBottom: 20 }}>
                {history.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: 15, textAlign: msg.type === "user" ? "right" : "left" }}>
                        <div style={{ display: "inline-block", padding: 10, borderRadius: 8, background: msg.type === "user" ? "#e3f2fd" : "#f5f5f5" }}>
                            <strong>{msg.type === "user" ? "You" : "Agent"}:</strong>
                            <p style={{ margin: "5px 0" }}>{msg.content.response_text || msg.content}</p>
                            {msg.content.audio_content && (
                                <audio controls src={`data:audio/mpeg;base64,${msg.content.audio_content}`} />
                            )}
                        </div>
                    </div>
                ))}
                {loading && <p>Agent is thinking...</p>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    style={{ flex: 1, padding: 10 }}
                    placeholder="Ask something..."
                />
                <button onClick={handleSend} style={{ padding: "10px 20px" }} disabled={loading}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default AgentChat;
