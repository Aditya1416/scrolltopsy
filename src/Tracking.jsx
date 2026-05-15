import React, { useState, useEffect, memo } from 'react';

// PERF: only this component re-renders on interval tick
const Tracking = memo(function Tracking({ onFinish }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let startTs = sessionStorage.getItem('sct_session_start');
        if (!startTs) {
            startTs = Date.now().toString();
            sessionStorage.setItem('sct_session_start', startTs);
        }
        
        const updateTimer = () => {
            const elapsed = Math.floor((Date.now() - parseInt(startTs, 10)) / 1000);
            setSeconds(elapsed);
        };

        const interval = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(interval);
    }, []);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60).toString();
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return (
            <>
                {mins}<span className="timer-colon">:</span>{secs}
            </>
        );
    };

    const handleFinish = () => {
        const startTs = sessionStorage.getItem('sct_session_start');
        const durationMins = startTs ? Math.ceil((Date.now() - parseInt(startTs, 10)) / 60000) : 1;
        onFinish(durationMins * 60); // Passing in seconds for backwards compat with App.jsx
    };

    return (
        <div className="view-container tracking-view">
            <div className="watermark">scrolltopsy active session</div>
            <div className="timer">{formatTime(seconds)}</div>
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
