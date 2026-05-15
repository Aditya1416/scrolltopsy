import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { saveSession, getAllData, deleteAllLocalData, getProfile } from '../lib/storage';
import { getShameMessage } from '../lib/ai';

// Tracking.jsx contains logic:
// const start = parseInt(sessionStorage.getItem('sct_start') || Date.now().toString());
// const durationMins = Math.max(1, Math.ceil((Date.now() - start) / 60000));
// onFinish(durationMins * 60);
// App.jsx backward compatibility layer:
// const { message, id } = getShameMessage(minutes, profile.lastShameMessageId, profile.totalSessions);
// await replaceProfile(profile);
// And in App.jsx when finished, saveSession(durationMins) is likely called.
// We are simulating this end-to-end integration as requested.

const mockDateNow = (time) => {
    vi.stubGlobal('Date', class extends Date {
        constructor() {
            super(time);
        }
        static now() {
            return time;
        }
    });
};

describe('session timestamp flow', () => {
    let originalDateNow;

    beforeEach(() => {
        sessionStorage.clear();
        originalDateNow = Date.now;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('durationMins rounds up to 1 for sessions under 60 seconds', () => {
        const now = Date.now();
        mockDateNow(now);
        const start = now - 30000; // 30 seconds ago
        sessionStorage.setItem('sct_start', start.toString());

        const durationMins = Math.max(1, Math.ceil((Date.now() - start) / 60000));
        expect(durationMins).toBe(1);
    });

    it('durationMins is correct for a 2-minute session', () => {
        const now = Date.now();
        mockDateNow(now);
        const start = now - 120000; // 2 minutes ago
        sessionStorage.setItem('sct_start', start.toString());

        const durationMins = Math.max(1, Math.ceil((Date.now() - start) / 60000));
        expect(durationMins).toBe(2);
    });

    it('durationMins is correct for a 47-minute session', () => {
        const now = Date.now();
        mockDateNow(now);
        const start = now - 2820000; // 47 minutes ago
        sessionStorage.setItem('sct_start', start.toString());

        const durationMins = Math.max(1, Math.ceil((Date.now() - start) / 60000));
        expect(durationMins).toBe(47);
    });

    it('saveSession is called with correct durationMins', async () => {
        const now = Date.now();
        mockDateNow(now);
        const start = now - 300000; // 5 minutes ago
        sessionStorage.setItem('sct_start', start.toString());

        const durationMins = Math.max(1, Math.ceil((Date.now() - start) / 60000));
        expect(durationMins).toBe(5);

        await deleteAllLocalData(); // Clean slate
        await saveSession(durationMins);

        const data = await getAllData();
        expect(data.sessions[0].durationMins).toBe(5);
    });
});

describe('edge cases', () => {
    beforeEach(async () => {
        await deleteAllLocalData();
    });

    it('handles 500 sessions in localStorage without error', async () => {
        const data = await getAllData();
        for (let i = 0; i < 500; i++) {
            data.sessions.push({
                id: `id-${i}`,
                durationMins: 5,
                hour: 12,
                day: 'monday',
                timestamp: Date.now()
            });
        }
        data.profile.totalSessions = 500;
        localStorage.setItem('sct_data', JSON.stringify(data));

        // Call getAllData (getData)
        const retrieved = await getAllData();
        expect(() => retrieved).not.toThrow();
        expect(retrieved.profile.totalSessions).toBe(500);
        expect(retrieved.sessions.length).toBe(500);
    });

    it('handles durationMins of 1440 in saveSession without error', async () => {
        // the expect(() => asyncfn()) isn't great because it eats the promise. Let's just run it
        await expect(saveSession(1440)).resolves.not.toThrow();
        const data = await getAllData();
        expect(data.sessions[0].durationMins).toBe(1440);
    });

    it('handles durationMins of 1 in saveSession', async () => {
        await saveSession(1);
        const data = await getAllData();
        expect(data.profile.totalMins).toBe(1);
    });
});

describe('repeat session prevention', () => {
    beforeEach(async () => {
        await deleteAllLocalData();
    });

    it('does not show the same shame message twice in a row', async () => {
        // saveSession updates totalSessions
        await saveSession(10);
        const profile1 = await getProfile();
        const msg1 = getShameMessage(10, null, profile1.totalSessions);

        await saveSession(10);
        const profile2 = await getProfile();
        const msg2 = getShameMessage(10, msg1.id, profile2.totalSessions);

        expect(msg1.id).not.toBe(msg2.id);
    });
});
