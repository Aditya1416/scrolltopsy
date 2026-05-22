import React from 'react';

export default function Privacy({ onBack }) {
    return (
        <div className="view-container" style={{ paddingTop: '32px' }}>
            <div className="header">privacy policy</div>
            
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '24px', lineHeight: '1.5' }}>
                <p style={{ marginBottom: '16px' }}>
                    <strong>What is stored locally:</strong><br />
                    Sessions, profile stats, worst hours/days. Stored safely in your browser.
                </p>
                <p style={{ marginBottom: '16px' }}>
                    <strong>What is never stored:</strong><br />
                    Device IDs, content viewed, IP addresses, platform names.
                </p>
                <p style={{ marginBottom: '16px' }}>
                    <strong>What goes to Firestore (if you back up):</strong><br />
                    Aggregated stats only, not individual session timestamps.
                </p>
                <p style={{ marginBottom: '16px' }}>
                    <strong>How to delete everything:</strong><br />
                    Use the settings gear -&gt; delete all my data.
                </p>
                <p style={{ marginBottom: '16px' }}>
                    No data is sold. No third parties receive data.<br />
                    Contact: null@scrolltopsy.com
                </p>
            </div>
            
            <button onClick={onBack} className="action-done-now">go back</button>
        </div>
    );
}
