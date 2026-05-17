import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AuthGate from './AuthGate';
import IdleHome from './IdleHome';
import Tracking from './Tracking';
import ShameReport from './ShameReport';
import Privacy from './Privacy';
import PrivacyConsent from './PrivacyConsent';
import WeekView from './pages/WeekView';
import { saveSession } from './lib/storage';
import { acceptPrivacyAndComplete, signOut } from './lib/auth';
import { auth, db } from './lib/firebase';
import { ai } from './lib/ai';
import './index.css';

function MainApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentView, setCurrentView] = useState('idle');
  const [user, setUser] = useState(null);
  const [pendingConsentUser, setPendingConsentUser] = useState(null);
  const [lastSessionDuration, setLastSessionDuration] = useState(0);
  const [shameMessage, setShameMessage] = useState('Analyzing behavior...');

  useEffect(() => {
    ai.loadModel();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthChecked(true);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists() && userDoc.data().privacyPolicyAcceptedAt) {
        setUser(firebaseUser);
      } else {
        setPendingConsentUser(firebaseUser);
        setCurrentView('consent');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  const handleAcceptPrivacy = async (u) => {
    await acceptPrivacyAndComplete(u);
    setUser(u);
    setPendingConsentUser(null);
    setCurrentView('idle');
  };

  const handleDeclinePrivacy = async () => {
    await signOut();
    setPendingConsentUser(null);
    setCurrentView('idle');
  };

  const handleStartTracking = () => setCurrentView('tracking');

  const handleFinishTracking = async (durationSeconds) => {
    const mins = Math.ceil(durationSeconds / 60);
    setLastSessionDuration(durationSeconds);
    await saveSession(mins);
    setCurrentView('report');

    setShameMessage('Analyzing behavior...');
    try {
      const msg = await ai.generateShameMessage(mins);
      setShameMessage(msg);
    } catch (e) {
      setShameMessage('This time is gone forever.');
    }
  };

  const handleReset = () => setCurrentView('idle');
  const handleShowPrivacy = () => setCurrentView('privacy');

  // Blank while Firebase resolves auth state
  if (!authChecked) return null;

  // Mandatory sign-in gate
  if (!user && !pendingConsentUser) return <AuthGate />;

  return (
    <>
      {currentView === 'consent' && (
        <PrivacyConsent
          user={pendingConsentUser}
          onAccept={handleAcceptPrivacy}
          onDecline={handleDeclinePrivacy}
        />
      )}
      {currentView === 'idle' && (
        <IdleHome
          onStartTracking={handleStartTracking}
          onShowPrivacy={handleShowPrivacy}
          user={user}
        />
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/week/:token" element={<WeekView />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
