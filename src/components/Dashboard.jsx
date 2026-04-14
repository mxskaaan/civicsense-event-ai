import { Activity, Users, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

const StatusBadge = ({ status }) => {
  return (
    <div className={`status-badge status-${status}`}>
      {status === 'high' && <AlertCircle size={14} />}
      {status === 'medium' && <Clock size={14} />}
      {status === 'low' && <CheckCircle size={14} />}
      <span style={{ textTransform: 'capitalize' }}>{status}</span>
    </div>
  );
}

const ProgressBar = ({ level, status }) => {
  const getGradient = () => {
    if (status === 'low') return 'var(--secondary-gradient)';
    if (status === 'medium') return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    return 'var(--warning-gradient)';
  };

  return (
    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
      <div 
        style={{ 
          height: '100%', 
          width: `${level}%`, 
          background: getGradient(),
          transition: 'width 0.5s ease-in-out, background 0.5s ease-in-out'
        }} 
      />
    </div>
  );
}

export const Dashboard = () => {
  const { gates, facilities } = useSimulation();

  return (
    <div className="dashboard-section glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Activity color="#6366f1" />
        <h2 className="dashboard-title" style={{ margin: 0 }}>Live Venue Status</h2>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} /> Entry Gates
        </h3>
        <div className="grid-2">
          {gates.map(gate => (
            <div key={gate.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{gate.name}</span>
                <StatusBadge status={gate.status} />
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Crowd Level</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>{gate.crowdLevel}%</span>
              </div>
              <ProgressBar level={gate.crowdLevel} status={gate.status} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} /> Facilities
        </h3>
        <div className="glass-card" style={{ padding: '0.5rem 1.5rem' }}>
          {facilities.map(fac => (
            <div key={fac.id} className="facility-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{fac.name}</div>
                <ProgressBar level={fac.crowdLevel} status={fac.status} />
              </div>
              <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end' }}>
                <StatusBadge status={fac.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
