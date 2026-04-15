import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Key, KeyRound } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { processQuery } from '../services/aiService';

export const ChatInterface = () => {
  const { gates, facilities } = useSimulation();

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [showConfig, setShowConfig] = useState(!localStorage.getItem('gemini_api_key'));

  const [messages, setMessages] = useState([
    { id: 1, type: 'assistant', text: 'Hello! I am your CivicSense AI. I analyze live venue data to guide you smartly. Ask me anything!', urgency: 'low' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 🚨 Emergency Alert System
  useEffect(() => {
    const highGate = gates.find(g => g.crowd > 85);

    if (highGate) {
      const alertMsg = {
        id: Date.now(),
        type: 'assistant',
        text: `⚠️ High congestion at ${highGate.name} (${highGate.crowd}%). Avoid immediately.`,
        urgency: 'high'
      };
      setMessages(prev => [...prev, alertMsg]);
    }
  }, [gates]);

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      localStorage.setItem('gemini_api_key', keyInput.trim());
      setApiKey(keyInput.trim());
      setShowConfig(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!apiKey && !showConfig) {
      setShowConfig(true);
      return;
    }

    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await processQuery(input, { gates, facilities }, apiKey);

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: 'assistant',
      text: response.text,
      urgency: response.urgency || 'low'
    }]);

    setIsTyping(false);
  };

  // 🚀 Best Gate Feature
  const handleBestGate = async () => {
    if (!apiKey && !showConfig) {
      setShowConfig(true);
      return;
    }

    const query = "Suggest best gate with lowest crowd right now";

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: query
    }]);

    setIsTyping(true);

    const response = await processQuery(query, { gates, facilities }, apiKey);

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: 'assistant',
      text: response.text,
      urgency: response.urgency || 'low'
    }]);

    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  if (showConfig) {
    return (
      <div className="chat-section glass-panel" style={{ textAlign: 'center' }}>
        <KeyRound size={48} color="#6366f1" />
        <h2>Gemini Setup Required</h2>
        <input
          type="password"
          placeholder="Paste API Key..."
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
        />
        <button onClick={handleSaveKey}>Save Key</button>
      </div>
    );
  }

  return (
    <div className="chat-section glass-panel">

      {/* PREMIUM HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1rem',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Bot color="#00FFB2" />
          <div>
            <h3>CivicSense AI</h3>
            <span style={{ color: '#00FFB2', fontSize: '0.8rem' }}>● Live Assistant</span>
          </div>
        </div>
        <Key />
      </div>

      {/* CHAT */}
      <div className="chat-history">
        {messages.map(msg => (
          <div key={msg.id}>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
              {msg.type === 'user' ? 'You' : 'AI'}
            </div>
            <div style={{
              background: msg.type === 'user'
                ? 'linear-gradient(135deg,#6C63FF,#4f46e5)'
                : 'rgba(255,255,255,0.05)',
              padding: '10px',
              borderRadius: '10px',
              border: msg.urgency === 'high' ? '1px solid red' : 'none'
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && <div>🤖 AI analyzing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* 🚀 BEST GATE BUTTON */}
      <button
        onClick={handleBestGate}
        style={{
          background: 'linear-gradient(135deg,#00FFB2,#00C9FF)',
          padding: '10px',
          borderRadius: '10px',
          marginBottom: '10px'
        }}
      >
        ⚡ Smart Suggest Best Gate
      </button>

      {/* INPUT */}
      <div className="chat-input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about crowd, gates..."
        />
        <button onClick={handleSend}>
          <Send size={20} />
        </button>
      </div>

    </div>
  );
};