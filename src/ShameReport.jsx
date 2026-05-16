import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ShameReport({ onReset, durationSeconds, shameMessage, aiProgress }) {
    React.useEffect(() => {
        Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    }, []);

    React.useEffect(() => {
        sessionStorage.removeItem('sct_start');
    }, []);

    const minutes = Math.ceil(durationSeconds / 60);
    const napPercentage = Math.round((minutes / 20) * 100);

    return (
        <div className="view-container">
            <div className="header">autopsy complete</div>
            <div className="summary-value">{minutes}</div>
            <div className="summary-label">minutes of your life to an algorithm</div>
            
            <div className="grid">
                <div className="grid-item">
                    <div className="grid-label">pages read</div>
                    <div className="grid-value">0 Pages</div>
                </div>
                <div className="grid-item">
                    <div className="grid-label">steps missed</div>
                    <div className="grid-value">{minutes * 100} Steps</div>
                </div>
                <div className="grid-item">
                    <div className="grid-label">lines of code</div>
                    <div className="grid-value">0 Lines</div>
                </div>
                <div className="grid-item">
                    <div className="grid-label">fraction of a power nap</div>
                    <div className="grid-value">{napPercentage}%</div>
                </div>
            </div>

            <div className="verdict">{aiProgress || shameMessage}</div>

            <div className="ledger-row">
                <span>Current Session</span>
                <span className="session-duration">{minutes}m</span>
            </div>
            <div className="ledger-row">
                <span>Total Today</span>
                <span className="session-duration">{42 + minutes}m</span>
            </div>

            <div className="footer">
                <button onClick={onReset} className="action-done-now">i'm done for now</button>
            </div>
        </div>
    );
}
