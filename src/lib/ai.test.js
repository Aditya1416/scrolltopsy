import { SHAME_DICTIONARY, selectTier, getShameMessage } from './ai.js'

// ─── selectTier ───────────────────────────────────────────────────────────────

describe('selectTier', () => {
  it('returns tier1 for 2 minutes', () => {
    expect(selectTier(2)).toBe('tier1')
  })

  it('returns tier2 for 10 minutes', () => {
    expect(selectTier(10)).toBe('tier2')
  })

  it('returns tier3 for 20 minutes', () => {
    expect(selectTier(20)).toBe('tier3')
  })

  it('returns tier4 for 45 minutes', () => {
    expect(selectTier(45)).toBe('tier4')
  })

  it('returns tier5 for 90 minutes', () => {
    expect(selectTier(90)).toBe('tier5')
  })

  it('returns tier1 for 4 minutes (boundary below tier2)', () => {
    expect(selectTier(4)).toBe('tier1')
  })
})

// ─── SHAME_DICTIONARY ─────────────────────────────────────────────────────────

describe('SHAME_DICTIONARY', () => {
  it('has at least 60 total messages across all tiers', () => {
    const total = Object.values(SHAME_DICTIONARY).reduce((sum, arr) => sum + arr.length, 0)
    expect(total).toBeGreaterThanOrEqual(60)
  })

  it('every tier is a non-empty array', () => {
    for (const [tier, messages] of Object.entries(SHAME_DICTIONARY)) {
      expect(Array.isArray(messages), `${tier} should be an array`).toBe(true)
      expect(messages.length, `${tier} should not be empty`).toBeGreaterThan(0)
    }
  })
})

// ─── getShameMessage ──────────────────────────────────────────────────────────

describe('getShameMessage', () => {
  it('returns an object with message and id properties', () => {
    const result = getShameMessage(10, null, 1)
    expect(result).toHaveProperty('message')
    expect(result).toHaveProperty('id')
  })

  it('interpolates {mins} with the actual value', () => {
    // Run across every tier to be sure interpolation works everywhere
    for (const mins of [2, 10, 20, 45, 90]) {
      const { message } = getShameMessage(mins, null, 1)
      if (message.includes(String(mins))) {
        expect(message).not.toContain('{mins}')
      }
    }
  })

  it('does not leave a literal {mins} placeholder in the message', () => {
    for (let i = 0; i < 20; i++) {
      const { message } = getShameMessage(10, null, i)
      expect(message).not.toContain('{mins}')
    }
  })

  it('avoids returning the same id as lastMessageId', () => {
    for (let i = 0; i < 20; i++) {
      const first = getShameMessage(10, null, i)
      const second = getShameMessage(10, first.id, i + 1)
      expect(second.id).not.toBe(first.id)
    }
  })

  it('id follows the tier-N format', () => {
    for (const mins of [2, 10, 20, 45, 90]) {
      const { id } = getShameMessage(mins, null, 1)
      expect(id).toMatch(/^tier\d+-\d+$/)
    }
  })
})
