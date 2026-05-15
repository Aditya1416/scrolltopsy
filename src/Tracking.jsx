import React, { useState, useEffect, memo } from 'react';

// PERF: only this component re-renders on interval tick
const Tracking = memo(function Tracking({ onFinish }) {
    const [display, setDisplay] = useState('0:00');

    useEffect(() => {
        const tick = () => {
            let start = sessionStorage.getItem('sct_start');
            if (!start) {
                start = Date.now().toString();
                sessionStorage.setItem('sct_start', start);
            }
            const elapsed = Math.floor((Date.now() - parseInt(start, 10)) / 1000);
            const m = Math.floor(elapsed / 60);
            const s = elapsed % 60;
            setDisplay(`${m}:${s.toString().padStart(2, '0')}`);
        };
        tick(); // run immediately on mount
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                // App foregrounded — the next interval tick will
                // recalculate from the stored timestamp automatically.
                // No action needed here — the timestamp approach handles it.
                // This listener exists to confirm the pattern is in place.
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    const handleFinish = () => {
        const start = parseInt(sessionStorage.getItem('sct_start') || Date.now().toString());
        const durationMins = Math.max(1, Math.ceil((Date.now() - start) / 60000));
        // navigate to shame report with duration in seconds (for App.jsx backwards compatibility)
        onFinish(durationMins * 60);
    };

    return (
        <div className="view-container tracking-view">
            <div className="watermark">scrolltopsy active session</div>
            <div className="timer">
                {display.split(':')[0]}<span className="timer-colon">:</span>{display.split(':')[1]}
            </div>
            <div className="status">the algorithm has you now</div>
            
            <div className="action-container">
                <div className="footnote">"Your potential is leaking out of your thumbs."</div>
                <button onClick={handleFinish} className="action-im-done">
                    i'm done
                </button>
            </div>
        </div>
    );
});

export default Tracking;
