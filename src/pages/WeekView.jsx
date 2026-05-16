import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTokenData } from '../lib/accountability';

function shameLabel(mins) {
  if (mins < 30) return 'surprisingly restrained';
  if (mins < 60) return 'casual self-saboteur';
  if (mins < 120) return 'committed doomscroller';
  if (mins < 240) return 'deep void diver';
  return 'professional time waster';
}

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '24px 16px',
    background: '#0a0a0a',
    fontFamily: 'var(--font-mono, "Geist Mono", monospace)',
    boxSizing: 'border-box',
  },
  header: {
    fontSize: '11px',
    color: '#E24B4A',
    letterSpacing: '0.08em',
    marginBottom: '48px',
  },
  label: {
    fontSize: '10px',
    color: '#444',
    marginBottom: '8px',
  },
  stat: {
    fontSize: '72px',
    color: '#E24B4A',
    lineHeight: 1,
    marginBottom: '4px',
  },
  unit: {
    fontSize: '10px',
    color: '#333',
    marginBottom: '32px',
  },
  classification: {
    fontSize: '11px',
    color: '#f0f0f0',
    marginBottom: '8px',
  },
  sub: {
    fontSize: '10px',
    color: '#333',
    lineHeight: 1.7,
  },
  expiry: {
    fontSize: '10px',
    color: '#E24B4A',
    marginTop: 'auto',
    paddingTop: '24px',
  },
  error: {
    fontSize: '10px',
    color: '#444',
    marginTop: '48px',
  },
};

export default function WeekView() {
  const { token } = useParams();
  const [data, setData] = useState(undefined);

  useEffect(() => {
    getTokenData(token).then(setData).catch(() => setData(null));
  }, [token]);

  return (
    <div style={s.container}>
      <div style={s.header}>scrolltopsy</div>

      {data === undefined && (
        <div style={s.error}>loading...</div>
      )}

      {data === null && (
        <div style={s.error}>this link has expired or does not exist.</div>
      )}

      {data && (
        <>
          <div style={s.label}>this week</div>
          <div style={s.stat}>{data.weeklyMins}</div>
          <div style={s.unit}>minutes lost to the scroll</div>
          <div style={s.classification}>{shameLabel(data.weeklyMins)}</div>
          {data.createdAt && (
            <div style={s.sub}>
              shared on {data.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
          )}
          <div style={s.expiry}>
            expires {data.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </div>
        </>
      )}
    </div>
  );
}
