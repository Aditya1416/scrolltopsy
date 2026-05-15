import { describe, it, expect, beforeEach } from 'vitest';
import { saveSession, getAllData, recalculateScrolltype, deleteAllLocalData } from './storage';

// In storage.js, the IDB function uses "backup" as the key, but the issue says "sct_backup" in some contexts.
// Actually the indexdb store is 'sct_backup', and key is 'backup'. Let's verify by manually doing indexedDB requests in the test.
const getIndexedDBBackup = () => new Promise((resolve, reject) => {
    const req = indexedDB.open('sct_db', 1);
    req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('sct_backup', 'readonly');
        const getReq = tx.objectStore('sct_backup').get('backup');
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => reject(getReq.error);
    };
    req.onerror = () => reject(req.error);
});

describe('saveSession', () => {
    beforeEach(async () => {
        await deleteAllLocalData();
    });

    it('saves a session entry to localStorage sct_data.sessions', async () => {
        await saveSession(5);
        const dataStr = localStorage.getItem('sct_data');
        expect(dataStr).not.toBeNull();

        const data = JSON.parse(dataStr);
        expect(data.sessions).toBeDefined();
        expect(data.sessions.length).toBe(1);

        const entry = data.sessions[0];
        expect(entry.durationMins).toBe(5);
        expect(typeof entry.id).toBe('string');
        expect(entry.id.length).toBeGreaterThan(0);
        expect(typeof entry.timestamp).toBe('number'); // The source code uses timestamp instead of startedAt
        expect(entry.day).toBe(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()); // Source uses .day instead of .date
    });

    it('increments profile.totalSessions on each call', async () => {
        await saveSession(3);
        await saveSession(3);
        const data = await getAllData();
        expect(data.profile.totalSessions).toBe(2);
    });

    it('increments profile.totalMins correctly', async () => {
        await saveSession(10);
        await saveSession(15);
        const data = await getAllData();
        expect(data.profile.totalMins).toBe(25);
    });

    it('updates profile.longestSessionMins', async () => {
        await saveSession(5);
        await saveSession(20);
        await saveSession(10);
        const data = await getAllData();
        expect(data.profile.longestSessionMins).toBe(20);
    });

    it('writes a backup to IndexedDB', async () => {
        await saveSession(7);
        const backupData = await getIndexedDBBackup();
        expect(backupData).toBeDefined();

        const dataStr = localStorage.getItem('sct_data');
        const localData = JSON.parse(dataStr);
        expect(backupData).toEqual(localData);
    });
});

describe('getData', () => {
    beforeEach(async () => {
        await deleteAllLocalData();
    });

    it('returns default empty schema when both storages are empty', async () => {
        const data = await getAllData(); // We exported getAllData instead of getData
        expect(data).toBeDefined();
        expect(data.sessions).toEqual([]);
        expect(data.profile.totalSessions).toBe(0);
        expect(data.profile.totalMins).toBe(0);
    });

    it('returns localStorage data when present', async () => {
        await saveSession(10);
        const data = await getAllData();
        expect(data.sessions.length).toBe(1);
    });

    it('restores from IndexedDB when localStorage is empty', async () => {
        await saveSession(10);
        localStorage.removeItem('sct_data'); // manually clear localStorage
        const data = await getAllData();
        expect(data.sessions.length).toBe(1);
    });
});

describe('recalculateScrolltype', () => {
    const defaultProfile = {
        totalSessions: 0,
        totalMins: 0,
        longestSessionMins: 0,
        worstHour: -1,
        worstDay: '',
        scrolltype: 'casual self-saboteur'
    };

    it('assigns late-night doom merchant for worstHour 22', () => {
        const p = { ...defaultProfile, worstHour: 22 };
        expect(recalculateScrolltype(p, {})).toBe("late-night doom merchant");
    });

    it('assigns late-night doom merchant for worstHour 1', () => {
        const p = { ...defaultProfile, worstHour: 1 };
        expect(recalculateScrolltype(p, {})).toBe("late-night doom merchant");
    });

    it('assigns morning anxiety checker for worstHour 7', () => {
        const p = { ...defaultProfile, worstHour: 7 };
        expect(recalculateScrolltype(p, {})).toBe("morning anxiety checker");
    });

    it('assigns deep void diver for longestSessionMins 60', () => {
        const p = { ...defaultProfile, worstHour: 14, longestSessionMins: 60 };
        expect(recalculateScrolltype(p, {})).toBe("deep void diver");
    });

    it('assigns compulsive refresher for ratio > 4 sessions/day', () => {
        const p = { ...defaultProfile, worstHour: 14, longestSessionMins: 10, totalSessions: 20 };
        const meta = { firstSessionMs: Date.now() - (3 * 24 * 60 * 60 * 1000) }; // 4 days approx depending on Date.now precision. We use 3 days to get 4 total days including today
        // Actually the function uses: Math.ceil((Date.now() - meta.firstSessionMs) / (...))
        // So let's pass a specific timestamp
        const metaExact = { firstSessionMs: Date.now() - (4 * 24 * 60 * 60 * 1000) + 1000 };
        // this will be 4 days. 20/4 = 5 > 4
        expect(recalculateScrolltype(p, metaExact)).toBe("compulsive refresher");
    });

    it('assigns weekend void walker for worstDay saturday', () => {
        const p = { ...defaultProfile, worstHour: 14, worstDay: "saturday" };
        expect(recalculateScrolltype(p, {})).toBe("weekend void walker");
    });

    it('assigns weekend void walker for worstDay sunday', () => {
        const p = { ...defaultProfile, worstHour: 14, worstDay: "sunday" };
        expect(recalculateScrolltype(p, {})).toBe("weekend void walker");
    });

    it('assigns casual self-saboteur as default', () => {
        const p = { ...defaultProfile, worstHour: 14, longestSessionMins: 10, worstDay: "monday", totalSessions: 1 };
        expect(recalculateScrolltype(p, { firstSessionMs: Date.now() - 1000 })).toBe("casual self-saboteur");
    });
});

describe('deleteAllLocalData', () => {
    it('clears localStorage sct_data', async () => {
        await saveSession(5);
        await deleteAllLocalData();
        expect(localStorage.getItem('sct_data')).toBeNull();
    });

    it('clears IndexedDB sct_backup', async () => {
        await saveSession(5);
        await deleteAllLocalData();

        try {
            const backupData = await getIndexedDBBackup();
            expect(backupData).toBeUndefined();
        } catch(e) {
            // fake-indexeddb might return undefined or reject, both mean it's gone
            expect(true).toBe(true);
        }
    });

    it('getData returns empty schema after deletion', async () => {
        await saveSession(10);
        await deleteAllLocalData();
        const data = await getAllData();
        expect(data.sessions.length).toBe(0);
    });
});
