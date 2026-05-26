import React from 'react';

export default function Privacy({ onBack, standalone }) {
    const handleBack = () => {
        if (standalone) {
            window.history.back();
        } else if (onBack) {
            onBack();
        }
    };

    return (
        <div className="view-container" style={{ paddingTop: standalone ? '48px' : '32px', maxWidth: '600px', margin: '0 auto' }}>
            {standalone && (
                <div style={{ fontSize: '10px', color: '#555', marginBottom: '24px', letterSpacing: '2px' }}>
                    scrolltopsy
                </div>
            )}
            <div className="header" style={{ marginBottom: '24px' }}>privacy policy</div>

            <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '20px', color: '#aaa' }}>
                    last updated: may 2026
                </p>

                <p style={{ marginBottom: '8px', color: '#ccc', fontWeight: 'bold' }}>what is stored locally</p>
                <p style={{ marginBottom: '20px' }}>
                    sessions, profile stats, worst hours/days. stored in your browser's localStorage or on your device.
                    never transmitted unless you explicitly back up.
                </p>

                <p style={{ marginBottom: '8px', color: '#ccc', fontWeight: 'bold' }}>what is never stored</p>
                <p style={{ marginBottom: '20px' }}>
                    device IDs, content viewed, IP addresses, platform names, individual app usage timestamps.
                    no analytics, no tracking pixels, no fingerprinting.
                </p>

                <p style={{ marginBottom: '8px', color: '#ccc', fontWeight: 'bold' }}>what goes to firestore (if you back up)</p>
                <p style={{ marginBottom: '20px' }}>
                    weekly aggregates only — total minutes per category per week.
                    raw session data never leaves your device.
                    data is encrypted with AES-256-GCM before upload.
                </p>

                <p style={{ marginBottom: '8px', color: '#ccc', fontWeight: 'bold' }}>how to delete everything</p>
                <p style={{ marginBottom: '20px' }}>
                    settings → delete all my data. this removes local data and, if signed in, deletes your firestore record and firebase auth account.
                </p>

                <p style={{ marginBottom: '8px', color: '#ccc', fontWeight: 'bold' }}>third parties</p>
                <p style={{ marginBottom: '20px' }}>
                    firebase (google) is used for optional authentication and backup only.
                    no data is sold. no other third parties receive data.
                </p>

                <p style={{ marginBottom: '8px', color: '#ccc', fontWeight: 'bold' }}>android permissions</p>
                <p style={{ marginBottom: '20px' }}>
                    <strong>usage stats access</strong> — required to automatically detect which apps you're using.
                    data stays on device, never uploaded raw.<br />
                    <strong>notifications</strong> — required for shame notifications when you exceed quotas.<br />
                    <strong>foreground service</strong> — required for background tracking to work when the app is closed.
                </p>

                <p style={{ marginBottom: '32px' }}>
                    contact: <a href="mailto:aditya161499@gmail.com" style={{ color: '#E24B4A' }}>aditya161499@gmail.com</a>
                </p>
            </div>

            <button onClick={handleBack} className="action-done-now">← go back</button>
        </div>
    );
}
