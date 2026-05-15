import React, { useState, useEffect } from 'react';
import IdleHome from './IdleHome';
import Tracking from './Tracking';
import ShameReport from './ShameReport';
import Privacy from './Privacy';
import { saveSession } from './lib/storage';
import { ai } from './lib/ai';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('idle'); // 'idle', 'tracking', 'report', 'privacy'
  const [lastSessionDuration, setLastSessionDuration] = useState(0);
  const [shameMessage, setShameMessage] = useState('Analyzing behavior...');

  useEffect(() => {
    ai.loadModel();
  }, []);

  const handleStartTracking = () => {
    setCurrentView('tracking');
  };

  const handleFinishTracking = async (durationSeconds) => {
    const mins = Math.ceil(durationSeconds / 60);
    setLastSessionDuration(durationSeconds);
    await saveSession(mins);
    setCurrentView('report');
    
    setShameMessage("Analyzing behavior...");
    try {
        const msg = await ai.generateShameMessage(mins);
        setShameMessage(msg);
    } catch(e) {
        setShameMessage("This time is gone forever.");
    }
  };

  const handleReset = () => {
    setCurrentView('idle');
  };

  const handleShowPrivacy = () => {
    setCurrentView('privacy');
  };

  return (
    <>
      {currentView === 'idle' && (
        <IdleHome onStartTracking={handleStartTracking} onShowPrivacy={handleShowPrivacy} />
      )}
      {currentView === 'tracking' && (
        <Tracking onFinish={handleFinishTracking} />
      )}
      {currentView === 'report' && (
        <ShameReport 
          durationSeconds={lastSessionDuration} 
          onReset={handleReset} 
          shameMessage={shameMessage}
        />
      )}
      {currentView === 'privacy' && (
        <Privacy onBack={handleReset} />
      )}
    </>
  );
}

export default App;
