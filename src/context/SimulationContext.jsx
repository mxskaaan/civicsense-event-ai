import React, { createContext, useState, useEffect, useContext } from 'react';

const SimulationContext = createContext(null);

// Initial mock data
const initialGates = [
  { id: 'g1', name: 'Gate 1 (North)', crowdLevel: 85, status: 'high' },
  { id: 'g2', name: 'Gate 2 (East)', crowdLevel: 45, status: 'medium' },
  { id: 'g3', name: 'Gate 3 (South)', crowdLevel: 20, status: 'low' },
  { id: 'g4', name: 'Gate 4 (West)', crowdLevel: 60, status: 'medium' }
];

const initialFacilities = [
  { id: 'w1', name: 'Washroom A (Level 1)', crowdLevel: 30, status: 'low', type: 'washroom' },
  { id: 'w2', name: 'Washroom B (Level 2)', crowdLevel: 90, status: 'high', type: 'washroom' },
  { id: 'f1', name: 'Main Food Court', crowdLevel: 75, status: 'high', type: 'food' },
  { id: 'f2', name: 'Snack Bar (East)', crowdLevel: 25, status: 'low', type: 'food' },
];

const determineStatus = (level) => {
  if (level > 70) return 'high';
  if (level > 40) return 'medium';
  return 'low';
};

export const SimulationProvider = ({ children }) => {
  const [gates, setGates] = useState(initialGates);
  const [facilities, setFacilities] = useState(initialFacilities);

  // Simulate crowd fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setGates(prev => prev.map(gate => {
        // Random fluctuation between -10 and +10
        const change = Math.floor(Math.random() * 21) - 10;
        let newLevel = gate.crowdLevel + change;
        if (newLevel > 100) newLevel = 100;
        if (newLevel < 0) newLevel = 0;
        
        return { ...gate, crowdLevel: newLevel, status: determineStatus(newLevel) };
      }));

      setFacilities(prev => prev.map(fac => {
        const change = Math.floor(Math.random() * 15) - 7;
        let newLevel = fac.crowdLevel + change;
        if (newLevel > 100) newLevel = 100;
        if (newLevel < 0) newLevel = 0;
        
        return { ...fac, crowdLevel: newLevel, status: determineStatus(newLevel) };
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <SimulationContext.Provider value={{ gates, facilities }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
