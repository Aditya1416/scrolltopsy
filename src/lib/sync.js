// PRIVACY: never log session content
// PRIVACY: never store device identifiers
// PRIVACY: never send raw timestamps to Firestore
// PRIVACY: Firestore receives aggregates only

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getProfile, replaceProfile } from './storage';

export async function syncToFirestore(uid) {
    const profile = await getProfile();
    
    // Build condensed stats object
    const condensed = {
        totalSessions: profile.totalSessions,
        totalMins: profile.totalMins,
        longestSessionMins: profile.longestSessionMins,
        scrolltype: profile.scrolltype,
        worstHour: profile.worstHour,
        worstDay: profile.worstDay,
        lastSyncDate: new Date().toISOString().split('T')[0],
        weeklyStats: [] // placeholder for last 52 weeks
    };
    
    // Writes to users/{uid}/scrolltopsy
    await setDoc(doc(db, 'users', uid, 'scrolltopsy', 'data'), condensed, { merge: true });
}

export async function restoreFromFirestore(uid) {
    const docRef = doc(db, 'users', uid, 'scrolltopsy', 'data');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const remote = docSnap.data();
        const local = await getProfile();
        
        // Merges with existing localStorage — only updates profile fields where Firestore value is larger
        if (remote.totalSessions > local.totalSessions) local.totalSessions = remote.totalSessions;
        if (remote.totalMins > local.totalMins) local.totalMins = remote.totalMins;
        if (remote.longestSessionMins > local.longestSessionMins) local.longestSessionMins = remote.longestSessionMins;
        
        local.scrolltype = remote.scrolltype || local.scrolltype;
        local.worstHour = remote.worstHour !== undefined ? remote.worstHour : local.worstHour;
        local.worstDay = remote.worstDay || local.worstDay;
        
        await replaceProfile(local);
        // Never touches the sessions array — individual sessions are local-only
    }
}
