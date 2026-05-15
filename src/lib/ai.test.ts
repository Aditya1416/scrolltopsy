import { describe, it, expect } from 'vitest';
import { selectTier, SHAME_DICTIONARY, getShameMessage } from './ai';

describe('selectTier', () => {
    it('returns tier1 for mins < 5', () => {
        expect(selectTier(4)).toBe('tier1');
    });
    it('returns tier2 for mins >= 5 and < 15', () => {
        expect(selectTier(5)).toBe('tier2');
        expect(selectTier(14)).toBe('tier2');
    });
    it('returns tier3 for mins >= 15 and < 30', () => {
        expect(selectTier(15)).toBe('tier3');
        expect(selectTier(29)).toBe('tier3');
    });
    it('returns tier4 for mins >= 30 and < 60', () => {
        expect(selectTier(30)).toBe('tier4');
        expect(selectTier(59)).toBe('tier4');
    });
    it('returns tier5 for mins >= 60', () => {
        expect(selectTier(60)).toBe('tier5');
        expect(selectTier(120)).toBe('tier5');
    });
    it('returns tier1 for mins === 1', () => {
        expect(selectTier(1)).toBe('tier1');
    });
    it('returns tier5 for mins === 1440', () => {
        expect(selectTier(1440)).toBe('tier5');
    });
});

describe('SHAME_DICTIONARY total count', () => {
    it('has at least 60 unique messages across all tiers', () => {
        const allMessages = Object.values(SHAME_DICTIONARY).flat();
        const uniqueMessages = new Set(allMessages);
        expect(uniqueMessages.size).toBeGreaterThanOrEqual(60);
    });

    it('has at least 10 messages per tier', () => {
        for (const tier of Object.keys(SHAME_DICTIONARY)) {
            expect(SHAME_DICTIONARY[tier].length).toBeGreaterThanOrEqual(10);
        }
    });
});

describe('getShameMessage', () => {
    it('returns object with message string and id string', () => {
        const result = getShameMessage(5, null, 1);
        expect(typeof result.message).toBe('string');
        expect(typeof result.id).toBe('string');
    });

    it('interpolates {mins} in the message', () => {
        const result = getShameMessage(23, null, 1);
        expect(result.message).toContain('23');
        expect(result.message).not.toContain('{mins}');
    });

    it('returns a tier1 message for 2 minutes', () => {
        const result = getShameMessage(2, null, 1);
        expect(result.id.startsWith('tier1')).toBe(true);
    });

    it('returns a tier5 message for 90 minutes', () => {
        const result = getShameMessage(90, null, 1);
        expect(result.id.startsWith('tier5')).toBe(true);
    });

    it('avoids repeating the lastMessageId', () => {
        // Find a specific message and set it as lastMessageId
        // getShameMessage logic handles rotate based on sessionCountToday % source.length
        // We can just call it twice with same inputs but update the lastMessageId to ensure it avoids it
        const result1 = getShameMessage(10, null, 1);
        const result2 = getShameMessage(10, result1.id, 2);

        expect(result2.id).not.toBe(result1.id);
    });

    it('handles null lastMessageId without error', () => {
        expect(() => getShameMessage(5, null, 1)).not.toThrow();
    });

    it('handles sessionCountToday of 0 without error', () => {
        // if sessionCountToday is 0, sessionCountToday % source.length handles properly (0 % N = 0)
        expect(() => getShameMessage(5, null, 0)).not.toThrow();
        const result = getShameMessage(5, null, 0);
        expect(result).toBeDefined();
    });
});
