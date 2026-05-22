import React, { useState, useEffect, useMemo } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getPersonalisedShameContext, getContextualSuffix } from './lib/learningEngine';
import ShameParticles from './components/ShameParticles';

function formatTodayTime(mins) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
}

function getDateId() {
  const d = new Date();
  return `SCR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

export default function ShameReport({
  onReset,
  onGoAgain = () => {},
  durationSeconds,
  shameMessage,
  todayTotalMins = 0,
}) {
  const [phase, setPhase] = useState(0);
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [messageCursor, setMessageCursor] = useState(false);

  // Haptic punch + clear session timer
  useEffect(() => {
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    sessionStorage.removeItem('sct_start');
  }, []);

  // Choreographed phase timeline
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 300),
      setTimeout(() => setPhase(3), 900),
      setTimeout(() => setPhase(4), 1200),
      setTimeout(() => setPhase(5), 1400),
      setTimeout(() => setPhase(6), 1800),
      setTimeout(() => setPhase(7), 2400),
      setTimeout(() => setPhase(8), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const minutes = Math.ceil(durationSeconds / 60);
  const shameContext = getPersonalisedShameContext(minutes);
  const suffix = getContextualSuffix(shameContext);
  const isAnalysing = shameMessage === 'Analyzing behavior...';
  const verdict = isAnalysing || !suffix ? shameMessage : `${shameMessage} ${suffix}`;

  // Physician's note typewriter — restarts when message arrives from async AI
  useEffect(() => {
    if (phase < 6) return;

    if (isAnalysing) {
      setDisplayedMessage('analyzing...');
      setMessageCursor(false);
      return;
    }

    setDisplayedMessage('');
    setMessageCursor(false);
    let i = 0;
    const text = verdict;
    const id = setInterval(() => {
      i++;
      setDisplayedMessage(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setMessageCursor(true);
      }
    }, 20);
    return () => clearInterval(id);
  }, [phase, verdict, isAnalysing]);

  const profileData = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('sct_data') || '{}').profile || {}; }
    catch { return {}; }
  }, []);

  const patterns = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('sct_patterns') || '{}'); }
    catch { return {}; }
  }, []);

  const sessionCountToday = patterns.sessionCountToday || 1;
  const scrolltype = profileData.scrolltype;

  // Show the classification card only once per browser session
  const [showScrolltypeCard] = useState(() => {
    if (scrolltype && !sessionStorage.getItem('sct_cls_shown')) {
      sessionStorage.setItem('sct_cls_shown', '1');
      return true;
    }
    return false;
  });

  const ledger = [
    { label: 'pages you could have read',   value: Math.max(0, Math.floor(minutes * 0.7)) },
    { label: 'steps you could have walked', value: (minutes * 110).toLocaleString() },
    { label: 'fraction of a power nap',     value: `${Math.round((minutes / 20) * 100)}%` },
    { label: 'seconds sacrificed',          value: (minutes * 60).toLocaleString() },
  ];

  return (
    <div className="report-screen">
      <ShameParticles active={phase >= 2} />

      {/* Metadata — fades in at 100ms */}
      <div className="report-meta" style={{ opacity: phase >= 1 ? 1 : 0 }}>
        <div>{getDateId()}</div>
        <div>autopsy complete</div>
      </div>

      {/* THE NUMBER — materialises at 300ms */}
      <div className="report-number-block">
        <div className={`report-number ${phase >= 2 ? 'visible' : 'hidden'}`}>
          {minutes}
        </div>
        <div
          className="report-minutes-label"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 400ms, transform 400ms',
          }}
        >
          minutes unrecoverable
        </div>
      </div>

      {/* Divider line draws in at 1200ms */}
      <div className="report-divider" style={{ opacity: phase >= 4 ? 1 : 0 }}>
        <div className="report-divider-inner" style={{ width: phase >= 4 ? '100%' : '0%' }} />
      </div>

      {/* Equivalence ledger with dot-leaders */}
      <div className="ledger">
        {ledger.map((item, i) => (
          <div
            key={item.label}
            className={`ledger-item ${phase >= 5 ? 'visible' : 'hidden'}`}
            style={{ transitionDelay: phase >= 5 ? `${i * 80}ms` : '0ms' }}
          >
            <span className="ledger-label">{item.label}</span>
            <span className="ledger-dots" />
            <span className="ledger-value">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Physician's note — typewriter at 1800ms */}
      <div className="physician-note glass" style={{ opacity: phase >= 6 ? 1 : 0 }}>
        <span className="physician-note-text">{displayedMessage}</span>
        {messageCursor && <span className="physician-cursor" />}
      </div>

      {/* Session stats row */}
      <div className="stats-row" style={{ opacity: phase >= 7 ? 1 : 0 }}>
        <span>current: {minutes}m</span>
        <span className="stats-divider">|</span>
        <span>today: {formatTodayTime(todayTotalMins)}</span>
        <span className="stats-divider">|</span>
        <span>sessions: {sessionCountToday}</span>
      </div>

      {/* Scrolltype flip card — first time per session */}
      {showScrolltypeCard && scrolltype && (
        <div className={`scrolltype-card ${phase >= 8 ? 'visible' : 'hidden'}`}>
          <div className="scrolltype-card-label">classification confirmed.</div>
          <div className="scrolltype-card-value">{scrolltype}</div>
        </div>
      )}

      {/* Footnotes — always present, ghost text */}
      <div className="report-footnotes">
        <button className="footnote-btn" onClick={onGoAgain}>go again</button>
        <button className="footnote-btn" onClick={onReset}>i'm done for now</button>
      </div>
    </div>
  );
}
