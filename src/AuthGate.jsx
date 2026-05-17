import React, { useState } from 'react';
import { signInWithGoogle } from './lib/auth';

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '24px 16px',
    background: '#0a0a0a',
    fontFamily: 'var(--font-mono, "Geist Mono", monospace)',
    boxSizing: 'border-box',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: '11px',
    color: '#E24B4A',
    letterSpacing: '0.08em',
  },
  middle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: '22px',
    color: '#f0f0f0',
    lineHeight: 1.4,
    marginBottom: '12px',
  },
  sub: {
    fontSize: '10px',
    color: '#333',
    lineHeight: 1.8,
    marginBottom: '4px',
  },
  error: {
    fontSize: '10px',
    color: '#E24B4A',
    marginTop: '12px',
    letterSpacing: '0.03em',
  },
  btn: {
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: '13px',
    color: '#E24B4A',
    letterSpacing: '0.05em',
    padding: '12px 0',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
  },
  footer: {
    fontSize: '9px',
    color: '#222',
    lineHeight: 1.7,
  },
};

export default function AuthGate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.code || e.message);
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>scrolltopsy</div>

      <div style={s.middle}>
        <div style={s.tagline}>
          a post-mortem of<br />your scroll session.
        </div>
        <div style={s.sub}>track your doomscrolling.</div>
        <div style={s.sub}>see how much time you've lost.</div>
        <div style={s.sub}>get shamed by AI.</div>
        {error ? (
          <div style={s.error}>{error}</div>
        ) : null}
      </div>

      <div>
        <button style={s.btn} onClick={handleSignIn} disabled={loading}>
          {loading ? 'signing in...' : 'sign in with google →'}
        </button>
        <div style={s.footer}>
          your data is encrypted before leaving this device.<br />
          no ads. no tracking. sign-in is required to save your data.
        </div>
      </div>
    </div>
  );
}
