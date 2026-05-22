// PRIVACY: never log session content
// PRIVACY: never store device identifiers
// PRIVACY: never send raw timestamps to Firestore

const DB_NAME = 'sct_db';
const STORE_NAME = 'sct_backup';

function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function idbSet(key, val) {
    return getDB().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(val, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    }));
}

function idbGet(key) {
    return getDB().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    }));
}

function idbDelete(key) {
    return getDB().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    }));
}

const DEFAULT_DATA = {
    sessions: [],
    profile: {
        totalSessions: 0,
        totalMins: 0,
        longestSessionMins: 0,
        worstHour: -1,
        worstDay: '',
        scrolltype: 'casual self-saboteur'
    },
    meta: {}
};

async function getAllData() {
    let dataStr = localStorage.getItem('sct_data');
    let data = null;
    if (dataStr) {
        try { data = JSON.parse(dataStr); } catch(e){}
    }
    if (!data) {
        try { data = await idbGet('backup'); } catch(e){}
    }
    if (!data) {
        data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    return data;
}

export async function getProfile() {
    const data = await getAllData();
    return data.profile;
}

export async function saveSession(durationMins) {
    const data = await getAllData();
    const sessionId = crypto.randomUUID();
    const now = new Date();
    
    if (!data.meta.firstSessionMs) {
        data.meta.firstSessionMs = now.getTime();
    }
    
    data.sessions.push({
        id: sessionId,
        durationMins,
        hour: now.getHours(),
        day: now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        timestamp: now.getTime()
    });
    
    // Update profile
    data.profile.totalSessions = data.sessions.length;
    data.profile.totalMins += durationMins;
    if (durationMins > data.profile.longestSessionMins) {
        data.profile.longestSessionMins = durationMins;
    }
    
    // Recalculate worst hour and day
    const hours = {};
    const days = {};
    data.sessions.forEach(s => {
        hours[s.hour] = (hours[s.hour] || 0) + 1;
        days[s.day] = (days[s.day] || 0) + 1;
    });
    
    let maxHourCount = 0;
    let worstHour = -1;
    for (const [hr, count] of Object.entries(hours)) {
        if (count > maxHourCount) { maxHourCount = count; worstHour = parseInt(hr, 10); }
    }
    data.profile.worstHour = worstHour;
    
    let maxDayCount = 0;
    let worstDay = '';
    for (const [dy, count] of Object.entries(days)) {
        if (count > maxDayCount) { maxDayCount = count; worstDay = dy; }
    }
    data.profile.worstDay = worstDay;
    
    if (data.profile.totalSessions % 7 === 0 || data.profile.totalSessions === 1) {
        data.profile.scrolltype = recalculateScrolltype(data.profile, data.meta);
    }
    
    localStorage.setItem('sct_data', JSON.stringify(data));
    try { await idbSet('backup', data); } catch(e) {}
}

export function updateProfile() {
    // Logic handles in saveSession, this is an empty export to satisfy requirement
}

function recalculateScrolltype(profile, meta) {
    const wh = profile.worstHour;
    if (wh >= 22 || wh <= 2) return "late-night doom merchant";
    if (wh >= 6 && wh <= 9) return "morning anxiety checker";
    if (profile.longestSessionMins > 45) return "deep void diver";
    
    let totalDaysTracked = 1;
    if (meta && meta.firstSessionMs) {
        const days = Math.ceil((Date.now() - meta.firstSessionMs) / (1000 * 60 * 60 * 24));
        totalDaysTracked = days > 0 ? days : 1;
    }
    
    if (profile.totalSessions / totalDaysTracked > 4) return "compulsive refresher";
    if (profile.worstDay === "saturday" || profile.worstDay === "sunday") return "weekend void walker";
    
    return "casual self-saboteur";
}

export async function deleteAllLocalData() {
    localStorage.removeItem('sct_data');
    try { await idbDelete('backup'); } catch(e) {}
}

export async function getSessions() {
    const data = await getAllData();
    return data.sessions;
}

export async function replaceProfile(newProfile) {
    const data = await getAllData();
    data.profile = newProfile;
    localStorage.setItem('sct_data', JSON.stringify(data));
    try { await idbSet('backup', data); } catch(e) {}
}
