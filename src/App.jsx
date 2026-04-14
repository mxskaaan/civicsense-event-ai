import React from 'react';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { Map, Zap } from 'lucide-react';

function App() {
  return (
    <div className="app-container">
      <header className="header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'var(--primary-gradient)', 
            padding: '8px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Map color="white" size={24} />
          </div>
          <h1 className="header-title">CivicSense Event AI</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-badge" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
            <Zap size={14} /> Live AI Integration
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Demo Venue: Olympic Stadium
          </div>
        </div>
      </header>

      <main className="main-content">
        <ChatInterface />
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
