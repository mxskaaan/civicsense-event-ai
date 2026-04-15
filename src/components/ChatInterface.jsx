import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Key, KeyRound, AlertTriangle } from 'lucide-react';
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

  const TypingIndicator = () => (
    <div className="message assistant" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 16px' }}>
         {[0, 1, 2].map(i => (
            <div key={i} style={{
               width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%',
               animation: `typingBounce 1.4s infinite ease-in-out both ${i * 0.16}s`
            }} />
         ))}
         <style>{`
           @keyframes typingBounce {
             0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
             40% { transform: scale(1); opacity: 1; }
           }
           .hover-bg:hover { background: rgba(255,255,255,0.1) !important; }
         `}</style>
    </div>
  );

  if (showConfig) {
    return (
      <div className="chat-section glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', height: '100%' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '350px', width: '100%', textAlign: 'center' }}>
          <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '10px' }}>
            <KeyRound size={48} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Setup AI Access</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>Enter your Gemini API key to activate the intelligent stadium assistant.</p>
          <input
            type="password"
            className="chat-input"
            style={{ width: '100%', marginBottom: '10px', textAlign: 'center' }}
            placeholder="Paste API Key here..."
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button 
            className="action-chip" 
            style={{ width: '100%', background: 'var(--primary-gradient)', color: 'white', border: 'none', fontWeight: '600', padding: '12px', fontSize: '1rem' }} 
            onClick={handleSaveKey}
          >
            Activate AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-section glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Dynamic Background Glow */}
      <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--primary-gradient)', filter: 'blur(80px)', opacity: '0.3', zIndex: '0', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--secondary-gradient)', filter: 'blur(80px)', opacity: '0.2', zIndex: '0', pointerEvents: 'none' }}></div>

      <div style={{ position: 'relative', zIndex: '1', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* PREMIUM HEADER */}
        <div className="glass-card" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          marginBottom: '1rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <Bot color="#10b981" size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>CivicSense AI</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></div>
                <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '500' }}>Live Assistant</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowConfig(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }} className="hover-bg">
            <Key size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Mapped Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={handleBestGate}
              className="action-chip"
              style={{
                background: 'var(--secondary-gradient)',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}
            >
              <Sparkles size={16} /> Best Gate
            </button>
            <button className="action-chip" onClick={() => setInput('Where are the nearest restrooms?')} style={{ whiteSpace: 'nowrap' }}>
              Nearest Restroom?
            </button>
        </div>

        {/* CHAT HISTORY */}
        <div className="chat-history">
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {msg.type === 'user' ? (
                  <>You <User size={12} /></>
                ) : (
                  <><Bot size={12} /> AI</>
                )}
              </div>
              <div className={`message ${msg.type}`} style={{
                position: 'relative',
                border: msg.urgency === 'high' ? '1px solid #ef4444' : (msg.type === 'assistant' ? '1px solid var(--glass-border)' : 'none'),
                boxShadow: msg.urgency === 'high' ? '0 0 15px rgba(239, 68, 68, 0.2)' : '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                {msg.urgency === 'high' && <AlertTriangle size={16} color="#ef4444" style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--bg-base)', borderRadius: '50%', padding: '2px' }} />}
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', animation: 'fadeIn 0.3s ease' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Bot size={12} /> AI
              </div>
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '8px 12px',
          marginTop: 'auto'
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about crowd, optimal routes..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.95rem',
              outline: 'none',
              padding: '8px'
            }}
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim()}
            style={{
              background: input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              color: input.trim() ? 'white' : 'rgba(255,255,255,0.3)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: input.trim() ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            <Send size={18} style={{ marginLeft: input.trim() ? '-2px' : '0' }} />
          </button>
        </div>
      </div>
    </div>
  );
};