import React, { useState, useEffect, useRef, memo } from 'react';

const QUOTES = [
  '"Your potential is leaking out of your thumbs."',
  '"The feed always wins."',
  '"Another minute gone. The algorithm thanks you."',
  '"You were going to do something important."',
];

const STATUS_TEXT = 'the algorithm has you now.';

function getDateId() {
  const d = new Date();
  return `SCR-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function getSessionN() {
  try {
    const d = JSON.parse(localStorage.getItem('sct_data') || '{}');
    return (d.profile?.totalSessions || 0) + 1;
  } catch { return 1; }
}

const Tracking = memo(function Tracking({ onFinish }) {
  const [elapsed, setElapsed] = useState(0);
  const [minuteFlip, setMinuteFlip] = useState(false);
  const [secondsFlip, setSecondsFlip] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [quoteFading, setQuoteFading] = useState(false);
  const prevM = useRef(-1);
  const prevS = useRef(-1);

  // Timer — reads persisted start time so backgrounding doesn't break it
  useEffect(() => {
    const tick = () => {
      let start = sessionStorage.getItem('sct_start');
      if (!start) {
        start = Date.now().toString();
        sessionStorage.setItem('sct_start', start);
      }
      setElapsed(Math.floor((Date.now() - parseInt(start, 10)) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Per-digit flip detection
  useEffect(() => {
    const curM = Math.floor(elapsed / 60);
    const curS = elapsed % 60;

    if (prevM.current !== -1 && curM !== prevM.current) {
      setMinuteFlip(true);
      setTimeout(() => setMinuteFlip(false), 160);
    }
    if (prevS.current !== -1 && curS !== prevS.current) {
      setSecondsFlip(true);
      setTimeout(() => setSecondsFlip(false), 160);
    }

    prevM.current = curM;
    prevS.current = curS;
  }, [elapsed]);

  // Typewriter effect on mount
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypewriterText(STATUS_TEXT.slice(0, i));
      if (i >= STATUS_TEXT.length) {
        clearInterval(id);
        setTypewriterDone(true);
      }
    }, 40);
    return () => clearInterval(id);
  }, []);

  // Rotating quotes
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteFading(true);
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length);
        setQuoteFading(false);
      }, 200);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const handleFinish = () => {
    const start = parseInt(sessionStorage.getItem('sct_start') || Date.now().toString(), 10);
    const durationSeconds = Math.max(60, Math.floor((Date.now() - start) / 1000));
    onFinish(durationSeconds);
  };

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  const s0 = Math.floor(s / 10);
  const s1 = s % 10;

  return (
    <div className="tracking-screen">
      <div className="track-pulse-bg" />

      <div className="track-meta">
        <div>{getDateId()}</div>
        <div>session {getSessionN()}</div>
      </div>

      <div className="track-timer-area">
        <div className="track-timer alarm-glow">
          <span className={`track-timer-digit${minuteFlip ? ' flipping' : ''}`}>{m}</span>
          <span className="track-timer-colon">:</span>
          <span className={`track-timer-digit${secondsFlip ? ' flipping' : ''}`}>{s0}</span>
          <span className={`track-timer-digit${secondsFlip ? ' flipping' : ''}`}>{s1}</span>
        </div>
      </div>

      <div className={`track-status${typewriterDone ? ' done' : ''}`}>
        {typewriterText}
      </div>

      <div className="track-quote-area">
        <div className={`track-quote glass${quoteFading ? ' fading' : ''}`}>
          {QUOTES[quoteIdx]}
        </div>
      </div>

      <button className="track-done-btn" onClick={handleFinish}>
        i'm done
      </button>
    </div>
  );
});

export default Tracking;
