import React, { useState, useEffect } from 'react';
import { getProfile, getSessions } from './lib/storage';
import { signInWithGoogle, signOut, deleteAccount } from './lib/auth';
import { syncToFirestore } from './lib/sync';
import { generateToken } from './lib/accountability';
import { maskEmail } from './lib/database';
import { auth } from './lib/firebase';
import { maybeAnalysePatternsToday, getPersonalisedGreeting } from './lib/learningEngine';
import { hasUsagePermission, requestUsagePermission } from './lib/usageStats';
import { getAppForSession } from './lib/appData';

const CIRCUMFERENCE = 2 * Math.PI * 88;

const APP_EMOJIS = {
  Instagram: '📸', TikTok: '🎵', YouTube: '▶', 'X / Twitter': '𝕏',
  Reddit: '🔴', Facebook: '👤', Snapchat: '👻', LinkedIn: '💼',
  Pinterest: '📌', Tumblr: '💙', Twitch: '🟣', BeReal: '📷',
};

function getAppEmoji(app) {
  return app ? (APP_EMOJIS[app] || '📱') : null;
}

function formatTimeRange(s) {
  const end = new Date(s.timestamp);
  const start = new Date(s.timestamp - s.durationMins * 60000);
  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)} — ${fmt(end)}`;
}

function getDateId() {
  const d = new Date();
  return `SCR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export default function IdleHome({ onStartTracking, onShowPrivacy, user }) {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [todayMins, setTodayMins] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [tokenDisplay, setTokenDisplay] = useState(null);
  const [usagePermission, setUsagePermission] = useState(null);
  const [arcOffset, setArcOffset] = useState(CIRCUMFERENCE);
  const [patterns, setPatterns] = useState({});

  useEffect(() => {
    async function loadData() {
      const p = await getProfile();
      const all = await getSessions();
      await maybeAnalysePatternsToday();

      const today = new Date().toDateString();
      const todayTotal = all
        .filter(s => new Date(s.timestamp).toDateString() === today)
        .reduce((sum, s) => sum + s.durationMins, 0);

      setTodayMins(todayTotal);
      setSessions(all.slice(-3).reverse());
      setProfile(p);

      try {
        setPatterns(JSON.parse(localStorage.getItem('sct_patterns') || '{}'));
      } catch {}

      // Trigger arc fill animation after a short delay
      const progress = Math.min(todayTotal / 60, 1);
      setTimeout(() => setArcOffset(CIRCUMFERENCE * (1 - progress)), 300);
    }

    loadData();
    hasUsagePermission().then(granted => setUsagePermission(granted));
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      alert(`Sign in failed: ${e.code || e.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowSettings(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackup = async () => {
    if (!auth.currentUser) {
      alert('Sign in first to back up your data.');
      return;
    }
    try {
      await auth.currentUser.getIdToken(true);
      await syncToFirestore(auth.currentUser.uid);
      alert('Backup complete.');
      setShowSettings(false);
    } catch (e) {
      alert(`Backup failed: ${e.code || e.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(auth.currentUser?.uid);
      window.location.reload();
    } catch {
      alert('Delete failed.');
    }
  };

  const handleShare = async () => {
    if (!auth.currentUser) {
      alert('Sign in first to share this week.');
      return;
    }
    try {
      const token = await generateToken(auth.currentUser.uid);
      setTokenDisplay(`scrolltopsy.vercel.app/week/${token}`);
    } catch (e) {
      alert(`Share failed: ${e.code || e.message}`);
    }
  };

  if (!profile) return null;

  const firstName = user?.displayName?.split(' ')[0];
  const sessionCountToday = patterns.sessionCountToday || 0;
  const totalSessions = profile.totalSessions || 0;
  const arcHasProgress = todayMins > 0;

  return (
    <div className="idle-screen dot-grid scan-lines">
      {/* Top bar — in document flow, no absolute positioning */}
      <div className="top-bar">
        <div className="meta-info">
          <span className="meta-label">{getDateId()}</span>
          <span className="meta-label">session {sessionCountToday}.{totalSessions}</span>
        </div>
        <button className="gear-btn" onClick={() => setShowSettings(true)}>⚙</button>
      </div>

      {/* Personalised greeting */}
      {firstName && (
        <div className="greeting">
          {getPersonalisedGreeting(firstName)}
        </div>
      )}

      {/* SVG arc — today's wasted time vs 60min budget */}
      <div className="arc-wrapper">
        <svg
          width="200" height="200" viewBox="0 0 200 200"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <circle cx="100" cy="100" r="88" fill="none" stroke="#1a1a1a" strokeWidth="10" />
          <circle
            cx="100" cy="100" r="88"
            fill="none"
            stroke="#E24B4A"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={arcOffset}
            transform="rotate(-90 100 100)"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: arcHasProgress ? 'drop-shadow(0 0 8px rgba(226,75,74,0.5))' : 'none',
            }}
          />
        </svg>
        <div className="arc-center-text">
          <span className="arc-number">{todayMins}</span>
          <span className="arc-unit">min wasted today</span>
        </div>
      </div>

      {/* Scrolltype classification badge */}
      {profile.scrolltype && (
        <div className="scrolltype-badge glass">
          {profile.scrolltype}
        </div>
      )}

      {/* Recent session log with app emoji */}
      <div className="session-log">
        {sessions.length === 0 ? (
          <div className="session-empty">no sessions yet</div>
        ) : sessions.map((s, i) => {
          const emoji = getAppEmoji(getAppForSession(s.id));
          return (
            <div
              className="session-row glass"
              key={s.id}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="session-time-range">{formatTimeRange(s)}</span>
              {emoji && <span className="session-app-emoji">{emoji}</span>}
              <span className="session-dur">{s.durationMins}m</span>
            </div>
          );
        })}
      </div>

      {/* Primary CTA */}
      <div className="cta-area">
        <div className="cta-divider" />
        <button className="cta-btn" onClick={onStartTracking}>
          i'm about to doomscroll
        </button>
      </div>

      {/* Settings bottom sheet — no floating widgets */}
      {showSettings && (
        <div className="bs-overlay" onClick={() => setShowSettings(false)}>
          <div className="bs-panel glass" onClick={e => e.stopPropagation()}>
            {user ? (
              <>
                <div className="bs-user-name">{user.displayName}</div>
                <div className="bs-user-email">{maskEmail(user.email)}</div>
                <button className="bs-row" onClick={handleSignOut}>sign out</button>
                <button className="bs-row" onClick={handleBackup}>back up my data</button>
                <button className="bs-row" onClick={handleShare}>share this week</button>
                {tokenDisplay && <div className="bs-token">{tokenDisplay}</div>}
                {usagePermission === false && (
                  <button className="bs-row" onClick={requestUsagePermission}>
                    enable app detection →
                  </button>
                )}
                <button className="bs-row bs-row-danger" onClick={handleDelete}>
                  delete all my data
                </button>
              </>
            ) : (
              <>
                <button className="bs-row" onClick={handleSignIn}>
                  sign in with google →
                </button>
                {usagePermission === false && (
                  <button className="bs-row" onClick={requestUsagePermission}>
                    enable app detection →
                  </button>
                )}
                <button className="bs-row" onClick={() => { setShowSettings(false); onShowPrivacy(); }}>
                  privacy policy
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
