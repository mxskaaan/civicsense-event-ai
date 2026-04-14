import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Key, KeyRound } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { processQuery } from '../services/aiService';

export const ChatInterface = () => {
  const { gates, facilities } = useSimulation();
  
  // API Key mechanism
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [showConfig, setShowConfig] = useState(!localStorage.getItem('gemini_api_key'));

  const [messages, setMessages] = useState([
    { id: 1, type: 'assistant', text: 'Hello! I am your CivicSense Assistant powered by Google Gemini. I analyze live venue data dynamically to answer your needs. How can I help you today?', urgency: 'low' }
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

    // Call dynamic Gemini AI
    const response = await processQuery(userMsg.text, { gates, facilities }, apiKey);
    
    const assistantMsg = {
      id: Date.now() + 1,
      type: 'assistant',
      text: response.text,
      action: response.action,
      urgency: response.urgency || 'low'
    };
    
    setMessages(prev => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Setup prompt inside Chat window
  if (showConfig) {
    return (
      <div className="chat-section glass-panel" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <KeyRound size={48} color="#6366f1" style={{ marginBottom: '1rem' }} />
        <h2 className="dashboard-title">Gemini Setup Required</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          To use the dynamic generative AI features, you must provide a valid Google Gemini API Key.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '80%' }}>
          <input 
            type="password" 
            className="chat-input" 
            placeholder="Paste Gemini API Key..." 
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <button 
            className="chat-submit" 
            style={{ width: '100%', borderRadius: '30px' }}
            onClick={handleSaveKey}
          >
            Save Key Securely
          </button>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          (Key is stored exclusively in your local browser storage)
        </p>
      </div>
    );
  }

  const suggestedQueries = [
    "How crowded is Gate 1 right now?",
    "Where is the nearest washroom with no wait?",
    "I'm hungry, where should I get food?"
  ];

  return (
    <div className="chat-section glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot color="#10b981" />
          <div>
            <h2 className="dashboard-title" style={{ margin: 0 }}>CivicSense AI</h2>
            <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Gemini Connected
            </div>
          </div>
        </div>
        <button 
          onClick={() => { setShowConfig(true); setKeyInput(apiKey); }} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Update API Key"
        >
          <Key size={16} />
        </button>
      </div>

      <div className="chat-history">
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '2px' }}>
              {msg.type === 'assistant' ? <><Bot size={14} /> Gemini</> : <><User size={14} /> You</>}
            </div>
            
            <div className={`message ${msg.type}`} style={{
              border: msg.urgency === 'high' ? '1px solid #ef4444' : undefined,
              boxShadow: msg.urgency === 'high' ? '0 0 10px rgba(239, 68, 68, 0.3)' : undefined
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem', color: 'var(--text-muted)' }}>
            <Bot size={16} /> 
            <span style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Gemini is analyzing venue data...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="quick-actions">
          {suggestedQueries.map((q, i) => (
            <button key={i} className="action-chip" onClick={() => { setInput(q); }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-container" style={{ marginTop: '1rem' }}>
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Ask about gates, crowds, or facilities..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-submit" onClick={handleSend} disabled={!input.trim() || isTyping}>
          <Send size={20} style={{ marginLeft: '4px' }} />
        </button>
      </div>
    </div>
  );
};
