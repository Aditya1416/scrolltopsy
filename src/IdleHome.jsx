import React, { useState, useEffect } from 'react';
import { getProfile, getSessions } from './lib/storage';
import { signInWithGoogle, deleteAccount } from './lib/auth';
import { syncToFirestore } from './lib/sync';
import { generateToken } from './lib/accountability';
import { auth } from './lib/firebase';

export default function IdleHome({ onStartTracking, onShowPrivacy }) {
    const [profile, setProfile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [tokenDisplay, setTokenDisplay] = useState(null);

    useEffect(() => {
        async function loadData() {
            const p = await getProfile();
            setProfile(p);
            const s = await getSessions();
            // Show only last 3 for UI, or all. We'll show last 3 to match design.
            setSessions(s.slice(-3).reverse());
        }
        loadData();
    }, []);

    const handleBackup = async () => {
        try {
            const uid = auth.currentUser ? auth.currentUser.uid : await signInWithGoogle();
            await syncToFirestore(uid);
            alert('Backup complete.');
            setShowSettings(false);
        } catch (e) {
            console.error(e);
            alert('Backup failed.');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAccount();
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert('Delete failed.');
        }
    };

    const handleShare = async () => {
        try {
            const uid = auth.currentUser ? auth.currentUser.uid : await signInWithGoogle();
            const token = await generateToken(uid);
            setTokenDisplay(`scrolltopsy.com/share/${token}`);
        } catch (e) {
            console.error(e);
            alert('Share failed.');
        }
    };

    if (!profile) return null;

    return (
        <div className="view-container" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, cursor: 'pointer', fontSize: '10px', color: '#444' }} onClick={() => setShowSettings(!showSettings)}>
                ⚙
            </div>

            {showSettings && (
                <div style={{ position: 'absolute', top: 20, right: 0, background: '#0a0a0a', padding: '8px', zIndex: 10 }}>
                    <button className="action-doomscroll" style={{ marginTop: 0, fontSize: '12px', color: '#888' }} onClick={handleBackup}>back up my data</button>
                    <button className="action-doomscroll" style={{ marginTop: '8px', fontSize: '12px', color: '#888' }} onClick={handleShare}>share this week</button>
                    <button className="action-doomscroll" style={{ marginTop: '8px', fontSize: '12px', color: '#E24B4A' }} onClick={handleDelete}>delete all my data</button>
                    <button className="action-doomscroll" style={{ marginTop: '8px', fontSize: '10px', color: '#2e2e2e' }} onClick={() => { setShowSettings(false); onShowPrivacy && onShowPrivacy(); }}>privacy policy</button>
                    {tokenDisplay && <div style={{ fontSize: '9px', marginTop: '8px', color: '#888' }}>{tokenDisplay}</div>}
                </div>
            )}

            <div className="header">scrolltopsy</div>
            <div className="hero-stat">{profile.totalMins}</div>
            <div className="hero-label">min wasted globally</div>
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
