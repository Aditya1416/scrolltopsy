// PRIVACY: never log session content
// PRIVACY: never store device identifiers
// PRIVACY: never send raw timestamps to Firestore
// PRIVACY: Firestore receives aggregates only

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getSessions } from './storage';

export async function generateToken(uid) {
    const sessions = await getSessions();
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    
    // Calculates this week's totalMins from localStorage sessions
    const weeklyMins = sessions
        .filter(s => (now - s.timestamp) < oneWeekMs)
        .reduce((sum, s) => sum + s.durationMins, 0);
        
    const randomToken = crypto.randomUUID().slice(0, 12);
    
    await setDoc(doc(db, 'accountability', randomToken), {
        ownerUid: uid,
        weeklyMins: weeklyMins,
        expiresAt: now + oneWeekMs,
        createdAt: now
    });
    
    return randomToken;
}

export async function getTokenData(token) {
    const docSnap = await getDoc(doc(db, 'accountability', token));
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.expiresAt > Date.now()) {
            return { weeklyMins: data.weeklyMins };
        }
    }
    
    return null;
}
