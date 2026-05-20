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
import { saveSession, getSessions, getProfile, replaceProfile } from './lib/storage';
import { acceptPrivacyAndComplete, signOut } from './lib/auth';
import { auth, db } from './lib/firebase';
import { ai } from './lib/ai';
import { analysePatterns } from './lib/learningEngine';
import { detectTopApp } from './lib/usageStats';
import { storeAppForSession, normaliseName } from './lib/appData';
import { classifyWithApp } from './lib/appClassifier';
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
    const sessionEndMs = Date.now();
    const sessionStartMs = sessionEndMs - durationSeconds * 1000;

    setLastSessionDuration(durationSeconds);
    await saveSession(mins);

    // Detect which app was in foreground during the session
    const detected = await detectTopApp(sessionStartMs, sessionEndMs);
    if (detected) {
      const appName = normaliseName(detected.appName, detected.packageName);
      if (appName) {
        const sessions = await getSessions();
        const lastSession = sessions[sessions.length - 1];
        if (lastSession) storeAppForSession(lastSession.id, appName);
      }
    }

    // Re-analyse patterns with fresh session + app data
    const patterns = await analysePatterns();

    // Re-classify scrolltype with app awareness — update profile
    const profile = await getProfile();
    const newScrolltype = classifyWithApp(profile, patterns, patterns.topApp);
    if (newScrolltype !== profile.scrolltype) {
      await replaceProfile({ ...profile, scrolltype: newScrolltype });
    }

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
