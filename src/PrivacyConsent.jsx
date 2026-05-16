import React, { useState, useRef } from 'react';

const TODAY = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});

const POLICY_SECTIONS = [
  {
    heading: 'what we collect (with your consent)',
    items: [
      'your google display name and profile photo, used only to greet you',
      'your email address, stored encrypted, never shared or sold',
      'aggregated weekly scroll stats (total minutes per week, session count)',
      'your scrolltype classification',
      'your worst hour and worst day of the week',
    ],
  },
  {
    heading: 'what we never collect',
    items: [
      'individual session timestamps or precise timing',
      'which apps or platforms you scrolled',
      'any content you viewed',
      'device identifiers or IP addresses',
      'location data',
    ],
  },
  {
    heading: 'how your data is protected',
    items: [
      'all data is encrypted with AES-256-GCM before leaving your device',
      'your encryption key is derived from your user ID using PBKDF2 (100,000 iterations)',
      'even scrolltopsy cannot read your encrypted data',
      'firebase firestore security rules ensure only you can access your document',
    ],
  },
  {
    heading: 'your rights',
    items: [
      'delete all your data at any time: settings → delete all my data',
      'use the app entirely without an account — all features work locally',
      'signing in is always optional',
    ],
  },
  {
    heading: 'data retention',
    items: [
      'your data stays in firestore until you delete your account',
      'weekly stats are capped at 52 weeks (1 year rolling)',
      'accountability tokens expire automatically after 7 days',
    ],
  },
  {
    heading: 'third parties',
    items: [
      'firebase (google) processes authentication and stores encrypted data',
      'no other third parties receive any data',
      'no advertising networks, no analytics platforms, no data brokers',
    ],
  },
];

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '16px',
    background: '#0a0a0a',
    fontFamily: 'var(--font-mono, "Geist Mono", monospace)',
    boxSizing: 'border-box',
  },
  header: {
    fontSize: '11px',
    color: '#E24B4A',
    letterSpacing: '0.08em',
    marginBottom: '4px',
    flexShrink: 0,
  },
  version: {
    fontSize: '10px',
    color: '#E24B4A',
    marginBottom: '16px',
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px',
    marginBottom: '12px',
  },
  sectionHeading: {
    fontSize: '10px',
    color: '#f0f0f0',
    marginTop: '20px',
    marginBottom: '8px',
    textTransform: 'lowercase',
  },
  item: {
    fontSize: '10px',
    color: '#555',
    lineHeight: '1.7',
    paddingLeft: '12px',
    marginBottom: '2px',
  },
  footer: {
    fontSize: '10px',
    color: '#444',
    marginTop: '24px',
    lineHeight: '1.7',
    borderTop: 'none',
    paddingTop: '16px',
  },
  hint: {
    fontSize: '10px',
    color: '#E24B4A',
    textAlign: 'center',
    padding: '6px 0',
    flexShrink: 0,
    letterSpacing: '0.05em',
  },
  acceptBtn: {
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: '13px',
    letterSpacing: '0.05em',
    padding: '12px 0',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    flexShrink: 0,
  },
  decline: {
    fontSize: '10px',
    color: '#2e2e2e',
    cursor: 'pointer',
    padding: '8px 0',
    flexShrink: 0,
  },
};

export default function PrivacyConsent({ user, onAccept, onDecline }) {
  const [canAccept, setCanAccept] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 10) {
      setCanAccept(true);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>scrolltopsy</div>
      <div style={s.version}>privacy policy · v1.0 · {TODAY}</div>

      <div ref={scrollRef} onScroll={handleScroll} style={s.scroll}>
        {POLICY_SECTIONS.map(({ heading, items }) => (
          <div key={heading}>
            <div style={s.sectionHeading}>{heading}</div>
            {items.map(item => (
              <div key={item} style={s.item}>— {item}</div>
            ))}
          </div>
        ))}

        <div style={s.footer}>
          <div style={{ marginBottom: '6px', color: '#444', fontSize: '10px' }}>contact</div>
          <div style={s.item}>null@scrolltopsy.com</div>
          <div style={{ marginTop: '20px', color: '#333', fontSize: '10px', lineHeight: '1.7' }}>
            by tapping "i accept" you confirm you have read and agree to this policy.
            the app works fully without an account. signing in is always optional.
          </div>
        </div>
      </div>

      {!canAccept && (
        <div style={s.hint}>↓ scroll to continue</div>
      )}

      <button
        style={{
          ...s.acceptBtn,
          color: canAccept ? '#f0f0f0' : '#2e2e2e',
          pointerEvents: canAccept ? 'auto' : 'none',
        }}
        onClick={() => onAccept(user)}
        disabled={!canAccept}
        aria-disabled={!canAccept}
      >
        i accept
      </button>

      <div style={s.decline} onClick={onDecline}>
        use without account →
      </div>
    </div>
  );
}
