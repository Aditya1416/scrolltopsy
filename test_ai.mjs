import { SHAME_DICTIONARY, selectTier, getShameMessage } from './src/lib/ai.js';

const total = Object.values(SHAME_DICTIONARY).reduce((acc, pool) => acc + pool.length, 0);
console.log(`TOTAL MESSAGES: ${total}\n`);

const s1 = getShameMessage(2, null, 1);
console.log(`SESSION 1 (2 min, Tier 1): ${s1.message}`);

const s2 = getShameMessage(12, s1.id, 2);
console.log(`SESSION 2 (12 min, Tier 2): ${s2.message}`);

const s3 = getShameMessage(45, s2.id, 3);
console.log(`SESSION 3 (45 min, Tier 4): ${s3.message}`);

const s4 = getShameMessage(45, s3.id, 4);
console.log(`SESSION 4 (45 min, Tier 4, different message): ${s4.message}`);

console.log(`\nSample Tier 3: ${getShameMessage(25, null, 1).message}`);
console.log(`Sample Tier 5: ${getShameMessage(90, null, 1).message}`);
