import { useState, useEffect, useRef } from "react";
import { Send, Bot } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { processQuery } from "../services/aiService";

export const ChatInterface = () => {
  const { gates, facilities } = useSimulation();

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      text: "Hello! I am your CivicSense AI. I analyze live venue data to guide you smartly. Ask me anything!"
    }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const apiKey = localStorage.getItem("gemini_api_key");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🚨 Auto Alert
  useEffect(() => {
    const highGate = gates.find(g => g.crowdLevel > 85);

    if (highGate) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          type: "assistant",
          text: `⚠️ High congestion at ${highGate.name} (${highGate.crowdLevel}%). Avoid this gate.`,
          urgency: "high"
        }
      ]);
    }
  }, [gates]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const res = await processQuery(input, { gates, facilities }, apiKey);

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: "assistant",
      text: res.text,
      urgency: res.urgency
    }]);

    setIsTyping(false);
  };

  const handleBestGate = async () => {
    const query = "Suggest best gate";

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: "user",
      text: query
    }]);

    setIsTyping(true);

    const res = await processQuery(query, { gates, facilities }, apiKey);

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: "assistant",
      text: res.text,
      urgency: res.urgency
    }]);

    setIsTyping(false);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      backdropFilter: "blur(12px)",
      borderRadius: "16px",
      padding: "16px",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexDirection: "column",
      height: "100%"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "12px"
      }}>
        <Bot color="#00FFB2" />
        <div>
          <h3 style={{ margin: 0 }}>CivicSense AI</h3>
          <span style={{ color: "#00FFB2", fontSize: "0.8rem" }}>
            ● Live Assistant
          </span>
        </div>
      </div>

      {/* CHAT */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
            maxWidth: "75%"
          }}>
            <div style={{
              background: msg.type === "user"
                ? "linear-gradient(135deg,#6C63FF,#4f46e5)"
                : "rgba(255,255,255,0.06)",
              padding: "10px 14px",
              borderRadius: "14px",
              border: msg.urgency === "high" ? "1px solid red" : "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ fontSize: "0.8rem", color: "#00FFB2" }}>
            🤖 AI analyzing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* BUTTON */}
      <button
        onClick={handleBestGate}
        style={{
          background: "linear-gradient(135deg,#00FFB2,#00C9FF)",
          padding: "6px 12px",
          borderRadius: "8px",
          border: "none",
          fontSize: "0.8rem",
          fontWeight: "600",
          margin: "8px 0",
          cursor: "pointer",
          width: "fit-content"
        }}
      >
        ⚡ Suggest Best Gate
      </button>

      {/* INPUT BAR */}
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "12px",
        padding: "6px 8px"
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about crowd, gates..."
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            background: "transparent",
            color: "white",
            outline: "none"
          }}
        />

        <button
          onClick={handleSend}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer"
          }}
        >
          <Send size={18} color="#00FFB2" />
        </button>
      </div>

    </div>
  );
};