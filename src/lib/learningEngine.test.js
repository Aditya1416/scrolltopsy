import { IDBFactory } from 'fake-indexeddb'
import { analysePatterns, getPersonalisedGreeting, getContextualSuffix } from './learningEngine.js'

function resetIDB() {
  Object.defineProperty(globalThis, 'indexedDB', {
    value: new IDBFactory(),
    writable: true,
    configurable: true,
  })
}

function seedStorage(sessions, profileOverrides = {}) {
  const data = {
    sessions,
    profile: {
      totalSessions: sessions.length,
      totalMins: sessions.reduce((s, x) => s + x.durationMins, 0),
      longestSessionMins: sessions.length ? Math.max(...sessions.map(x => x.durationMins)) : 0,
      worstHour: -1,
      worstDay: '',
      scrolltype: 'casual self-saboteur',
      ...profileOverrides,
    },
    meta: { firstSessionMs: sessions[0]?.timestamp ?? Date.now() },
  }
  localStorage.setItem('sct_data', JSON.stringify(data))
}

beforeEach(() => {
  resetIDB()
})

// ─── analysePatterns ──────────────────────────────────────────────────────────

describe('analysePatterns', () => {
  it('returns the correct worstHour from mock data', async () => {
    const now = Date.now()
    seedStorage(
      [
        { id: '1', durationMins: 5, hour: 22, day: 'monday', timestamp: now - 1000 },
        { id: '2', durationMins: 5, hour: 22, day: 'monday', timestamp: now - 2000 },
        { id: '3', durationMins: 5, hour: 14, day: 'monday', timestamp: now - 3000 },
      ],
      { worstHour: 22 }
    )
    const patterns = await analysePatterns()
    expect(patterns.worstHour).toBe(22)
  })

  it('returns all ten required pattern keys', async () => {
    const now = Date.now()
    seedStorage([{ id: '1', durationMins: 10, hour: 14, day: 'monday', timestamp: now - 1000 }])
    const patterns = await analysePatterns()
    const required = [
      'worstHour', 'worstDay', 'averageSessionMins', 'streakBroken',
      'relapsing', 'improvingStreak', 'sessionCountToday', 'triggerPattern',
      'peakSessionLength', 'currentMomentumScore',
    ]
    for (const key of required) {
      expect(patterns, `missing key: ${key}`).toHaveProperty(key)
    }
  })
})

// ─── getPersonalisedGreeting ──────────────────────────────────────────────────

describe('getPersonalisedGreeting', () => {
  it('returns "back again" when relapsing', () => {
    vi.setSystemTime(new Date('2026-01-05T14:00:00'))
    localStorage.setItem('sct_patterns', JSON.stringify({
      relapsing: true,
      improvingStreak: 0,
      worstHour: 3,
    }))
    const greeting = getPersonalisedGreeting('Alex')
    expect(greeting).toContain('back again')
    vi.useRealTimers()
  })

  it('returns "right on schedule" when current hour matches worstHour', () => {
    vi.setSystemTime(new Date('2026-01-05T14:00:00'))
    localStorage.setItem('sct_patterns', JSON.stringify({
      relapsing: false,
      improvingStreak: 0,
      worstHour: 14,
    }))
    const greeting = getPersonalisedGreeting('Alex')
    expect(greeting).toContain('right on schedule')
    vi.useRealTimers()
  })
})

// ─── getContextualSuffix ──────────────────────────────────────────────────────

describe('getContextualSuffix', () => {
  it('returns streak message when streakBroken is true', () => {
    const suffix = getContextualSuffix({
      streakBroken: true, isRelapsing: false, timeContext: 'afternoon',
      patternMatch: false, sessionCountToday: 1,
    })
    expect(suffix).toBe('you were doing well.')
  })

  it('returns empty string when no context signal matches', () => {
    const suffix = getContextualSuffix({
      streakBroken: false, isRelapsing: false, timeContext: 'afternoon',
      patternMatch: false, sessionCountToday: 1,
    })
    expect(suffix).toBe('')
  })
})

// ─── triggerPattern ───────────────────────────────────────────────────────────

describe('triggerPattern', () => {
  it('classifies night when 70% of sessions fall in the 22-02 window', async () => {
    const now = Date.now()
    const sessions = [
      ...Array.from({ length: 7 }, (_, i) => ({
        id: `n${i}`, durationMins: 5, hour: 23, day: 'monday', timestamp: now - i * 3600000,
      })),
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `d${i}`, durationMins: 5, hour: 14, day: 'tuesday', timestamp: now - (7 + i) * 3600000,
      })),
    ]
    seedStorage(sessions)
    const patterns = await analysePatterns()
    expect(patterns.triggerPattern).toBe('night')
  })
})
