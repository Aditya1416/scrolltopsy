import React, { useState, useEffect } from 'react';
import { getProfile, getSessions } from './lib/storage';
import { signInWithGoogle, signOut, deleteAccount } from './lib/auth';
import { syncToFirestore } from './lib/sync';
import { generateToken } from './lib/accountability';
import { maskEmail } from './lib/database';
import { auth } from './lib/firebase';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'good morning';
  if (h >= 12 && h < 17) return 'good afternoon';
  if (h >= 17 && h < 21) return 'good evening';
  return 'still up';
}

export default function IdleHome({ onStartTracking, onShowPrivacy, user }) {
    const [profile, setProfile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [tokenDisplay, setTokenDisplay] = useState(null);

    useEffect(() => {
        async function loadData() {
            const p = await getProfile();
            setProfile(p);
            const s = await getSessions();
            setSessions(s.slice(-3).reverse());
        }
        loadData();
    }, []);

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (e) {
            console.error(e);
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
            await syncToFirestore(auth.currentUser.uid);
            alert('Backup complete.');
            setShowSettings(false);
        } catch (e) {
            console.error(e);
            alert(`Backup failed: ${e.code || e.message}`);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAccount(auth.currentUser?.uid);
            window.location.reload();
        } catch (e) {
            console.error(e);
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
            console.error(e);
            alert(`Share failed: ${e.code || e.message}`);
        }
    };

    if (!profile) return null;

    const firstName = user?.displayName?.split(' ')[0];
    const greeting = getGreeting();

    return (
        <div className="view-container" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, cursor: 'pointer', fontSize: '10px', color: '#444' }} onClick={() => setShowSettings(!showSettings)}>
                ⚙
            </div>

            {showSettings && (
                <div style={{ position: 'absolute', top: 20, right: 0, background: '#0a0a0a', padding: '8px', zIndex: 10 }}>
                    {user ? (
                        <>
                            <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>{user.displayName}</div>
                            <div style={{ fontSize: '9px', color: '#333', marginBottom: '10px' }}>{maskEmail(user.email)}</div>
                            <button className="action-doomscroll" style={{ marginTop: 0, fontSize: '12px', color: '#888' }} onClick={handleSignOut}>sign out</button>
                        </>
                    ) : (
                        <button className="action-doomscroll" style={{ marginTop: 0, fontSize: '12px', color: '#888' }} onClick={handleSignIn}>sign in with google</button>
                    )}
                    <button className="action-doomscroll" style={{ marginTop: '8px', fontSize: '12px', color: '#888' }} onClick={handleBackup}>back up my data</button>
                    <button className="action-doomscroll" style={{ marginTop: '8px', fontSize: '12px', color: '#888' }} onClick={handleShare}>share this week</button>
                    <button className="action-doomscroll" style={{ marginTop: '8px', fontSize: '12px', color: '#E24B4A' }} onClick={handleDelete}>delete all my data</button>
                    {tokenDisplay && <div style={{ fontSize: '9px', marginTop: '8px', color: '#888' }}>{tokenDisplay}</div>}
                </div>
            )}

            <div className="header">scrolltopsy</div>

            {firstName && (
                <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>
                    {greeting}, {firstName}.
                </div>
            )}
            {profile.scrolltype && (
                <div style={{ fontSize: '10px', color: '#333', marginBottom: '8px' }}>
                    classification: {profile.scrolltype}
                </div>
            )}

            <div className="hero-stat">{profile.totalMins}</div>
            <div className="hero-label">min wasted today</div>
            <div className="session-list">
                {sessions.length === 0 && (
                    <div className="session-item" style={{ borderBottom: 'none' }}>
                        <span className="session-time">No sessions yet</span>
                    </div>
                )}
                {sessions.map(s => (
                    <div className="session-item" key={s.id}>
                        <span className="session-time">
                            {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="session-duration">{s.durationMins}m</span>
                    </div>
                ))}
            </div>
            <button onClick={onStartTracking} className="action-doomscroll">
                i'm about to doomscroll
            </button>
        </div>
    );
}
